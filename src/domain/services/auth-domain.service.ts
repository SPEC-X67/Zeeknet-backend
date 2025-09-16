import { ValidationError, AuthenticationError } from '../errors/errors';
import { UserRole } from '../enums/user-role.enum';

export class AuthDomainService {
  /**
   * Validates login attempt based on business rules
   */
  static validateLoginAttempt(
    user: {
      isVerified: boolean;
      isBlocked: boolean;
      role: UserRole;
    },
    loginRole?: UserRole,
  ): boolean {
    if (user.isBlocked) {
      throw new AuthenticationError('Account has been blocked. Contact support for assistance.');
    }

    if (!user.isVerified) {
      throw new AuthenticationError('Please verify your email before logging in');
    }

    // If loginRole is specified, check if user has the required role
    if (loginRole && user.role !== loginRole) {
      throw new AuthenticationError(`Access denied. ${loginRole} role required.`);
    }

    return true;
  }

  /**
   * Validates token refresh attempt
   */
  static validateTokenRefresh(
    user: {
      isBlocked: boolean;
      isVerified: boolean;
    },
  ): boolean {
    if (user.isBlocked) {
      throw new AuthenticationError('Account has been blocked. Cannot refresh token.');
    }

    if (!user.isVerified) {
      throw new AuthenticationError('Account not verified. Cannot refresh token.');
    }

    return true;
  }

  /**
   * Validates OTP verification attempt
   */
  static validateOtpVerification(
    user: {
      isBlocked: boolean;
      isVerified: boolean;
    },
  ): boolean {
    if (user.isBlocked) {
      throw new AuthenticationError('Account has been blocked. Cannot verify OTP.');
    }

    if (user.isVerified) {
      throw new ValidationError('Account is already verified');
    }

    return true;
  }

  /**
   * Validates password reset attempt
   */
  static validatePasswordReset(
    user: {
      isBlocked: boolean;
      isVerified: boolean;
    },
  ): boolean {
    if (user.isBlocked) {
      throw new AuthenticationError('Account has been blocked. Cannot reset password.');
    }

    if (!user.isVerified) {
      throw new AuthenticationError('Account not verified. Cannot reset password.');
    }

    return true;
  }

  /**
   * Validates Google login attempt
   */
  static validateGoogleLogin(
    user: {
      isBlocked: boolean;
      isVerified: boolean;
    },
  ): boolean {
    if (user.isBlocked) {
      throw new AuthenticationError('Account has been blocked. Cannot login with Google.');
    }

    // Google login doesn't require email verification
    return true;
  }

  /**
   * Validates session timeout
   */
  static validateSessionTimeout(
    lastActivity: Date,
    maxInactiveTime: number = 24 * 60 * 60 * 1000, // 24 hours
  ): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - lastActivity.getTime();

    if (timeDiff > maxInactiveTime) {
      throw new AuthenticationError('Session has expired. Please login again.');
    }

    return true;
  }

  /**
   * Validates concurrent login attempts
   */
  static validateConcurrentLogin(
    currentSessions: number,
    maxSessions: number = 3,
  ): boolean {
    if (currentSessions >= maxSessions) {
      throw new AuthenticationError(
        `Maximum number of concurrent sessions (${maxSessions}) exceeded. Please logout from other devices.`,
      );
    }

    return true;
  }

  /**
   * Validates account lockout after failed attempts
   */
  static validateAccountLockout(
    failedAttempts: number,
    maxAttempts: number = 5,
    lockoutDuration: number = 15 * 60 * 1000, // 15 minutes
    lastFailedAttempt?: Date,
  ): boolean {
    if (failedAttempts >= maxAttempts) {
      if (lastFailedAttempt) {
        const now = new Date();
        const timeDiff = now.getTime() - lastFailedAttempt.getTime();

        if (timeDiff < lockoutDuration) {
          const remainingTime = Math.ceil((lockoutDuration - timeDiff) / 60000);
          throw new AuthenticationError(
            `Account temporarily locked due to too many failed attempts. Try again in ${remainingTime} minutes.`,
          );
        }
      } else {
        throw new AuthenticationError(
          'Account temporarily locked due to too many failed attempts. Try again later.',
        );
      }
    }

    return true;
  }

  /**
   * Validates password change requirements
   */
  static validatePasswordChange(
    currentPassword: string,
    newPassword: string,
    lastPasswordChange?: Date,
    minPasswordAge: number = 24 * 60 * 60 * 1000, // 24 hours
  ): boolean {
    if (currentPassword === newPassword) {
      throw new ValidationError('New password must be different from current password');
    }

    if (lastPasswordChange) {
      const now = new Date();
      const timeDiff = now.getTime() - lastPasswordChange.getTime();

      if (timeDiff < minPasswordAge) {
        const remainingTime = Math.ceil((minPasswordAge - timeDiff) / 60000);
        throw new ValidationError(
          `Password can only be changed once every 24 hours. Try again in ${remainingTime} minutes.`,
        );
      }
    }

    return true;
  }
}
