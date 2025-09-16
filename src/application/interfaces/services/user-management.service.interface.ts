import { UserRole } from '../../../domain/enums/user-role.enum';

export interface UserResponseDto {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedUsersResponseDto {
  users: UserResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IUserManagementService {
  getAllUsers(options: {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    isBlocked?: boolean;
  }): Promise<PaginatedUsersResponseDto>;
  blockUser(userId: string, isBlocked: boolean): Promise<void>;
  getUserById(userId: string): Promise<UserResponseDto>;
}
