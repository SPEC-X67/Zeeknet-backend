import { injectable, inject } from 'inversify';
import { IUserManagementService } from '../../interfaces/services/user-management.service.interface';
import { GetAllUsersRequestDto } from '../../dto/admin/user-management.dto';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class GetAllUsersUseCase {
  constructor(
    @inject(TYPES.UserManagementService)
    private readonly userManagementService: IUserManagementService,
  ) {}

  async execute(options: GetAllUsersRequestDto): Promise<any> {
    const convertedOptions = {
      page: parseInt(options.page),
      limit: parseInt(options.limit),
      search: options.search,
      role: options.role,
      isBlocked: options.isBlocked ? options.isBlocked === 'true' : undefined,
    };
    return this.userManagementService.getAllUsers(convertedOptions);
  }
}
