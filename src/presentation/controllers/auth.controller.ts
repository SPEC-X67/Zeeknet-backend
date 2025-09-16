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
import { ValidationError } from '../../domain/errors/errors';
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
import { IAuthService } from '../../application/interfaces/services/auth.service.interface';

@injectable()
export class AuthController {
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
    @inject(TYPES.AuthService) private readonly authService: IAuthService,
  ) {}

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = RegisterDto.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError('Invalid registration data'));
    }
    try {
      const { tokens, user } = await this.registerUserUseCase.execute(
        parsed.data.email,
        parsed.data.password,
        parsed.data.role,
        parsed.data.name,
      );

      res.cookie(env.COOKIE_NAME_REFRESH!, tokens.refreshToken, {
        httpOnly: true,
        secure: env.COOKIE_SECURE === 'true',
        sameSite: env.COOKIE_SAME_SITE as any,
        domain: env.COOKIE_DOMAIN,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      const { password, refreshToken, ...userDetails } = user as any;
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: userDetails.id,
          name: userDetails.name,
          email: userDetails.email,
          role: userDetails.role,
          isVerified: userDetails.isVerified,
          createdAt: userDetails.createdAt,
        },
        token: tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = GoogleLoginDto.safeParse(req.body);
    if (!parsed.success)
      return next(new ValidationError('Invalid Google token'));
    try {
      const { tokens, user } = await this.googleLoginUseCase.execute(
        parsed.data.idToken,
      );

      res.cookie(env.COOKIE_NAME_REFRESH!, tokens.refreshToken, {
        httpOnly: true,
        secure: env.COOKIE_SECURE === 'true',
        sameSite: env.COOKIE_SAME_SITE as any,
        domain: env.COOKIE_DOMAIN,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        token: tokens.accessToken,
      });
    } catch (err) {
      next(err);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = LoginDto.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError('Invalid login data'));
    }
    try {
      const { tokens, user } = await this.loginUserUseCase.execute(
        parsed.data.email,
        parsed.data.password,
      );
      
      const cookieOptions: any = {
        httpOnly: true,
        secure: env.COOKIE_SECURE === 'true',
        sameSite: env.COOKIE_SAME_SITE as any,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };
      
      // Only set domain if it's defined
      if (env.COOKIE_DOMAIN) {
        cookieOptions.domain = env.COOKIE_DOMAIN;
      }
      
      res.cookie(env.COOKIE_NAME_REFRESH!, tokens.refreshToken, cookieOptions);

      const { password, refreshToken: rt, ...userDetails } = user;
      res.json({
        success: true,
        message: 'Login successful',
        data: userDetails,
        token: tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  adminLogin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = LoginDto.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError('Invalid login data'));
    }
    try {
      const { tokens, user } = await this.adminLoginUseCase.execute(
        parsed.data.email,
        parsed.data.password,
      );
      
      res.cookie(env.COOKIE_NAME_REFRESH!, tokens.refreshToken, {
        httpOnly: true,
        secure: env.COOKIE_SECURE === 'true',
        sameSite: env.COOKIE_SAME_SITE as any,
        domain: env.COOKIE_DOMAIN,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { password, refreshToken: rt, ...userDetails } = user;
      res.json({
        success: true,
        message: 'Admin login successful',
        data: userDetails,
        token: tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const cookieName = env.COOKIE_NAME_REFRESH || 'refresh_token';
    const fromCookie = (req as any).cookies?.[cookieName];
    
    const parsed = fromCookie
      ? { success: true, data: { refreshToken: fromCookie } }
      : RefreshTokenDto.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError('Invalid refresh token'));
    }
    try {
      const result = await this.refreshTokenUseCase.execute(
        parsed.data.refreshToken,
      );
      const { tokens, user } = result;
      const cookieOptions: any = {
        httpOnly: true,
        secure: env.COOKIE_SECURE === 'true',
        sameSite: env.COOKIE_SAME_SITE as any,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };
      
      // Only set domain if it's defined
      if (env.COOKIE_DOMAIN) {
        cookieOptions.domain = env.COOKIE_DOMAIN;
      }
      
      res.cookie(env.COOKIE_NAME_REFRESH!, tokens.refreshToken, cookieOptions);

      const { password, refreshToken: rt, ...userDetails } = user;
      res.json({
        success: true,
        message: 'Token refreshed',
        data: userDetails,
        token: tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  checkAuth = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return next(new ValidationError('Not authenticated'));
      }
      const user = await this.getUserByIdUseCase.execute(userId);
      if (!user) {
        return next(new ValidationError('User not found'));
      }

      // Generate a fresh access token
      const accessToken = await this.authService.generateAccessToken(user);

      // Remove sensitive information
      const { password, refreshToken, ...userDetails } = user;

      res.json({
        success: true,
        message: 'Authenticated',
        data: userDetails,
        token: accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const maybe = LogoutDto.safeParse(req.body);
      const userId =
        (req as any).user?.id ??
        (maybe.success ? maybe.data.userId : undefined);
      
      // Try to logout user if we have userId, but don't fail if we don't
      if (userId) {
        try {
          await this.logoutUseCase.execute(userId);
        } catch (error) {
          // Log the error but don't fail the logout request
        }
      }
      
      const cookieOptions: any = {
        httpOnly: true,
        secure: env.COOKIE_SECURE === 'true',
        sameSite: env.COOKIE_SAME_SITE as any,
        path: '/',
      };
      
      // Only set domain if it's defined
      if (env.COOKIE_DOMAIN) {
        cookieOptions.domain = env.COOKIE_DOMAIN;
      }
      
      res.clearCookie(env.COOKIE_NAME_REFRESH!, cookieOptions);
      res
        .status(200)
        .json({ success: true, message: 'Logged out', data: null });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = ForgotPasswordDto.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError('Invalid email address'));
    }
    try {
      await this.forgotPasswordUseCase.execute(parsed.data.email);
      res
        .status(200)
        .json({
          success: true,
          message: 'Password reset link has been sent to your email.',
          data: null,
        });
    } catch (error) {
      // For security reasons, always return success even if email doesn't exist
      // This prevents email enumeration attacks
      res
        .status(200)
        .json({
          success: true,
          message: 'If the email exists, a password reset link has been sent.',
          data: null,
        });
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = ResetPasswordDto.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError('Invalid reset data'));
    }
    try {
      await this.resetPasswordUseCase.execute(
        parsed.data.token,
        parsed.data.newPassword,
      );
      res
        .status(200)
        .json({
          success: true,
          message: 'Password has been reset successfully',
          data: null,
        });
    } catch (error) {
      next(error);
    }
  };
}
