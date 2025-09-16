import { injectable, inject } from 'inversify';
import { ICompanyService } from '../../interfaces/services/company.service.interface';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class VerifyCompanyUseCase {
  constructor(
    @inject(TYPES.CompanyService)
    private readonly companyService: ICompanyService,
  ) {}

  async execute(companyId: string, isVerified: boolean): Promise<void> {
    return this.companyService.verifyCompany({
      companyId,
      isVerified: isVerified ? 'verified' : 'rejected',
    });
  }
}
