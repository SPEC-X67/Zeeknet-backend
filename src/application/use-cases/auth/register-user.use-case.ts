import { injectable, inject } from 'inversify';
import { IAuthService } from '../../interfaces/services/auth.service.interface';
import { RegisterResult } from '../../dto/auth/auth-response.dto';
import { TYPES } from '../../../infrastructure/di/types';
import { UserRole } from '../../../domain/enums/user-role.enum';

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TYPES.AuthService)
    private readonly authService: IAuthService,
  ) {}

  async execute(
    email: string,
    password: string,
    role?: UserRole,
    name?: string,
  ): Promise<RegisterResult> {
    return this.authService.register(email, password, role, name);
  }
}
