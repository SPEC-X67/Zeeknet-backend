import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { TYPES } from '../../infrastructure/di/types';
import {
  GetAllUsersDto,
  BlockUserDto,
  GetAllCompaniesDto,
  CompanyVerificationDto,
} from '../../application/dto/admin';
import { ValidationError } from '../../domain/errors/errors';
import {
  GetAllUsersUseCase,
  BlockUserUseCase,
  AdminGetUserByIdUseCase,
  GetAllCompaniesUseCase,
  VerifyCompanyUseCase,
} from '../../application/use-cases';
import { ICompanyService } from '../../application/interfaces/services/company.service.interface';

@injectable()
export class AdminController {
  constructor(
    @inject(TYPES.GetAllUsersUseCase)
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    @inject(TYPES.BlockUserUseCase)
    private readonly blockUserUseCase: BlockUserUseCase,
    @inject(TYPES.AdminGetUserByIdUseCase)
    private readonly getUserByIdUseCase: AdminGetUserByIdUseCase,
    @inject(TYPES.GetAllCompaniesUseCase)
    private readonly getAllCompaniesUseCase: GetAllCompaniesUseCase,
    @inject(TYPES.VerifyCompanyUseCase)
    private readonly verifyCompanyUseCase: VerifyCompanyUseCase,
    @inject(TYPES.CompanyService)
    private readonly companyService: ICompanyService,
  ) {}

  getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = GetAllUsersDto.safeParse(req.query);
    if (!parsed.success) {
      return next(new ValidationError('Invalid query parameters'));
    }

    try {
      const result = await this.getAllUsersUseCase.execute(parsed.data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = BlockUserDto.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError('Invalid block user data'));
    }

    try {
      await this.blockUserUseCase.execute(
        parsed.data.userId,
        parsed.data.isBlocked,
      );
      res.json({
        message: `User ${parsed.data.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { userId } = req.params;
    if (!userId) {
      return next(new ValidationError('User ID is required'));
    }

    try {
      const user = await this.getUserByIdUseCase.execute(userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  getAllCompanies = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = GetAllCompaniesDto.safeParse(req.query);
    if (!parsed.success) {
      return next(new ValidationError('Invalid query parameters'));
    }

    try {
      const result = await this.getAllCompaniesUseCase.execute(parsed.data);
      res.json({
        companies: result.companies,
        pagination: {
          page: parseInt(parsed.data.page),
          limit: parseInt(parsed.data.limit),
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
          hasNext: result.pagination.hasNext,
          hasPrev: result.pagination.hasPrev,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getPendingCompanies = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const options = {
        page: '1',
        limit: '10',
        isVerified: 'pending' as const,
      };

      const result = await this.getAllCompaniesUseCase.execute(options);
      res.json({
        companies: result.companies,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
          hasNext: result.pagination.hasNext,
          hasPrev: result.pagination.hasPrev,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getCompanyById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { companyId } = req.params;
    if (!companyId) {
      return next(new ValidationError('Company ID is required'));
    }

    try {
      const company =
        await this.companyService.getCompanyProfileById(companyId);
      if (!company) {
        return next(new ValidationError('Company not found'));
      }
      res.json(company);
    } catch (error) {
      next(error);
    }
  };

  verifyCompany = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = CompanyVerificationDto.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError('Invalid verification data'));
    }

    try {
      await this.verifyCompanyUseCase.execute(
        parsed.data.companyId,
        parsed.data.isVerified === 'verified',
      );

      res.json({
        message: `Company ${parsed.data.isVerified} successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  blockCompany = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { companyId, isBlocked } = req.body;
    
    if (!companyId || typeof isBlocked !== 'boolean') {
      return next(new ValidationError('Company ID and isBlocked status are required'));
    }

    try {
      await this.companyService.blockCompany(companyId, isBlocked);
      res.json({
        message: `Company ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      });
    } catch (error) {
      next(error);
    }
  };
}
