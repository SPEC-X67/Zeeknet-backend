import { User } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';

// Data interface for repository operations
export interface UserData {
  id?: string;
  name?: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  refreshToken?: string | null;
}

export interface IUserRepository {
  save(user: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;
  updateVerificationStatus(email: string, isVerified: boolean): Promise<void>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  findAllUsers(options: {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    isBlocked?: boolean;
  }): Promise<{ users: User[]; total: number }>;
  updateUserBlockStatus(id: string, isBlocked: boolean): Promise<void>;
}
