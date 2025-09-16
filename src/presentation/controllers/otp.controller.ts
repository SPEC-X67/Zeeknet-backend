import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import {
  MailerService,
  OtpService,
} from '../../application/interfaces';
import { IUserRepository } from '../../domain/repositories';
import { TYPES } from '../../infrastructure/di/types';
import { z } from 'zod';
import { ValidationError } from '../../domain/errors/errors';

const RequestOtpDto = z.object({ email: z.string().email() });
const VerifyOtpDto = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

@injectable()
export class OtpController {
  constructor(
    @inject(TYPES.OtpService) private readonly otpService: OtpService,
    @inject(TYPES.MailerService) private readonly mailer: MailerService,
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  request = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = RequestOtpDto.safeParse(req.body);
    if (!parsed.success) return next(new ValidationError('Invalid email'));
    try {
      const user = await this.userRepository.findByEmail(parsed.data.email);
      if (!user) {
        return next(new ValidationError('User not found'));
      }
      if (user.isVerified) {
        res.status(200).json({ message: 'User already verified' });
        return;
      }

      let code: string;
      try {
        code = await this.otpService.generateAndStoreOtp(parsed.data.email);
      } catch (error: any) {
        if (error.message.includes('Please wait before requesting another OTP')) {
          res.status(429).json({ 
            success: false,
            message: 'Please wait 30 seconds before requesting another OTP',
            error: 'RATE_LIMITED'
          });
          return;
        }
        throw error;
      }
      
      const htmlContent = `
        <table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border-collapse: collapse;">
          <tr>
            <td style="background-color: white; padding: 30px; text-align: center;">
              <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email</h2>
              
              <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: left; margin: 0 0 20px 0;">Hello,</p>
              <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: left; margin: 0 0 20px 0;">Thanks for registering! Please use the verification code below to verify your email address:</p>
              
              <div style="background-color: #f8fafc; border-radius: 4px; padding: 20px; margin: 30px 0; text-align: center;">
                <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 4px;">${code}</span>
              </div>

              <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: left; margin: 20px 0 10px 0;"><strong>Please Note:</strong></p>
              <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: left; margin: 0 0 10px 0;">• This code will expire in 5 minutes</p>
              <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: left; margin: 0 0 20px 0;">• If you didn't request this code, please ignore this email</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px; text-align: center;">This is an automated email, please do not reply.</p>
            </td>
          </tr>
        </table>
      `;

      await this.mailer.sendMail(
        parsed.data.email,
        'Verify Your Email - ZeekNet Job Portal',
        htmlContent,
      );
      res.status(200).json({ message: 'OTP sent' });
    } catch (err) {
      next(err);
    }
  };

  verify = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = VerifyOtpDto.safeParse(req.body);
    if (!parsed.success) return next(new ValidationError('Invalid OTP data'));
    try {
      const ok = await this.otpService.verifyOtp(
        parsed.data.email,
        parsed.data.code,
      );
      if (!ok) return next(new ValidationError('Invalid or expired OTP'));

      await this.userRepository.updateVerificationStatus(
        parsed.data.email,
        true,
      );

      // Get user data to return role for redirection
      const user = await this.userRepository.findByEmail(parsed.data.email);
      if (!user) {
        return next(new ValidationError('User not found'));
      }

      res.status(200).json({ 
        success: true,
        message: 'OTP verified and user verified',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: true,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
