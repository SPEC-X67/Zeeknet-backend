import { injectable, inject } from 'inversify';
import { RegisterResult } from '../../dto/auth/auth-response.dto';
import { TYPES } from '../../../infrastructure/di/types';
import { IUserRepository } from '../../../domain/repositories';
import { PasswordHasher, TokenService } from '../../interfaces/infrastructure';
import { AuthenticationError, NotFoundError } from '../../../domain/errors/errors';

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(TYPES.PasswordHasher)
    private readonly passwordHasher: PasswordHasher,
    @inject(TYPES.TokenService)
    private readonly tokenService: TokenService,
  ) {}

  async execute(refreshToken: string): Promise<RegisterResult> {
    const payload = this.tokenService.verifyRefresh(refreshToken);
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    if (!user.refreshToken) {
      throw new AuthenticationError('Invalid refresh token');
    }
    const matches = await this.passwordHasher.compare(refreshToken, user.refreshToken);
    if (!matches) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const accessToken = this.tokenService.signAccess({ sub: user.id, role: user.role });
    const newRefreshToken = this.tokenService.signRefresh({ sub: user.id });
    const hashedRefresh = await this.passwordHasher.hash(newRefreshToken);
    await this.userRepository.updateRefreshToken(user.id, hashedRefresh);

    return {
      tokens: { accessToken, refreshToken: newRefreshToken },
      user,
    };
  }
}
