import { Request, Response, NextFunction } from 'express';
import {
  AuthenticationError,
  AuthorizationError,
} from '../../domain/errors/errors';
import { TYPES } from '../../infrastructure/di/types';
import { container } from '../../infrastructure/di/container';
import { TokenService } from '../../application/interfaces';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : undefined;
  if (!token) {
    return next(new AuthenticationError('Missing access token'));
  }
  try {
    const tokenService = container.get<TokenService>(TYPES.TokenService);
    const payload = tokenService.verifyAccess(token);
    req.user = {
      id: payload.sub,
      email: payload.email || '',
      role: payload.role || 'seeker',
    };
    next();
  } catch {
    next(new AuthenticationError('Invalid or expired token'));
  }
}

export function authorizeRoles(...roles: string[]) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): void => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return next(new AuthorizationError());
    }
    next();
  };
}
