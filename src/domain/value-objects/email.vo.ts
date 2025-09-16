import { ValidationError } from '../errors/errors';

export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new ValidationError('Invalid email format');
    }
    this.value = email.toLowerCase().trim();
  }

  private isValid(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  getLocalPart(): string {
    return this.value.split('@')[0];
  }

  isBusinessEmail(): boolean {
    const personalDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
      'aol.com',
    ];
    return !personalDomains.includes(this.getDomain());
  }
}
