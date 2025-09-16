import { injectable, inject } from 'inversify';
import { IAuthService } from '../../interfaces/services/auth.service.interface';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class GetUserByIdUseCase {
  constructor(
    @inject(TYPES.AuthService)
    private readonly authService: IAuthService,
  ) {}

  async execute(userId: string): Promise<any> {
    return this.authService.getUserById(userId);
  }
}
