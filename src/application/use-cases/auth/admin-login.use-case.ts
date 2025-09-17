import { injectable, inject } from 'inversify';
import { RegisterResult } from '../../dto/auth/auth-response.dto';
import { TYPES } from '../../../infrastructure/di/types';
import { IUserRepository } from '../../../domain/repositories';
import { PasswordHasher, TokenService, OtpService, MailerService } from '../../interfaces/infrastructure';
import { AuthenticationError, AuthorizationError } from '../../../domain/errors/errors';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { otpVerificationTemplate } from '../../../infrastructure/messaging/templates/otp-verification.template';

@injectable()
export class AdminLoginUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(TYPES.PasswordHasher)
    private readonly passwordHasher: PasswordHasher,
    @inject(TYPES.TokenService)
    private readonly tokenService: TokenService,
    @inject(TYPES.OtpService)
    private readonly otpService: OtpService,
    @inject(TYPES.MailerService)
    private readonly mailerService: MailerService,
  ) {}

  async execute(email: string, password: string): Promise<RegisterResult> {
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

    const isPasswordValid = await this.passwordHasher.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (!user.isVerified) {
      try {
        const code = await this.otpService.generateAndStoreOtp(email);
        const htmlContent = otpVerificationTemplate.html(code);
        await this.mailerService.sendMail(email, otpVerificationTemplate.subject, htmlContent);
      } catch (_err) {}
    }

    const accessToken = this.tokenService.signAccess({ sub: user.id, role: user.role });
    const refreshToken = this.tokenService.signRefresh({ sub: user.id });
    const hashedRefresh = await this.passwordHasher.hash(refreshToken);
    await this.userRepository.updateRefreshToken(user.id, hashedRefresh);

    return {
      tokens: { accessToken, refreshToken },
      user,
    };
  }
}
