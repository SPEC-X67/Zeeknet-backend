import { z } from 'zod';

export const CompanyContactDto = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  twitter_link: z.string().url().optional(),
  facebook_link: z.string().url().optional(),
  linkedin: z.string().url().optional(),
});

export const OfficeLocationDto = z.object({
  location: z.string().min(1),
  office_name: z.string().min(1),
  address: z.string().min(1),
  is_headquarters: z.boolean().default(false),
});

export const TechStackDto = z.object({
  tech_stack: z.string().min(1),
});

export const PerksAndBenefitsDto = z.object({
  perk: z.string().min(1),
  description: z.string().min(1),
});

export const WorkplacePictureDto = z.object({
  picture_url: z.string().url(),
  caption: z.string().min(1),
});

export const CompanyProfileDto = z.object({
  company_name: z.string().min(1),
  logo: z.string().url(),
  banner: z.string().url(),
  website_link: z.string().url(),
  employee_count: z.number().min(1),
  industry: z.string().min(1),
  about_us: z.string().min(10),
});

export const CreateCompanyProfileDto = z.object({
  profile: CompanyProfileDto,
  contact: CompanyContactDto,
  office_locations: z.array(OfficeLocationDto).min(1),
  tech_stacks: z.array(TechStackDto).min(1),
  perks_and_benefits: z.array(PerksAndBenefitsDto).min(1),
  workplace_pictures: z.array(WorkplacePictureDto).min(1),
});

export const SimpleCompanyProfileDto = z.object({
  company_name: z.string().min(1),
  email: z.string().email(),
  website: z.string().url().optional(),
  industry: z.string().min(1),
  organisation: z.string().min(1),
  location: z.string().min(1),
  employees: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  business_license: z.string().optional(),
  tax_id: z.string().optional(),
});

export const UpdateCompanyProfileDto = z.object({
  profile: CompanyProfileDto.partial(),
  contact: CompanyContactDto.partial().optional(),
  office_locations: z.array(OfficeLocationDto).optional(),
  tech_stacks: z.array(TechStackDto).optional(),
  perks_and_benefits: z.array(PerksAndBenefitsDto).optional(),
  workplace_pictures: z.array(WorkplacePictureDto).optional(),
});

// Type exports
export type CompanyProfileRequestDto = z.infer<typeof CompanyProfileDto>;
export type CompanyContactRequestDto = z.infer<typeof CompanyContactDto>;
export type OfficeLocationRequestDto = z.infer<typeof OfficeLocationDto>;
export type TechStackRequestDto = z.infer<typeof TechStackDto>;
export type PerksAndBenefitsRequestDto = z.infer<typeof PerksAndBenefitsDto>;
export type WorkplacePictureRequestDto = z.infer<typeof WorkplacePictureDto>;
export type CreateCompanyProfileRequestDto = z.infer<typeof CreateCompanyProfileDto>;
export type SimpleCompanyProfileRequestDto = z.infer<typeof SimpleCompanyProfileDto>;
export type UpdateCompanyProfileRequestDto = z.infer<typeof UpdateCompanyProfileDto>;
