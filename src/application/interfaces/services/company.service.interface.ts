// Company Domain Interfaces
export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  logo: string;
  banner: string;
  websiteLink: string;
  employeeCount: number;
  industry: string;
  organisation: string;
  aboutUs: string;
  isVerified: string; // "pending", "rejected", "verified"
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyContact {
  id: string;
  companyId: string;
  email: string;
  phone: string;
  twitterLink?: string;
  facebookLink?: string;
  linkedin?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfficeLocation {
  id: string;
  companyId: string;
  location: string;
  officeName: string;
  address: string;
  isHeadquarters: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyTechStack {
  id: string;
  companyId: string;
  techStack: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerksAndBenefits {
  id: string;
  companyId: string;
  perk: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkplacePicture {
  id: string;
  companyId: string;
  pictureUrl: string;
  caption: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyProfileComplete {
  profile: CompanyProfile;
  contact: CompanyContact;
  officeLocations: OfficeLocation[];
  techStacks: CompanyTechStack[];
  perksAndBenefits: PerksAndBenefits[];
  workplacePictures: WorkplacePicture[];
}

export interface PaginatedCompaniesResponseDto {
  companies: CompanyProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// DTO type imports (these will be defined in DTOs)
export type SimpleCompanyProfileRequestDto = any; // Will be replaced
export type UpdateCompanyProfileRequestDto = any; // Will be replaced
export type GetAllCompaniesRequestDto = any; // Will be replaced
export type CompanyVerificationRequestDto = any; // Will be replaced

export interface ICompanyService {
  createCompanyProfile(
    userId: string,
    profileData: SimpleCompanyProfileRequestDto,
  ): Promise<CompanyProfile>;
  updateCompanyProfile(
    profileId: string,
    updates: UpdateCompanyProfileRequestDto,
  ): Promise<CompanyProfileComplete>;
  getCompanyProfile(userId: string): Promise<CompanyProfileComplete | null>;
  getCompanyProfileById(
    profileId: string,
  ): Promise<CompanyProfileComplete | null>;
  getAllCompanies(
    options: GetAllCompaniesRequestDto,
  ): Promise<PaginatedCompaniesResponseDto>;
  verifyCompany(verificationData: CompanyVerificationRequestDto): Promise<void>;
  blockCompany(companyId: string, isBlocked: boolean): Promise<void>;
}
