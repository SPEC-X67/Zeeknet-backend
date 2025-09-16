import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IS3Service, ICompanyService } from '../../application/interfaces';
import { TYPES } from '../../infrastructure/di/types';
import {
  CreateCompanyProfileDto,
  SimpleCompanyProfileDto,
  UpdateCompanyProfileDto,
} from '../../application/dto/company';
import { ValidationError } from '../../domain/errors/errors';
import {
  CreateCompanyProfileUseCase,
  UpdateCompanyProfileUseCase,
  GetCompanyProfileUseCase,
} from '../../application/use-cases';

@injectable()
export class CompanyController {
  constructor(
    @inject(TYPES.CreateCompanyProfileUseCase)
    private readonly createCompanyProfileUseCase: CreateCompanyProfileUseCase,
    @inject(TYPES.UpdateCompanyProfileUseCase)
    private readonly updateCompanyProfileUseCase: UpdateCompanyProfileUseCase,
    @inject(TYPES.GetCompanyProfileUseCase)
    private readonly getCompanyProfileUseCase: GetCompanyProfileUseCase,
    @inject(TYPES.S3Service)
    private readonly s3Service: IS3Service,
    @inject(TYPES.CompanyService)
    private readonly companyService: ICompanyService,
  ) {}

  createCompanyProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = SimpleCompanyProfileDto.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError('Invalid profile data'));
    }

    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return next(new ValidationError('User ID not found'));
      }

      const profile = await this.createCompanyProfileUseCase.execute(
        userId,
        parsed.data,
      );

      res.status(201).json({
        success: true,
        message: 'Company profile created successfully',
        data: {
          id: profile.id,
          company_name: profile.companyName,
          email: parsed.data.email,
          website: profile.websiteLink,
          industry: profile.industry,
          organisation: profile.organisation,
          location: parsed.data.location,
          employees: parsed.data.employees,
          description: profile.aboutUs,
          logo: profile.logo,
          isVerified: profile.isVerified,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  updateCompanyProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = CreateCompanyProfileDto.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError('Invalid company profile data'));
    }

    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return next(new ValidationError('User ID not found'));
      }

      const companyProfile = await this.updateCompanyProfileUseCase.execute(
        userId,
        parsed.data,
      );
      res
        .status(201)
        .json({
          success: true,
          message: 'Company profile created successfully',
          data: companyProfile,
        });
    } catch (error: any) {
      next(error);
    }
  };


  getCompanyProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return next(new ValidationError('User ID not found'));
      }

      const companyProfile =
        await this.getCompanyProfileUseCase.execute(userId);
      if (!companyProfile) {
        res
          .status(404)
          .json({ success: false, message: 'Company profile not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Company profile retrieved successfully',
        data: companyProfile,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getCompanyProfileById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { profileId } = req.params;
      if (!profileId) {
        return next(new ValidationError('Profile ID is required'));
      }

      const companyProfile =
        await this.companyService.getCompanyProfileById(profileId);
      if (!companyProfile) {
        res
          .status(404)
          .json({ success: false, message: 'Company profile not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Company profile retrieved successfully',
        data: companyProfile,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getCompanyDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return next(new ValidationError('User ID not found'));
      }

      const companyProfile =
        await this.companyService.getCompanyProfile(userId);

      res.json({
        success: true,
        message: 'Company dashboard data retrieved successfully',
        data: {
          hasProfile: !!companyProfile,
          profile: companyProfile,
          profileStatus: companyProfile?.profile.isVerified || 'not_created',
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Upload company logo
  uploadLogo = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      const { buffer, originalname, mimetype } = req.file;
      
      // Upload to S3
      const imageUrl = await this.s3Service.uploadImage(
        buffer,
        originalname,
        mimetype,
      );

      res.json({
        success: true,
        message: 'Logo uploaded successfully',
        data: {
          url: imageUrl,
          filename: originalname,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Upload business license
  uploadBusinessLicense = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      const { buffer, originalname, mimetype } = req.file;
      
      // Upload to S3
      const imageUrl = await this.s3Service.uploadImage(
        buffer,
        originalname,
        mimetype,
      );

      res.json({
        success: true,
        message: 'Business license uploaded successfully',
        data: {
          url: imageUrl,
          filename: originalname,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Delete uploaded image
  deleteImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        res.status(400).json({
          success: false,
          message: 'Image URL is required',
        });
        return;
      }

      await this.s3Service.deleteImage(imageUrl);

      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };
}
