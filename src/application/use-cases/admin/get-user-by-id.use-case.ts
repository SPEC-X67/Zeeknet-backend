import { injectable, inject } from 'inversify';
import { IUserManagementService } from '../../interfaces/services/user-management.service.interface';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class GetUserByIdUseCase {
  constructor(
    @inject(TYPES.UserManagementService)
    private readonly userManagementService: IUserManagementService,
  ) {}

  async execute(userId: string): Promise<any> {
    return this.userManagementService.getUserById(userId);
  }
}
