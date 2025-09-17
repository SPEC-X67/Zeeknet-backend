import {
  CompanyProfile,
  CompanyContact,
  CompanyLocation,
  CompanyVerification,
} from '../entities/company-profile.entity';

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
  createLocation(
    location: Omit<CompanyLocation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CompanyLocation>;
  getLocationsByCompanyId(companyId: string): Promise<CompanyLocation[]>;
  deleteLocations(companyId: string): Promise<void>;

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
