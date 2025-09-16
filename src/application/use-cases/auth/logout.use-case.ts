import { injectable, inject } from 'inversify';
import { IAuthService } from '../../interfaces/services/auth.service.interface';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class LogoutUseCase {
  constructor(
    @inject(TYPES.AuthService)
    private readonly authService: IAuthService,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    return this.authService.logout(refreshToken);
  }
}
