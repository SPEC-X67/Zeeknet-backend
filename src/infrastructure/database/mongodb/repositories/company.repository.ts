import { injectable } from 'inversify';
import { ICompanyRepository, CompanyVerification } from '../../../../domain/repositories';
import {
  CompanyProfile,
  CompanyContact,
  OfficeLocation,
  CompanyTechStack,
  PerksAndBenefits,
  WorkplacePicture,
} from '../../../../domain/entities';
import { CompanyProfileModel } from '../models/company-profile.model';
import { CompanyContactModel } from '../models/company-contact.model';
import { OfficeLocationModel } from '../models/office-location.model';
import { CompanyTechStackModel } from '../models/company-tech-stack.model';
import { PerksAndBenefitsModel } from '../models/perks-and-benefits.model';
import { WorkplacePictureModel } from '../models/workplace-pictures.model';
import { CompanyVerificationModel } from '../models/company-verification.model';

@injectable()
export class MongoCompanyRepository implements ICompanyRepository {
  // Profile operations
  async createProfile(
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
  ): Promise<CompanyProfile> {
    const created = await CompanyProfileModel.create(profile);
    return this.mapToProfile(created);
  }

  async getProfileByUserId(userId: string): Promise<CompanyProfile | null> {
    const doc = await CompanyProfileModel.findOne({ userId }).exec();
    return doc ? this.mapToProfile(doc) : null;
  }

  async getProfileById(profileId: string): Promise<CompanyProfile | null> {
    const doc = await CompanyProfileModel.findById(profileId).exec();
    return doc ? this.mapToProfile(doc) : null;
  }

  async updateProfile(
    profileId: string,
    updates: Partial<CompanyProfile>,
  ): Promise<CompanyProfile> {
    const updated = await CompanyProfileModel.findByIdAndUpdate(
      profileId,
      updates,
      { new: true },
    ).exec();
    if (!updated) throw new Error('Profile not found');
    return this.mapToProfile(updated);
  }

