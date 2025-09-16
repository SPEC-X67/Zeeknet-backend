import { UserRole } from '../../../domain/enums/user-role.enum';
import { User } from '../../../domain/entities/user.entity';
import { RegisterResult } from '../../dto/auth/auth-response.dto';

export interface IAuthService {
  register(
    email: string,
    password: string,
    role?: UserRole,
    name?: string,
  ): Promise<RegisterResult>;
  login(email: string, password: string): Promise<RegisterResult>;
  adminLogin(email: string, password: string): Promise<RegisterResult>;
  refreshToken(refreshToken: string): Promise<RegisterResult>;
  logout(userId: string): Promise<void>;
  loginWithGoogle(idToken: string): Promise<RegisterResult>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<void>;
  getUserById(id: string): Promise<User | null>;
  generateAccessToken(user: User): Promise<string>;
}