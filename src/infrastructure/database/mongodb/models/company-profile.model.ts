import { Schema, model, Document } from 'mongoose';

export interface CompanyProfileDocument extends Document {
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

const CompanyProfileSchema = new Schema<CompanyProfileDocument>(
  {
    userId: { type: String, required: true, ref: 'User' },
    companyName: { type: String, required: true },
    logo: { type: String, default: '' },
    banner: { type: String, default: '' },
    websiteLink: { type: String, default: '' },
    employeeCount: { type: Number, default: 0 },
    industry: { type: String, required: true },
    organisation: { type: String, required: true },
    aboutUs: { type: String, default: '' },
    isVerified: { type: String, enum: ['pending', 'rejected', 'verified'], default: 'pending' },
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export const CompanyProfileModel = model<CompanyProfileDocument>(
  'CompanyProfile',
  CompanyProfileSchema,
);
