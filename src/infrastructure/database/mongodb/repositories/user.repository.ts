import { injectable } from 'inversify';
import { IUserRepository } from '../../../../domain/repositories';
import { User } from '../../../../domain/entities';
import { UserRole } from '../../../../domain/enums/user-role.enum';
import { UserModel, UserDocument } from '../models/user.model';

@injectable()
export class MongoUserRepository implements IUserRepository {
  async save(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    const created = await UserModel.create(user);
    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { refreshToken }).exec();
  }

  async updateVerificationStatus(
    email: string,
    isVerified: boolean,
  ): Promise<void> {
    await UserModel.findOneAndUpdate({ email }, { isVerified }).exec();
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { password: hashedPassword }).exec();
  }

  async findAllUsers(options: {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    isBlocked?: boolean;
  }): Promise<{ users: User[]; total: number }> {
    const { page, limit, search, role, isBlocked } = options;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      filter.role = role;
    }
    if (isBlocked !== undefined) {
      filter.isBlocked = isBlocked;
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select('-password -refreshToken')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      UserModel.countDocuments(filter),
    ]);

    return {
      users: users.map((user) => this.mapToDomain(user)),
      total,
    };
  }

  async updateUserBlockStatus(id: string, isBlocked: boolean): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { isBlocked }).exec();
  }

  private mapToDomain(doc: UserDocument): User {
    return new User(
      String(doc._id),
      doc.name,
      doc.email,
      doc.password,
      doc.role,
      doc.isVerified,
      doc.isBlocked,
      doc.createdAt,
      doc.updatedAt,
      doc.refreshToken ?? null,
    );
  }
}
