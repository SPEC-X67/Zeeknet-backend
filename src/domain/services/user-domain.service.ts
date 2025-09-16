import { ValidationError } from '../errors/errors';
import { UserRole } from '../enums/user-role.enum';

export class UserDomainService {
  /**
   * Validates if a user can register with the given email and role
   */
  static canUserRegister(email: string, role: UserRole): boolean {
    if (!this.isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!this.isValidRole(role)) {
      throw new ValidationError('Invalid user role');
    }

    return true;
  }

  /**
   * Validates password strength according to business rules
   */
  static validatePasswordStrength(password: string): boolean {
    if (!password || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new ValidationError('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new ValidationError('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new ValidationError('Password must contain at least one special character (@$!%*?&)');
    }

    return true;
  }

  /**
   * Validates if a user can be blocked/unblocked
   */
  static canBlockUser(userRole: UserRole, targetRole: UserRole): boolean {
    // Only admins can block users
    if (userRole !== UserRole.ADMIN) {
      throw new ValidationError('Only administrators can block users');
    }

    // Admins cannot block other admins
    if (targetRole === UserRole.ADMIN) {
      throw new ValidationError('Cannot block administrator accounts');
    }

    return true;
  }

  /**
   * Validates if a user can perform admin actions
   */
  static canPerformAdminAction(userRole: UserRole): boolean {
    if (userRole !== UserRole.ADMIN) {
      throw new ValidationError('Only administrators can perform this action');
    }

    return true;
  }

  /**
   * Validates if a user can access company features
   */
  static canAccessCompanyFeatures(userRole: UserRole): boolean {
    if (userRole !== UserRole.COMPANY) {
      throw new ValidationError('Only company accounts can access company features');
    }

    return true;
  }

  /**
   * Validates if a user can access seeker features
   */
  static canAccessSeekerFeatures(userRole: UserRole): boolean {
    if (userRole !== UserRole.SEEKER) {
      throw new ValidationError('Only job seekers can access seeker features');
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

  private static isValidRole(role: UserRole): boolean {
    return Object.values(UserRole).includes(role);
  }
}
