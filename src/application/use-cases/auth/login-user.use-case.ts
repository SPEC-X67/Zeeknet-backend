import { injectable, inject } from 'inversify';
import { IAuthService } from '../../interfaces/services/auth.service.interface';
import { RegisterResult } from '../../dto/auth/auth-response.dto';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(TYPES.AuthService)
    private readonly authService: IAuthService,
  ) {}

  async execute(email: string, password: string): Promise<RegisterResult> {
    return this.authService.login(email, password);
  }
}
