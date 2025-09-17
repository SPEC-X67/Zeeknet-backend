import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// ===== REPOSITORIES =====
import { MongoUserRepository } from '../database/mongodb/repositories/user.repository';
import { MongoCompanyRepository } from '../database/mongodb/repositories/company.repository';

// ===== INFRASTRUCTURE SERVICES =====
import { BcryptPasswordHasher } from '../security/bcrypt-password-hasher';
import { JwtTokenService } from '../security/jwt-token-service';
import { GoogleAuthTokenVerifier } from '../security/google-token-verifier';
import { PasswordResetServiceImpl } from '../security/password-reset-service';
import { RedisOtpService } from '../database/redis/services/redis-otp-service';
import { NodemailerService } from '../messaging/mailer';
import { S3Service } from '../external-services/s3/s3.service';

// ===== USE CASES - AUTH =====
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  AdminLoginUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  VerifyOtpUseCase,
  GoogleLoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  AuthGetUserByIdUseCase,
} from '../../application/use-cases';

// ===== USE CASES - COMPANY =====
import {
  CreateCompanyProfileUseCase,
  UpdateCompanyProfileUseCase,
  GetCompanyProfileUseCase,
} from '../../application/use-cases';

// ===== USE CASES - ADMIN =====
import {
  GetAllUsersUseCase,
  BlockUserUseCase,
  AdminGetUserByIdUseCase,
  GetAllCompaniesUseCase,
  VerifyCompanyUseCase,
} from '../../application/use-cases';

// ===== CONTROLLERS =====
import { AuthController } from '../../presentation/controllers/auth.controller';
import { AdminController } from '../../presentation/controllers/admin.controller';
import { CompanyController } from '../../presentation/controllers/company.controller';
import { OtpController } from '../../presentation/controllers/otp.controller';

// ===== SERVER =====
import { AppServer } from '../../presentation/server/app-server';

// Create DI container
const container = new Container();

// ===== REPOSITORY BINDINGS =====
container.bind(TYPES.UserRepository).to(MongoUserRepository);
container.bind(TYPES.CompanyRepository).to(MongoCompanyRepository);

// ===== INFRASTRUCTURE SERVICE BINDINGS =====
container.bind(TYPES.PasswordHasher).to(BcryptPasswordHasher);
container.bind(TYPES.TokenService).to(JwtTokenService);
container.bind(TYPES.GoogleTokenVerifier).to(GoogleAuthTokenVerifier);
container.bind(TYPES.PasswordResetService).to(PasswordResetServiceImpl);
container.bind(TYPES.OtpService).to(RedisOtpService);
container.bind(TYPES.MailerService).to(NodemailerService);
container.bind(TYPES.S3Service).to(S3Service);

// ===== AUTH USE CASE BINDINGS =====
container.bind(TYPES.RegisterUserUseCase).to(RegisterUserUseCase);
container.bind(TYPES.LoginUserUseCase).to(LoginUserUseCase);
container.bind(TYPES.AdminLoginUseCase).to(AdminLoginUseCase);
container.bind(TYPES.ForgotPasswordUseCase).to(ForgotPasswordUseCase);
container.bind(TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase);
container.bind(TYPES.VerifyOtpUseCase).to(VerifyOtpUseCase);
container.bind(TYPES.GoogleLoginUseCase).to(GoogleLoginUseCase);
container.bind(TYPES.RefreshTokenUseCase).to(RefreshTokenUseCase);
container.bind(TYPES.LogoutUseCase).to(LogoutUseCase);
container.bind(TYPES.GetUserByIdUseCase).to(AuthGetUserByIdUseCase);

// ===== COMPANY USE CASE BINDINGS =====
container.bind(TYPES.CreateCompanyProfileUseCase).to(CreateCompanyProfileUseCase);
container.bind(TYPES.UpdateCompanyProfileUseCase).to(UpdateCompanyProfileUseCase);
container.bind(TYPES.GetCompanyProfileUseCase).to(GetCompanyProfileUseCase);

// ===== ADMIN USE CASE BINDINGS =====
container.bind(TYPES.GetAllUsersUseCase).to(GetAllUsersUseCase);
container.bind(TYPES.BlockUserUseCase).to(BlockUserUseCase);
container.bind(TYPES.AdminGetUserByIdUseCase).to(AdminGetUserByIdUseCase);
container.bind(TYPES.GetAllCompaniesUseCase).to(GetAllCompaniesUseCase);
container.bind(TYPES.VerifyCompanyUseCase).to(VerifyCompanyUseCase);

// ===== CONTROLLER BINDINGS =====
container.bind(TYPES.AuthController).to(AuthController);
container.bind(TYPES.AdminController).to(AdminController);
container.bind(TYPES.CompanyController).to(CompanyController);
container.bind(TYPES.OtpController).to(OtpController);

// ===== SERVER BINDING =====
container.bind(TYPES.AppServer).to(AppServer);

export { container };
