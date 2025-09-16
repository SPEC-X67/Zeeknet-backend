import { ValidationError } from '../errors/errors';

export class CompanyName {
  private readonly value: string;

  constructor(name: string) {
    if (!this.isValid(name)) {
      throw new ValidationError('Invalid company name');
    }
    this.value = this.normalize(name);
  }

  private isValid(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }

    const trimmed = name.trim();
    
    // Minimum 2 characters
    if (trimmed.length < 2) {
      return false;
    }

    // Maximum 100 characters
    if (trimmed.length > 100) {
      return false;
    }

    // Must contain only letters, numbers, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z0-9\s\-']+$/.test(trimmed)) {
      return false;
    }

    // Must not start or end with space, hyphen, or apostrophe
    if (/^[\s\-']|[\s\-']$/.test(trimmed)) {
      return false;
    }

    // Must not have consecutive spaces, hyphens, or apostrophes
    if (/[\s\-']{2,}/.test(trimmed)) {
      return false;
    }

    return true;
  }

  private normalize(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  toString(): string {
    return this.value;
  }

  equals(other: CompanyName): boolean {
    return this.value === other.value;
  }

  getLength(): number {
    return this.value.length;
  }

  getWordCount(): number {
    return this.value.split(' ').length;
  }

  containsProfanity(): boolean {
    const profanityWords = [
      'damn', 'hell', 'crap', 'stupid', 'idiot', 'moron',
      // Add more as needed
    ];
    
    const lowerValue = this.value.toLowerCase();
    return profanityWords.some(word => lowerValue.includes(word));
  }

  isAbbreviation(): boolean {
    // Check if the name is mostly uppercase letters (likely an abbreviation)
    const upperCaseCount = (this.value.match(/[A-Z]/g) || []).length;
    const totalLetterCount = (this.value.match(/[a-zA-Z]/g) || []).length;
    
    return totalLetterCount > 0 && (upperCaseCount / totalLetterCount) > 0.7;
  }
}
