import { injectable, inject } from 'inversify';
import { ICompanyService } from '../../interfaces/services/company.service.interface';
import { GetAllCompaniesRequestDto } from '../../dto/admin/user-management.dto';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class GetAllCompaniesUseCase {
  constructor(
    @inject(TYPES.CompanyService)
    private readonly companyService: ICompanyService,
  ) {}

  async execute(options: GetAllCompaniesRequestDto): Promise<any> {
    const convertedOptions = {
      page: parseInt(options.page),
      limit: parseInt(options.limit),
      search: options.search,
      industry: options.industry,
      isVerified: options.isVerified,
      isBlocked: options.isBlocked ? options.isBlocked === 'true' : undefined,
    };
    return this.companyService.getAllCompanies(convertedOptions);
  }
}
