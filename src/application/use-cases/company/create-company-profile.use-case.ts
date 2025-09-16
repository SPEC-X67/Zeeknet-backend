import { injectable, inject } from 'inversify';
import { ICompanyService } from '../../interfaces/services/company.service.interface';
import { SimpleCompanyProfileRequestDto } from '../../dto/company/create-company.dto';
import { TYPES } from '../../../infrastructure/di/types';

@injectable()
export class CreateCompanyProfileUseCase {
  constructor(
    @inject(TYPES.CompanyService)
    private readonly companyService: ICompanyService,
  ) {}

  async execute(
    userId: string,
    data: SimpleCompanyProfileRequestDto,
  ): Promise<any> {
    return this.companyService.createCompanyProfile(userId, data);
  }
}
