import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { IUserRepository } from '../../../domain/repositories';

@injectable()
export class LogoutUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null);
  }
}
