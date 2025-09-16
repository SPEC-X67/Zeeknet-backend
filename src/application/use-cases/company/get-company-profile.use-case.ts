import { injectable, inject } from 'inversify';
import { ICompanyService } from '../../interfaces/services/company.service.interface';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class GetCompanyProfileUseCase {
  constructor(
    @inject(TYPES.CompanyService)
    private readonly companyService: ICompanyService,
  ) {}

  async execute(userId: string): Promise<any> {
    return this.companyService.getCompanyProfile(userId);
  }
}
