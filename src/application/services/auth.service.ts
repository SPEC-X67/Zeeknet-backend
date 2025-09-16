import { injectable, inject } from 'inversify';
import { 
  IAuthService,
  PasswordHasher,
  TokenService,
  GoogleTokenVerifier,
  PasswordResetService,
  OtpService,
  MailerService,
} from '../interfaces';
import { IUserRepository } from '../../domain/repositories';
import { User } from '../../domain/entities/user.entity';
import { AuthTokens, RegisterResult } from '../dto/auth';
import { TYPES } from '../../infrastructure/di/types';
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '../../domain/errors/errors';
import { UserRole } from '../../domain/enums/user-role.enum';
import { otpVerificationTemplate } from '../../infrastructure/messaging/templates/otp-verification.template';
import { passwordResetTemplate } from '../../infrastructure/messaging/templates/password-reset.template';
import { welcomeTemplate } from '../../infrastructure/messaging/templates/welcome.template';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(TYPES.PasswordHasher)
    private readonly passwordHasher: PasswordHasher,
    @inject(TYPES.TokenService) private readonly tokenService: TokenService,
    @inject(TYPES.GoogleTokenVerifier)
    private readonly googleVerifier: GoogleTokenVerifier,
    @inject(TYPES.PasswordResetService)
    private readonly passwordResetService: PasswordResetService,
    @inject(TYPES.OtpService)
    private readonly otpService: OtpService,
    @inject(TYPES.MailerService)
    private readonly mailerService: MailerService,
  ) {}

  async register(
    email: string,
    password: string,
    role: UserRole = UserRole.SEEKER,
    name?: string,
  ): Promise<RegisterResult> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    const hashedPassword = await this.passwordHasher.hash(password);
    const user = await this.userRepository.save({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      isBlocked: false,
    });

    const tokens = this.generateTokens(user);
    const hashedRefresh = await this.passwordHasher.hash(tokens.refreshToken);
    await this.userRepository.updateRefreshToken(user.id, hashedRefresh);

    await this.sendVerificationEmail(email);
    await this.sendWelcomeEmail(email, user.name || 'User');

    return { tokens, user };
  }

  async login(email: string, password: string): Promise<RegisterResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (user.isBlocked) {
      throw new AuthorizationError('User is blocked');
    }

    if (user.role === UserRole.ADMIN) {
      throw new AuthenticationError('Please use admin login endpoint');
    }

    const isPasswordValid = await this.passwordHasher.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Send verification email if user is not verified
    if (!user.isVerified) {
      await this.sendVerificationEmail(email);
    }

    const tokens = this.generateTokens(user);
    const hashedRefresh = await this.passwordHasher.hash(tokens.refreshToken);
    await this.userRepository.updateRefreshToken(user.id, hashedRefresh);

    return { tokens, user };
  }

  async adminLogin(email: string, password: string): Promise<RegisterResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (user.isBlocked) {
      throw new AuthorizationError('User is blocked');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Not authorized as admin');
    }

    const isPasswordValid = await this.passwordHasher.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Send verification email if admin is not verified
    if (!user.isVerified) {
      await this.sendVerificationEmail(email);
    }

    const tokens = this.generateTokens(user);
    const hashedRefresh = await this.passwordHasher.hash(tokens.refreshToken);
    await this.userRepository.updateRefreshToken(user.id, hashedRefresh);

    return { tokens, user };
  }

  async refreshToken(refreshToken: string): Promise<RegisterResult> {
    const payload = this.tokenService.verifyRefresh(refreshToken);
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.refreshToken) {
      throw new AuthenticationError('Invalid refresh token');
    }
    const matches = await this.passwordHasher.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!matches) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const tokens = this.generateTokens(user);
    const hashedRefresh = await this.passwordHasher.hash(tokens.refreshToken);
    await this.userRepository.updateRefreshToken(user.id, hashedRefresh);

    return { tokens, user };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null);
  }

  async loginWithGoogle(idToken: string): Promise<RegisterResult> {
    const profile = await this.googleVerifier.verifyIdToken(idToken);
    let user = await this.userRepository.findByEmail(profile.email);
    if (!user) {
      user = await this.userRepository.save({
        name: profile.name,
        email: profile.email,
        password: await this.passwordHasher.hash('oauth-google'),
        role: UserRole.SEEKER,
        isVerified: profile.emailVerified,
        isBlocked: false,
      });
    }
    
    // Send verification email if user is not verified
    if (!user.isVerified) {
      await this.sendVerificationEmail(user.email);
    }
    
    const tokens = this.generateTokens(user);
    const hashedRefresh = await this.passwordHasher.hash(tokens.refreshToken);
    await this.userRepository.updateRefreshToken(user.id, hashedRefresh);
    return { tokens, user };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('Email not found');
    }

    const token = await this.passwordResetService.generateResetToken(
      user.id,
      user.email,
    );
    await this.passwordResetService.sendResetEmail(user.email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetData = await this.passwordResetService.getResetToken(token);
    if (!resetData) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const hashedPassword = await this.passwordHasher.hash(newPassword);
    await this.userRepository.updatePassword(resetData.userId, hashedPassword);

    // Invalidate the token after successful reset
    await this.passwordResetService.invalidateToken(token);
  }

  async verifyOtp(email: string, code: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValid = await this.otpService.verifyOtp(email, code);
    if (!isValid) {
      throw new ValidationError('Invalid or expired OTP code');
    }

    await this.userRepository.updateVerificationStatus(email, true);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async generateAccessToken(user: User): Promise<string> {
    return this.tokenService.signAccess({ sub: user.id, role: user.role });
  }

  private generateTokens(user: User): AuthTokens {
    const accessToken = this.tokenService.signAccess({
      sub: user.id,
      role: user.role,
    });
    const refreshToken = this.tokenService.signRefresh({ sub: user.id });

    return { accessToken, refreshToken };
  }

  private async sendVerificationEmail(email: string): Promise<void> {
    try {
      const code = await this.otpService.generateAndStoreOtp(email);
      const htmlContent = otpVerificationTemplate.html(code);

      await this.mailerService.sendMail(
        email,
        otpVerificationTemplate.subject,
        htmlContent,
      );
    } catch (error) {
      // Log error but don't throw to avoid breaking registration
      console.error('Failed to send verification email:', error);
    }
  }

  private async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      const dashboardLink = `${process.env.FRONTEND_URL}/dashboard`;
      const htmlContent = welcomeTemplate.html(name, dashboardLink);

      await this.mailerService.sendMail(
        email,
        welcomeTemplate.subject,
        htmlContent,
      );
    } catch (error) {
      // Log error but don't throw to avoid breaking registration
      console.error('Failed to send welcome email:', error);
    }
  }
}
