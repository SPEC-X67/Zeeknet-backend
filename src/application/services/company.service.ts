import { injectable, inject } from 'inversify';
import {
  ICompanyService,
  CompanyProfileComplete,
  PaginatedCompaniesResponseDto,
  CompanyProfile,
} from '../interfaces';
import { ICompanyRepository } from '../../domain/repositories';
import {
  CreateCompanyProfileRequestDto,
  SimpleCompanyProfileRequestDto,
  UpdateCompanyProfileRequestDto,
} from '../dto/company';
import {
  GetAllCompaniesRequestDto,
  CompanyVerificationRequestDto,
} from '../dto/admin';
import { TYPES } from '../../infrastructure/di/types';

@injectable()
export class CompanyService implements ICompanyService {
  constructor(
    @inject(TYPES.CompanyRepository)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async createCompanyProfile(
    userId: string,
    profileData: SimpleCompanyProfileRequestDto,
  ): Promise<CompanyProfile> {
    // Create company profile with basic information
    const profileDataObj = {
      userId,
      companyName: profileData.company_name,
      logo: profileData.logo || '',
      banner: '',
      websiteLink: profileData.website || '',
      employeeCount: profileData.employees ? parseInt(profileData.employees.split('-')[0]) : 0,
      industry: profileData.industry,
      organisation: profileData.organisation,
      aboutUs: profileData.description || '',
      isVerified: 'pending' as const,
      isBlocked: false,
    };
    
    const profile = await this.companyRepository.createProfile(profileDataObj);

    // Create contact information if email is provided
    if (profileData.email) {
      await this.companyRepository.createContact({
        companyId: profile.id,
        email: profileData.email,
        phone: '',
        twitterLink: '',
        facebookLink: '',
        linkedin: '',
      });
    }

    // Create verification record if tax_id or business_license is provided
    if (profileData.tax_id || profileData.business_license) {
      await this.companyRepository.createVerification({
        companyId: profile.id,
        taxId: profileData.tax_id || '',
        bsLicenseUrl: profileData.business_license || '',
      });
    }

    return profile;
  }

  async updateCompanyProfile(
    profileId: string,
    updates: UpdateCompanyProfileRequestDto,
  ): Promise<CompanyProfileComplete> {
    const existingProfile =
      await this.companyRepository.getProfileById(profileId);
    if (!existingProfile) {
      throw new Error('Company profile not found');
    }

    // Update profile if provided
    if (updates.profile) {
      await this.companyRepository.updateProfile(profileId, {
        companyName: updates.profile.company_name,
        logo: updates.profile.logo,
        banner: updates.profile.banner,
        websiteLink: updates.profile.website_link,
        employeeCount: updates.profile.employee_count,
        industry: updates.profile.industry,
        aboutUs: updates.profile.about_us,
      });
    }

    // Update contact if provided
    if (updates.contact) {
      await this.companyRepository.updateContact(existingProfile.id, {
        email: updates.contact.email,
        phone: updates.contact.phone,
        twitterLink: updates.contact.twitter_link,
        facebookLink: updates.contact.facebook_link,
        linkedin: updates.contact.linkedin,
      });
    }

    // Update office locations if provided
    if (updates.office_locations) {
      await this.companyRepository.deleteOfficeLocations(existingProfile.id);
      await Promise.all(
        updates.office_locations.map((location: any) =>
          this.companyRepository.createOfficeLocation({
            companyId: existingProfile.id,
            location: location.location,
            officeName: location.office_name,
            address: location.address,
            isHeadquarters: location.is_headquarters,
          }),
        ),
      );
    }

    // Update tech stacks if provided
    if (updates.tech_stacks) {
      await this.companyRepository.deleteTechStacks(existingProfile.id);
      await Promise.all(
        updates.tech_stacks.map((tech: any) =>
          this.companyRepository.createTechStack({
            companyId: existingProfile.id,
            techStack: tech.tech_stack,
          }),
        ),
      );
    }

    // Update perks and benefits if provided
    if (updates.perks_and_benefits) {
      await this.companyRepository.deletePerksAndBenefits(existingProfile.id);
      await Promise.all(
        updates.perks_and_benefits.map((perk: any) =>
          this.companyRepository.createPerksAndBenefits({
            companyId: existingProfile.id,
            perk: perk.perk,
            description: perk.description,
          }),
        ),
      );
    }

    // Update workplace pictures if provided
    if (updates.workplace_pictures) {
      await this.companyRepository.deleteWorkplacePictures(existingProfile.id);
      await Promise.all(
        updates.workplace_pictures.map((picture: any) =>
          this.companyRepository.createWorkplacePicture({
            companyId: existingProfile.id,
            pictureUrl: picture.picture_url,
            caption: picture.caption,
          }),
        ),
      );
    }

    // Return updated complete profile
    const updatedProfile = await this.getCompanyProfile(existingProfile.userId);
    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated profile');
    }

    return updatedProfile;
  }

