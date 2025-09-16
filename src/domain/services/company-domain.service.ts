import { ValidationError } from '../errors/errors';

export class CompanyDomainService {
  /**
   * Validates company profile data according to business rules
   */
  static validateCompanyProfile(data: {
    companyName: string;
    email: string;
    website?: string;
    industry: string;
    employees: string;
    description: string;
  }): boolean {
    if (!data.companyName || data.companyName.trim().length < 2) {
      throw new ValidationError('Company name must be at least 2 characters long');
    }

    if (!this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid company email format');
    }

    if (data.website && !this.isValidWebsite(data.website)) {
      throw new ValidationError('Invalid website URL format');
    }

    if (!data.industry || data.industry.trim().length < 2) {
      throw new ValidationError('Industry must be specified');
    }

    if (!this.isValidEmployeeCount(data.employees)) {
      throw new ValidationError('Invalid employee count');
    }

    if (!data.description || data.description.trim().length < 10) {
      throw new ValidationError('Company description must be at least 10 characters long');
    }

    return true;
  }

  /**
   * Validates if a company can be verified
   */
  static canVerifyCompany(companyData: {
    isVerified: boolean;
    hasRequiredDocuments: boolean;
    hasValidEmail: boolean;
  }): boolean {
    if (companyData.isVerified) {
      throw new ValidationError('Company is already verified');
    }

    if (!companyData.hasRequiredDocuments) {
      throw new ValidationError('Company must have all required documents before verification');
    }

    if (!companyData.hasValidEmail) {
      throw new ValidationError('Company must have a valid email address');
    }

    return true;
  }

  /**
   * Validates company verification rejection
   */
  static validateRejectionReason(reason: string): boolean {
    if (!reason || reason.trim().length < 10) {
      throw new ValidationError('Rejection reason must be at least 10 characters long');
    }

    if (reason.length > 500) {
      throw new ValidationError('Rejection reason must not exceed 500 characters');
    }

    return true;
  }

  /**
   * Validates company profile update permissions
   */
  static canUpdateProfile(
    currentUserId: string,
    profileOwnerId: string,
    isVerified: boolean,
  ): boolean {
    if (currentUserId !== profileOwnerId) {
      throw new ValidationError('You can only update your own company profile');
    }

    if (isVerified) {
      throw new ValidationError('Cannot update verified company profile. Contact support for changes.');
    }

    return true;
  }

  /**
   * Validates company logo upload
   */
  static validateLogoUpload(file: {
    size: number;
    mimetype: string;
    originalname: string;
  }): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      throw new ValidationError('Logo file size must not exceed 5MB');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new ValidationError('Logo must be a valid image file (JPEG, PNG, GIF, or WebP)');
    }

    if (!file.originalname || file.originalname.trim().length === 0) {
      throw new ValidationError('Logo file must have a valid name');
    }

    return true;
  }

  /**
   * Validates company contact information
   */
  static validateContactInfo(contactInfo: {
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }): boolean {
    if (contactInfo.phone && !this.isValidPhoneNumber(contactInfo.phone)) {
      throw new ValidationError('Invalid phone number format');
    }

    if (contactInfo.address && contactInfo.address.trim().length < 5) {
      throw new ValidationError('Address must be at least 5 characters long');
    }

    if (contactInfo.city && contactInfo.city.trim().length < 2) {
      throw new ValidationError('City must be at least 2 characters long');
    }

    if (contactInfo.country && contactInfo.country.trim().length < 2) {
      throw new ValidationError('Country must be at least 2 characters long');
    }

    return true;
  }

  /**
   * Private helper methods
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidWebsite(website: string): boolean {
    try {
      const url = new URL(website);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private static isValidEmployeeCount(employees: string): boolean {
    const validCounts = [
      '1-10',
      '11-50',
      '51-200',
      '201-500',
      '501-1000',
      '1000+',
    ];
    return validCounts.includes(employees);
  }

  private static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
}
