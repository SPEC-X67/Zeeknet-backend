import { ValidationError } from '../../domain/errors/errors';

/**
 * Simple password validation utility
 * Replaces the complex Password value object with a straightforward function
 */
export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;
  private static readonly COMMON_PASSWORDS = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
  ];

  /**
   * Validate password and return validation result
   */
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    }

    if (password.length > this.MAX_LENGTH) {
      errors.push(`Password must not exceed ${this.MAX_LENGTH} characters`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    if (this.isCommonPassword(password)) {
      errors.push('Password is too common, please choose a more unique password');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Get password strength rating
   */
  static getStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (!password) return 'weak';

    let score = 0;

    // Length score
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety score
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;

    // Additional complexity bonus
    if (password.length > 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[@$!%*?&]/.test(password)) {
      score += 1;
    }

    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    return 'strong';
  }

  /**
   * Check if password is common
   */
  private static isCommonPassword(password: string): boolean {
    return this.COMMON_PASSWORDS.includes(password.toLowerCase());
  }

  /**
   * Validate and throw error if invalid (for use in constructors)
   */
  static validateOrThrow(password: string): void {
    const result = this.validate(password);
    if (!result.isValid) {
      throw new ValidationError(result.errors.join(', '));
    }
  }
}
