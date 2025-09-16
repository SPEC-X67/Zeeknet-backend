import { ValidationError } from '../errors/errors';

export class Password {
  private readonly value: string;

  constructor(password: string) {
    if (!this.isValid(password)) {
      throw new ValidationError(this.getValidationMessage(password));
    }
    this.value = password;
  }

  private isValid(password: string): boolean {
    if (!password || typeof password !== 'string') {
      return false;
    }

    // Minimum 8 characters
    if (password.length < 8) {
      return false;
    }

    // At least one lowercase letter
    if (!/(?=.*[a-z])/.test(password)) {
      return false;
    }

    // At least one uppercase letter
    if (!/(?=.*[A-Z])/.test(password)) {
      return false;
    }

    // At least one number
    if (!/(?=.*\d)/.test(password)) {
      return false;
    }

    // At least one special character
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return false;
    }

    // Maximum 128 characters (reasonable limit)
    if (password.length > 128) {
      return false;
    }

    return true;
  }

  private getValidationMessage(password: string): string {
    if (!password || typeof password !== 'string') {
      return 'Password is required';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }

    if (password.length > 128) {
      return 'Password must not exceed 128 characters';
    }

    return 'Invalid password format';
  }

  toString(): string {
    return this.value;
  }

  equals(other: Password): boolean {
    return this.value === other.value;
  }

  getStrength(): 'weak' | 'medium' | 'strong' {
    let score = 0;

    // Length score
    if (this.value.length >= 8) score += 1;
    if (this.value.length >= 12) score += 1;
    if (this.value.length >= 16) score += 1;

    // Character variety score
    if (/[a-z]/.test(this.value)) score += 1;
    if (/[A-Z]/.test(this.value)) score += 1;
    if (/\d/.test(this.value)) score += 1;
    if (/[@$!%*?&]/.test(this.value)) score += 1;

    // Additional complexity
    if (this.value.length > 12 && /[a-z]/.test(this.value) && /[A-Z]/.test(this.value) && /\d/.test(this.value) && /[@$!%*?&]/.test(this.value)) {
      score += 1;
    }

    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    return 'strong';
  }

  isCommonPassword(): boolean {
    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
    ];
    return commonPasswords.includes(this.value.toLowerCase());
  }
}
