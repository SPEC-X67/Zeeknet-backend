import { injectable, inject } from 'inversify';
import { IAuthService } from '../../interfaces/services/auth.service.interface';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class VerifyOtpUseCase {
  constructor(
    @inject(TYPES.AuthService)
    private readonly authService: IAuthService,
  ) {}

  async execute(email: string, code: string): Promise<void> {
    return this.authService.verifyOtp(email, code);
  }
}
