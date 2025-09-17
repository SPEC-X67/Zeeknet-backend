import { UserRole } from '../enums/user-role.enum';

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string | undefined,
    public readonly email: string,
    public readonly password: string,
    public readonly role: UserRole,
    public readonly isVerified: boolean,
    public readonly isBlocked: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly refreshToken?: string | null,
  ) {}

  static create(
    email: string,
    name: string | undefined,
    password: string,
    role: UserRole = UserRole.SEEKER,
    isVerified: boolean = false,
    isBlocked: boolean = false,
  ): User {
    const now = new Date();
    return new User(
      '', 
      name,
      email,
      password,
      role,
      isVerified,
      isBlocked,
      now,
      now,
    );
  }

  updatePassword(newPassword: string): User {
    return new User(
      this.id,
      this.name,
      this.email,
      newPassword,
      this.role,
      this.isVerified,
      this.isBlocked,
      this.createdAt,
      new Date(),
      this.refreshToken,
    );
  }

  updateRefreshToken(refreshToken: string | null): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.password,
      this.role,
      this.isVerified,
      this.isBlocked,
      this.createdAt,
      new Date(),
      refreshToken,
    );
  }

  verify(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.password,
      this.role,
      true,
      this.isBlocked,
      this.createdAt,
      new Date(),
      this.refreshToken,
    );
  }

  block(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.password,
      this.role,
      this.isVerified,
      true,
      this.createdAt,
      new Date(),
      this.refreshToken,
    );
  }

  unblock(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.password,
      this.role,
      this.isVerified,
      false,
      this.createdAt,
      new Date(),
      this.refreshToken,
    );
  }
}
