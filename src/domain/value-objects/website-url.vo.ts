import { ValidationError } from '../errors/errors';

export class WebsiteUrl {
  private readonly value: string;

  constructor(url: string) {
    if (!this.isValid(url)) {
      throw new ValidationError('Invalid website URL format');
    }
    this.value = this.normalize(url);
  }

  private isValid(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      const urlObj = new URL(url);
      
      // Must be HTTP or HTTPS
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return false;
      }

      // Must have a valid hostname
      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        return false;
      }

      // Hostname must contain at least one dot (for domain)
      if (!urlObj.hostname.includes('.')) {
        return false;
      }

      // Must not be localhost or IP address (for production)
      if (urlObj.hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(urlObj.hostname)) {
        return false;
      }

      // Maximum length
      if (url.length > 2048) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  private normalize(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove trailing slash from pathname
      if (urlObj.pathname.endsWith('/') && urlObj.pathname.length > 1) {
        urlObj.pathname = urlObj.pathname.slice(0, -1);
      }

      // Remove default port
      if ((urlObj.protocol === 'https:' && urlObj.port === '443') ||
          (urlObj.protocol === 'http:' && urlObj.port === '80')) {
        urlObj.port = '';
      }

      return urlObj.toString();
    } catch {
      return url;
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: WebsiteUrl): boolean {
    return this.value === other.value;
  }

  getDomain(): string {
    try {
      return new URL(this.value).hostname;
    } catch {
      return '';
    }
  }

  getProtocol(): string {
    try {
      return new URL(this.value).protocol;
    } catch {
      return '';
    }
  }

  isSecure(): boolean {
    return this.getProtocol() === 'https:';
  }

  getPath(): string {
    try {
      return new URL(this.value).pathname;
    } catch {
      return '';
    }
  }

  getQuery(): string {
    try {
      return new URL(this.value).search;
    } catch {
      return '';
    }
  }

  getHash(): string {
    try {
      return new URL(this.value).hash;
    } catch {
      return '';
    }
  }

  isSubdomain(): boolean {
    const domain = this.getDomain();
    const parts = domain.split('.');
    return parts.length > 2;
  }

  getRootDomain(): string {
    const domain = this.getDomain();
    const parts = domain.split('.');
    
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
    
    return domain;
  }
}
