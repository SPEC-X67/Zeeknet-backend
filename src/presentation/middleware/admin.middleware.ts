import { Request, Response, NextFunction } from 'express';
import {
  AuthenticationError,
  AuthorizationError,
} from '../../domain/errors/errors';
import { UserRole } from '../../domain/enums/user-role.enum';

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const user = (req as any).user;
    if (!user) {
      throw new AuthenticationError('Authentication required');
    }

    // Check if user has admin role
    if (user.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
