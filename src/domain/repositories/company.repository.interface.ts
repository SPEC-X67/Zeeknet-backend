import {
  CompanyProfile,
  CompanyContact,
  OfficeLocation,
  CompanyTechStack,
  PerksAndBenefits,
  WorkplacePicture,
} from '../entities/company.entity';

export interface CompanyVerification {
  id: string;
  companyId: string;
  taxId: string;
  bsLicenseUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompanyRepository {
  // Profile operations
  createProfile(
    profile: {
      userId: string;
      companyName: string;
      logo: string;
      banner: string;
      websiteLink: string;
      employeeCount: number;
      industry: string;
      organisation: string;
      aboutUs: string;
      isVerified: 'pending' | 'rejected' | 'verified';
      isBlocked: boolean;
    },
  ): Promise<CompanyProfile>;
  getProfileByUserId(userId: string): Promise<CompanyProfile | null>;
  getProfileById(profileId: string): Promise<CompanyProfile | null>;
  updateProfile(
    profileId: string,
    updates: Partial<CompanyProfile>,
  ): Promise<CompanyProfile>;

  // Contact operations
  createContact(
    contact: Omit<CompanyContact, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CompanyContact>;
  getContactByCompanyId(companyId: string): Promise<CompanyContact | null>;
  updateContact(
    companyId: string,
    updates: Partial<CompanyContact>,
  ): Promise<CompanyContact>;

  // Office location operations
  createOfficeLocation(
    location: Omit<OfficeLocation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<OfficeLocation>;
  getOfficeLocationsByCompanyId(companyId: string): Promise<OfficeLocation[]>;
  deleteOfficeLocations(companyId: string): Promise<void>;

  // Tech stack operations
  createTechStack(
    techStack: Omit<CompanyTechStack, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CompanyTechStack>;
  getTechStacksByCompanyId(companyId: string): Promise<CompanyTechStack[]>;
  deleteTechStacks(companyId: string): Promise<void>;

  // Perks and benefits operations
  createPerksAndBenefits(
    perk: Omit<PerksAndBenefits, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PerksAndBenefits>;
  getPerksAndBenefitsByCompanyId(
    companyId: string,
  ): Promise<PerksAndBenefits[]>;
  deletePerksAndBenefits(companyId: string): Promise<void>;

  // Workplace pictures operations
  createWorkplacePicture(
    picture: Omit<WorkplacePicture, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<WorkplacePicture>;
  getWorkplacePicturesByCompanyId(
    companyId: string,
  ): Promise<WorkplacePicture[]>;
  deleteWorkplacePictures(companyId: string): Promise<void>;

  // Company listing operations
  getAllCompanies(options: {
    page: number;
    limit: number;
    search?: string;
    industry?: string;
    isVerified?: 'pending' | 'rejected' | 'verified';
    isBlocked?: boolean;
  }): Promise<{ companies: CompanyProfile[]; total: number }>;

  // Verification operations
  createVerification(
    verification: Omit<CompanyVerification, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CompanyVerification>;
  getVerificationByCompanyId(companyId: string): Promise<CompanyVerification | null>;
  updateVerificationStatus(
    companyId: string,
    isVerified: 'pending' | 'rejected' | 'verified',
  ): Promise<void>;
}