  // Contact operations
  async createContact(
    contact: Omit<CompanyContact, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CompanyContact> {
    const created = await CompanyContactModel.create(contact);
    return this.mapToContact(created);
  }

  async getContactByCompanyId(
    companyId: string,
  ): Promise<CompanyContact | null> {
    const doc = await CompanyContactModel.findOne({ companyId }).exec();
    return doc ? this.mapToContact(doc) : null;
  }

  async updateContact(
    companyId: string,
    updates: Partial<CompanyContact>,
  ): Promise<CompanyContact> {
    const updated = await CompanyContactModel.findOneAndUpdate(
      { companyId },
      updates,
      { new: true },
    ).exec();
    if (!updated) throw new Error('Contact not found');
    return this.mapToContact(updated);
  }

  // Office location operations
  async createOfficeLocation(
    location: Omit<OfficeLocation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<OfficeLocation> {
    const created = await OfficeLocationModel.create(location);
    return this.mapToOfficeLocation(created);
  }

  async getOfficeLocationsByCompanyId(
    companyId: string,
  ): Promise<OfficeLocation[]> {
    const docs = await OfficeLocationModel.find({ companyId }).exec();
    return docs.map((doc) => this.mapToOfficeLocation(doc));
  }

  async deleteOfficeLocations(companyId: string): Promise<void> {
    await OfficeLocationModel.deleteMany({ companyId }).exec();
  }

  // Tech stack operations
  async createTechStack(
    techStack: Omit<CompanyTechStack, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CompanyTechStack> {
    const created = await CompanyTechStackModel.create(techStack);
    return this.mapToTechStack(created);
  }

  async getTechStacksByCompanyId(
    companyId: string,
  ): Promise<CompanyTechStack[]> {
    const docs = await CompanyTechStackModel.find({ companyId }).exec();
    return docs.map((doc) => this.mapToTechStack(doc));
  }

  async deleteTechStacks(companyId: string): Promise<void> {
    await CompanyTechStackModel.deleteMany({ companyId }).exec();
  }

  // Perks and benefits operations
  async createPerksAndBenefits(
    perk: Omit<PerksAndBenefits, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PerksAndBenefits> {
    const created = await PerksAndBenefitsModel.create(perk);
    return this.mapToPerksAndBenefits(created);
  }

  async getPerksAndBenefitsByCompanyId(
    companyId: string,
  ): Promise<PerksAndBenefits[]> {
    const docs = await PerksAndBenefitsModel.find({ companyId }).exec();
    return docs.map((doc) => this.mapToPerksAndBenefits(doc));
  }

  async deletePerksAndBenefits(companyId: string): Promise<void> {
    await PerksAndBenefitsModel.deleteMany({ companyId }).exec();
  }

  // Workplace pictures operations
  async createWorkplacePicture(
    picture: Omit<WorkplacePicture, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<WorkplacePicture> {
    const created = await WorkplacePictureModel.create(picture);
    return this.mapToWorkplacePicture(created);
  }

  async getWorkplacePicturesByCompanyId(
    companyId: string,
  ): Promise<WorkplacePicture[]> {
    const docs = await WorkplacePictureModel.find({ companyId }).exec();
    return docs.map((doc) => this.mapToWorkplacePicture(doc));
  }

  async deleteWorkplacePictures(companyId: string): Promise<void> {
    await WorkplacePictureModel.deleteMany({ companyId }).exec();
  }

  // Company listing operations
  async getAllCompanies(options: {
    page: number;
    limit: number;
    search?: string;
    industry?: string;
    isVerified?: 'pending' | 'rejected' | 'verified';
    isBlocked?: boolean;
  }): Promise<{ companies: CompanyProfile[]; total: number }> {
    const { page, limit, search, industry, isVerified, isBlocked } = options;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
      ];
    }
    if (industry) {
      filter.industry = industry;
    }
    if (isVerified) {
      filter.isVerified = isVerified;
    }
    if (isBlocked !== undefined) {
      filter.isBlocked = isBlocked;
    }

    const [companies, total] = await Promise.all([
      CompanyProfileModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      CompanyProfileModel.countDocuments(filter),
    ]);

    return {
      companies: companies.map((company) => this.mapToProfile(company)),
      total,
    };
  }

  // Verification operations

  // Mapping methods
  private mapToProfile(doc: any): CompanyProfile {
    return new CompanyProfile(
      String(doc._id),
      doc.userId,
      doc.companyName,
      doc.logo,
      doc.banner,
      doc.websiteLink,
      doc.employeeCount,
      doc.industry,
      doc.organisation,
      doc.aboutUs,
      doc.isVerified,
      doc.isBlocked,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  private mapToContact(doc: any): CompanyContact {
    return new CompanyContact(
      String(doc._id),
      doc.companyId,
      doc.email,
      doc.phone,
      doc.twitterLink,
      doc.facebookLink,
      doc.linkedin,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  private mapToOfficeLocation(doc: any): OfficeLocation {
    return new OfficeLocation(
      String(doc._id),
      doc.companyId,
      doc.location,
      doc.officeName,
      doc.address,
      doc.isHeadquarters,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  private mapToTechStack(doc: any): CompanyTechStack {
    return new CompanyTechStack(
      String(doc._id),
      doc.companyId,
      doc.techStack,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  private mapToPerksAndBenefits(doc: any): PerksAndBenefits {
    return new PerksAndBenefits(
      String(doc._id),
      doc.companyId,
      doc.perk,
      doc.description,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  private mapToWorkplacePicture(doc: any): WorkplacePicture {
    return new WorkplacePicture(
      String(doc._id),
      doc.companyId,
      doc.pictureUrl,
      doc.caption,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  // Verification operations
  async createVerification(
    verification: Omit<CompanyVerification, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CompanyVerification> {
    const created = await CompanyVerificationModel.create(verification);
    return this.mapToVerification(created);
  }

  async getVerificationByCompanyId(companyId: string): Promise<CompanyVerification | null> {
    const doc = await CompanyVerificationModel.findOne({ companyId }).exec();
    return doc ? this.mapToVerification(doc) : null;
  }

  async updateVerificationStatus(
    companyId: string,
    isVerified: 'pending' | 'rejected' | 'verified',
  ): Promise<void> {
    await CompanyProfileModel.findOneAndUpdate(
      { _id: companyId },
      { isVerified },
    ).exec();
  }

  private mapToVerification(doc: any): CompanyVerification {
    return {
      id: String(doc._id),
      companyId: doc.companyId,
      taxId: doc.taxId,
      bsLicenseUrl: doc.bsLicenseUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
