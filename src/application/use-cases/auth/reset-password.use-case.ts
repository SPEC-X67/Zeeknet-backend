import { injectable, inject } from 'inversify';
import { IAuthService } from '../../interfaces/services/auth.service.interface';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class ResetPasswordUseCase {
  constructor(
    @inject(TYPES.AuthService)
    private readonly authService: IAuthService,
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    return this.authService.resetPassword(token, newPassword);
  }
}
