import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { TYPES } from '../../infrastructure/di/types';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  GoogleLoginDto,
} from '../../application/dto/auth';
import { env } from '../../infrastructure/config/env';
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  AdminLoginUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  GoogleLoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  AuthGetUserByIdUseCase,
} from '../../application/use-cases';
import { TokenService } from '../../application/interfaces/infrastructure';
import { BaseController, AuthenticatedRequest } from '../../shared';
import { 
  createRefreshTokenCookieOptions, 
  createLogoutCookieOptions,
  ErrorHandler, 
} from '../../shared/utils';

@injectable()
export class AuthController extends BaseController {
  constructor(
    @inject(TYPES.RegisterUserUseCase) private readonly registerUserUseCase: RegisterUserUseCase,
    @inject(TYPES.LoginUserUseCase) private readonly loginUserUseCase: LoginUserUseCase,
    @inject(TYPES.AdminLoginUseCase) private readonly adminLoginUseCase: AdminLoginUseCase,
    @inject(TYPES.ForgotPasswordUseCase) private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    @inject(TYPES.ResetPasswordUseCase) private readonly resetPasswordUseCase: ResetPasswordUseCase,
    @inject(TYPES.GoogleLoginUseCase) private readonly googleLoginUseCase: GoogleLoginUseCase,
    @inject(TYPES.RefreshTokenUseCase) private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @inject(TYPES.LogoutUseCase) private readonly logoutUseCase: LogoutUseCase,
    @inject(TYPES.GetUserByIdUseCase) private readonly getUserByIdUseCase: AuthGetUserByIdUseCase,
    @inject(TYPES.TokenService) private readonly tokenService: TokenService,
  ) {
    super();
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = RegisterDto.safeParse(req.body);
    if (!parsed.success) {
      return this.handleValidationError('Invalid registration data', next);
    }
    
    try {
      const { tokens, user } = await this.registerUserUseCase.execute(
        parsed.data.email,
        parsed.data.password,
        parsed.data.role,
        parsed.data.name,
      );

      res.cookie(env.COOKIE_NAME_REFRESH!, tokens.refreshToken, createRefreshTokenCookieOptions());
      
      const userDetails = this.sanitizeUserForResponse(user);
      this.sendSuccessResponse(res, 'User registered successfully', userDetails, tokens.accessToken, 201);
    } catch (error) {
      this.handleAsyncError(error, next);
    }
  };

  googleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = GoogleLoginDto.safeParse(req.body);
    if (!parsed.success) {
      return this.handleValidationError('Invalid Google token', next);
    }
    
    try {
      const { tokens, user } = await this.googleLoginUseCase.execute(
        parsed.data.idToken,
      );

      res.cookie(env.COOKIE_NAME_REFRESH!, tokens.refreshToken, createRefreshTokenCookieOptions());
      
      const userDetails = this.sanitizeUserForResponse(user);
      this.sendSuccessResponse(res, 'Login successful', userDetails, tokens.accessToken);
    } catch (error) {
      this.handleAsyncError(error, next);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = LoginDto.safeParse(req.body);
    if (!parsed.success) {
      return this.handleValidationError('Invalid login data', next);
    }
    
    try {
      const { tokens, user } = await this.loginUserUseCase.execute(
        parsed.data.email,
        parsed.data.password,
      );
      
      res.cookie(env.COOKIE_NAME_REFRESH!, tokens.refreshToken, createRefreshTokenCookieOptions());
      
      const userDetails = this.sanitizeUserForResponse(user);
      this.sendSuccessResponse(res, 'Login successful', userDetails, tokens.accessToken);
    } catch (error) {
      this.handleAsyncError(error, next);
    }
  };

  adminLogin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = LoginDto.safeParse(req.body);
    if (!parsed.success) {
      return this.handleValidationError('Invalid login data', next);
    }
    
    try {
      const { tokens, user } = await this.adminLoginUseCase.execute(
        parsed.data.email,
        parsed.data.password,
      );
      
      res.cookie(env.COOKIE_NAME_REFRESH!, tokens.refreshToken, createRefreshTokenCookieOptions());
      
      const userDetails = this.sanitizeUserForResponse(user);
      this.sendSuccessResponse(res, 'Admin login successful', userDetails, tokens.accessToken);
    } catch (error) {
      this.handleAsyncError(error, next);
    }
  };

  refresh = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const cookieName = env.COOKIE_NAME_REFRESH || 'refresh_token';
    const fromCookie = (req as Request & { cookies?: Record<string, string> }).cookies?.[cookieName];
    
    const parsed = fromCookie
      ? { success: true, data: { refreshToken: fromCookie } }
      : RefreshTokenDto.safeParse(req.body);
      
    if (!parsed.success) {
      return this.handleValidationError('Invalid refresh token', next);
    }
    
    try {
      const result = await this.refreshTokenUseCase.execute(
        parsed.data.refreshToken,
      );
      const { tokens, user } = result;
      
      res.cookie(env.COOKIE_NAME_REFRESH!, tokens.refreshToken, createRefreshTokenCookieOptions());
      
      const userDetails = this.sanitizeUserForResponse(user);
      this.sendSuccessResponse(res, 'Token refreshed', userDetails, tokens.accessToken);
    } catch (error) {
      this.handleAsyncError(error, next);
    }
  };

  checkAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this.validateUserId(req);
      const user = await this.getUserByIdUseCase.execute(userId);
      
      if (!user) {
        return this.handleValidationError('User not found', next);
      }

      const accessToken = this.tokenService.signAccess({ sub: user.id, role: user.role });
      const userDetails = this.sanitizeUserForResponse(user);
      
      this.sendSuccessResponse(res, 'Authenticated', userDetails, accessToken);
    } catch (error) {
      this.handleAsyncError(error, next);
    }
  };

  logout = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const maybe = LogoutDto.safeParse(req.body);
      const userId = this.extractUserId(req) ?? (maybe.success ? maybe.data.userId : undefined);
      
      // Try to logout user if we have userId, but don't fail if we don't
      if (userId) {
        try {
          await this.logoutUseCase.execute(userId);
        } catch (error) {
          // Log the error but don't fail the logout request
        }
      }
      
      res.clearCookie(env.COOKIE_NAME_REFRESH!, createLogoutCookieOptions());
      this.sendSuccessResponse(res, 'Logged out', null);
    } catch (error) {
      this.handleAsyncError(error, next);
    }
  };

  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = ForgotPasswordDto.safeParse(req.body);
    if (!parsed.success) {
      return this.handleValidationError('Invalid email address', next);
    }
    
    try {
      await this.forgotPasswordUseCase.execute(parsed.data.email);
      this.sendSuccessResponse(res, 'Password reset link has been sent to your email.', null);
    } catch (error) {
      // For security reasons, always return success even if email doesn't exist
      // This prevents email enumeration attacks
      this.sendSuccessResponse(res, 'If the email exists, a password reset link has been sent.', null);
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = ResetPasswordDto.safeParse(req.body);
    if (!parsed.success) {
      return this.handleValidationError('Invalid reset data', next);
    }
    
    try {
      await this.resetPasswordUseCase.execute(
        parsed.data.token,
        parsed.data.newPassword,
      );
      this.sendSuccessResponse(res, 'Password has been reset successfully', null);
    } catch (error) {
      this.handleAsyncError(error, next);
    }
  };
}
