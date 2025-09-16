import { injectable, inject } from 'inversify';
import { IAuthService } from '../../interfaces/services/auth.service.interface';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class ForgotPasswordUseCase {
  constructor(
    @inject(TYPES.AuthService)
    private readonly authService: IAuthService,
  ) {}

  async execute(email: string): Promise<void> {
    return this.authService.forgotPassword(email);
  }
}
