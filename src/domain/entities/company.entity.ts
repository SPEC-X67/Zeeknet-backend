export class CompanyProfile {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly companyName: string,
    public readonly logo: string,
    public readonly banner: string,
    public readonly websiteLink: string,
    public readonly employeeCount: number,
    public readonly industry: string,
    public readonly organisation: string,
    public readonly aboutUs: string,
    public readonly isVerified: string, // "pending", "rejected", "verified"
    public readonly isBlocked: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    userId: string,
    companyName: string,
    logo: string,
    banner: string,
    websiteLink: string,
    employeeCount: number,
    industry: string,
    organisation: string,
    aboutUs: string,
  ): CompanyProfile {
    const now = new Date();
    return new CompanyProfile(
      '', // ID will be set by the repository
      userId,
      companyName,
      logo,
      banner,
      websiteLink,
      employeeCount,
      industry,
      organisation,
      aboutUs,
      'pending', // isVerified - default to pending
      false, // isBlocked - default to false
      now,
      now,
    );
  }

  verify(): CompanyProfile {
    return new CompanyProfile(
      this.id,
      this.userId,
      this.companyName,
      this.logo,
      this.banner,
      this.websiteLink,
      this.employeeCount,
      this.industry,
      this.organisation,
      this.aboutUs,
      'verified',
      this.isBlocked,
      this.createdAt,
      new Date(),
    );
  }

  reject(): CompanyProfile {
    return new CompanyProfile(
      this.id,
      this.userId,
      this.companyName,
      this.logo,
      this.banner,
      this.websiteLink,
      this.employeeCount,
      this.industry,
      this.organisation,
      this.aboutUs,
      'rejected',
      this.isBlocked,
      this.createdAt,
      new Date(),
    );
  }
}

export class CompanyContact {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly twitterLink?: string,
    public readonly facebookLink?: string,
    public readonly linkedin?: string,
  ) {}

  static create(
    companyId: string,
    email: string,
    phone: string,
    twitterLink?: string,
    facebookLink?: string,
    linkedin?: string,
  ): CompanyContact {
    const now = new Date();
    return new CompanyContact(
      '', // ID will be set by the repository
      companyId,
      email,
      phone,
      now,
      now,
      twitterLink,
      facebookLink,
      linkedin,
    );
  }
}

export class OfficeLocation {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly location: string,
    public readonly officeName: string,
    public readonly address: string,
    public readonly isHeadquarters: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    companyId: string,
    location: string,
    officeName: string,
    address: string,
    isHeadquarters: boolean = false,
  ): OfficeLocation {
    const now = new Date();
    return new OfficeLocation(
      '', // ID will be set by the repository
      companyId,
      location,
      officeName,
      address,
      isHeadquarters,
      now,
      now,
    );
  }
}

export class CompanyTechStack {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly techStack: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(companyId: string, techStack: string): CompanyTechStack {
    const now = new Date();
    return new CompanyTechStack('', companyId, techStack, now, now);
  }
}

export class PerksAndBenefits {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly perk: string,
    public readonly description: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    companyId: string,
    perk: string,
    description: string,
  ): PerksAndBenefits {
    const now = new Date();
    return new PerksAndBenefits('', companyId, perk, description, now, now);
  }
}

export class WorkplacePicture {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly pictureUrl: string,
    public readonly caption: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    companyId: string,
    pictureUrl: string,
    caption: string,
  ): WorkplacePicture {
    const now = new Date();
    return new WorkplacePicture('', companyId, pictureUrl, caption, now, now);
  }
}

export class CompanyVerification {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly taxId: string,
    public readonly bsLicenseUrl: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    companyId: string,
    taxId: string,
    bsLicenseUrl: string,
  ): CompanyVerification {
    const now = new Date();
    return new CompanyVerification(
      '', // ID will be set by the repository
      companyId,
      taxId,
      bsLicenseUrl,
      now,
      now,
    );
  }
}