  async getCompanyProfile(
    userId: string,
  ): Promise<CompanyProfileComplete | null> {
    const profile = await this.companyRepository.getProfileByUserId(userId);
    if (!profile) return null;

    const contact = await this.companyRepository.getContactByCompanyId(
      profile.id,
    );
    const officeLocations =
      await this.companyRepository.getOfficeLocationsByCompanyId(profile.id);
    const techStacks = await this.companyRepository.getTechStacksByCompanyId(
      profile.id,
    );
    const perksAndBenefits =
      await this.companyRepository.getPerksAndBenefitsByCompanyId(profile.id);
    const workplacePictures =
      await this.companyRepository.getWorkplacePicturesByCompanyId(profile.id);

    if (!contact) {
      throw new Error('Contact information not found');
    }

    return {
      profile,
      contact,
      officeLocations,
      techStacks,
      perksAndBenefits,
      workplacePictures,
    };
  }

  async getCompanyProfileById(
    profileId: string,
  ): Promise<CompanyProfileComplete | null> {
    const profile = await this.companyRepository.getProfileById(profileId);
    if (!profile) return null;

    const contact = await this.companyRepository.getContactByCompanyId(
      profile.id,
    );
    const officeLocations =
      await this.companyRepository.getOfficeLocationsByCompanyId(profile.id);
    const techStacks = await this.companyRepository.getTechStacksByCompanyId(
      profile.id,
    );
    const perksAndBenefits =
      await this.companyRepository.getPerksAndBenefitsByCompanyId(profile.id);
    const workplacePictures =
      await this.companyRepository.getWorkplacePicturesByCompanyId(profile.id);

    if (!contact) {
      throw new Error('Contact information not found');
    }

    return {
      profile,
      contact,
      officeLocations,
      techStacks,
      perksAndBenefits,
      workplacePictures,
    };
  }

  async getAllCompanies(
    options: GetAllCompaniesRequestDto,
  ): Promise<PaginatedCompaniesResponseDto> {
    const page = parseInt(options.page);
    const limit = parseInt(options.limit);
    const isBlocked = options.isBlocked ? options.isBlocked === 'true' : undefined;

    const repositoryOptions = {
      page,
      limit,
      search: options.search,
      industry: options.industry,
      isVerified: options.isVerified,
      isBlocked,
    };

    const result = await this.companyRepository.getAllCompanies(repositoryOptions);

    return {
      companies: result.companies,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasNext: page * limit < result.total,
        hasPrev: page > 1,
      },
    };
  }

  async verifyCompany(
    verificationData: CompanyVerificationRequestDto,
  ): Promise<void> {
    await this.companyRepository.updateVerificationStatus(
      verificationData.companyId,
      verificationData.isVerified,
    );
  }

  async blockCompany(companyId: string, isBlocked: boolean): Promise<void> {
    await this.companyRepository.updateProfile(companyId, { isBlocked });
  }
}
