import { injectable, inject } from 'inversify';
import {
  IUserManagementService,
  UserResponseDto,
  PaginatedUsersResponseDto,
} from '../interfaces';
import { IUserRepository } from '../../domain/repositories';
import { User } from '../../domain/entities/user.entity';
import { TYPES } from '../../infrastructure/di/types';
import { NotFoundError } from '../../domain/errors/errors';
import { UserRole } from '../../domain/enums/user-role.enum';

@injectable()
export class UserManagementService implements IUserManagementService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async getAllUsers(options: {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    isBlocked?: boolean;
  }): Promise<PaginatedUsersResponseDto> {
    const result = await this.userRepository.findAllUsers(options);

    return {
      users: result.users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      pagination: {
        page: options.page,
        limit: options.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / options.limit),
        hasNext: options.page * options.limit < result.total,
        hasPrev: options.page > 1,
      },
    };
  }

  async blockUser(userId: string, isBlocked: boolean): Promise<void> {
    await this.userRepository.updateUserBlockStatus(userId, isBlocked);
  }

  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
