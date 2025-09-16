import { injectable, inject } from 'inversify';
import { ICompanyService } from '../../interfaces/services/company.service.interface';
import { UpdateCompanyProfileRequestDto } from '../../dto/company/create-company.dto';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class UpdateCompanyProfileUseCase {
  constructor(
    @inject(TYPES.CompanyService)
    private readonly companyService: ICompanyService,
  ) {}

  async execute(
    userId: string,
    data: UpdateCompanyProfileRequestDto,
  ): Promise<any> {
    return this.companyService.updateCompanyProfile(userId, data);
  }
}
