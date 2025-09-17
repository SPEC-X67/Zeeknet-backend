export interface CompanyProfile {
  readonly id: string;
  readonly userId: string;
  readonly companyName: string;
  readonly logo: string;
  readonly banner: string;
  readonly websiteLink: string;
  readonly employeeCount: number;
  readonly industry: string;
  readonly organisation: string;
  readonly aboutUs: string;
  readonly isVerified: 'pending' | 'rejected' | 'verified';
  readonly isBlocked: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CompanyContact {
  readonly id: string;
  readonly companyId: string;
  readonly email: string;
  readonly phone: string;
  readonly twitterLink?: string;
  readonly facebookLink?: string;
  readonly linkedin?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CompanyLocation {
  readonly id: string;
  readonly companyId: string;
  readonly location: string;
  readonly officeName: string;
  readonly address: string;
  readonly isHeadquarters: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CompanyVerification {
  readonly id: string;
  readonly companyId: string;
  readonly taxId: string;
  readonly businessLicenseUrl: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CompanyData {
  profile: CompanyProfile;
  contact: CompanyContact;
  locations: CompanyLocation[];
  verification: CompanyVerification;
  techStacks: string[];
  perksAndBenefits: Array<{
    perk: string;
    description: string;
  }>;
  workplacePictures: Array<{
    pictureUrl: string;
    caption: string;
  }>;
}

export class CompanyProfileFactory {
  static createProfile(
    userId: string,
    companyName: string,
    logo: string,
    banner: string,
    websiteLink: string,
    employeeCount: number,
    industry: string,
    organisation: string,
    aboutUs: string,
  ): Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'> {
    const now = new Date();
    return {
      userId,
      companyName,
      logo,
      banner,
      websiteLink,
      employeeCount,
      industry,
      organisation,
      aboutUs,
      isVerified: 'pending',
      isBlocked: false,
    };
  }

  static createContact(
    companyId: string,
    email: string,
    phone: string,
    socialLinks?: {
      twitter?: string;
      facebook?: string;
      linkedin?: string;
    },
  ): Omit<CompanyContact, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      companyId,
      email,
      phone,
      twitterLink: socialLinks?.twitter,
      facebookLink: socialLinks?.facebook,
      linkedin: socialLinks?.linkedin,
    };
  }

  static createLocation(
    companyId: string,
    location: string,
    officeName: string,
    address: string,
    isHeadquarters: boolean = false,
  ): Omit<CompanyLocation, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      companyId,
      location,
      officeName,
      address,
      isHeadquarters,
    };
  }

  static createVerification(
    companyId: string,
    taxId: string,
    businessLicenseUrl: string,
  ): Omit<CompanyVerification, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      companyId,
      taxId,
      businessLicenseUrl,
    };
  }
}

export class CompanyProfileService {
  static verifyProfile(profile: CompanyProfile): CompanyProfile {
    return {
      ...profile,
      isVerified: 'verified',
      updatedAt: new Date(),
    };
  }

  static rejectProfile(profile: CompanyProfile): CompanyProfile {
    return {
      ...profile,
      isVerified: 'rejected',
      updatedAt: new Date(),
    };
  }

  static blockProfile(profile: CompanyProfile): CompanyProfile {
    return {
      ...profile,
      isBlocked: true,
      updatedAt: new Date(),
    };
  }

  static unblockProfile(profile: CompanyProfile): CompanyProfile {
    return {
      ...profile,
      isBlocked: false,
      updatedAt: new Date(),
    };
  }

  static canBeVerified(profile: CompanyProfile): boolean {
    return profile.isVerified === 'pending' && !profile.isBlocked;
  }

  static isActive(profile: CompanyProfile): boolean {
    return !profile.isBlocked && profile.isVerified === 'verified';
  }
}
