import { User } from '../../../domain/entities/user.entity';

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult {
  tokens: AuthTokens;
  user: User;
}