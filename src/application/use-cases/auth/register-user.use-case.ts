import { injectable, inject } from 'inversify';
import { RegisterResult } from '../../dto/auth/auth-response.dto';
import { TYPES } from '../../../infrastructure/di/types';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IUserRepository } from '../../../domain/repositories';
import { PasswordHasher, OtpService, MailerService, TokenService } from '../../interfaces/infrastructure';
import { ValidationError } from '../../../domain/errors/errors';
import { welcomeTemplate } from '../../../infrastructure/messaging/templates/welcome.template';
import { otpVerificationTemplate } from '../../../infrastructure/messaging/templates/otp-verification.template';

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(TYPES.PasswordHasher)
    private readonly passwordHasher: PasswordHasher,
    @inject(TYPES.OtpService)
    private readonly otpService: OtpService,
    @inject(TYPES.MailerService)
    private readonly mailerService: MailerService,
    @inject(TYPES.TokenService)
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    email: string,
    password: string,
    role?: UserRole,
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
      role: role ?? UserRole.SEEKER,
      isVerified: false,
      isBlocked: false,
    });

    const accessToken = this.tokenService.signAccess({ sub: user.id, role: user.role });
    const refreshToken = this.tokenService.signRefresh({ sub: user.id });
    const hashedRefresh = await this.passwordHasher.hash(refreshToken);
    await this.userRepository.updateRefreshToken(user.id, hashedRefresh);

    try {
      const code = await this.otpService.generateAndStoreOtp(email);
      const htmlContent = otpVerificationTemplate.html(code);
      await this.mailerService.sendMail(email, otpVerificationTemplate.subject, htmlContent);
    } catch (_err) {}

    try {
      const dashboardLink = `${process.env.FRONTEND_URL}/dashboard`;
      const htmlContent = welcomeTemplate.html(name || 'User', dashboardLink);
      await this.mailerService.sendMail(email, welcomeTemplate.subject, htmlContent);
    } catch (_err) {}

    return { tokens: { accessToken, refreshToken }, user };
  }
}
