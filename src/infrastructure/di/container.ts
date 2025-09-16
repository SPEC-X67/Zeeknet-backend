import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Repositories (updated paths)
import { MongoUserRepository } from '../database/mongodb/repositories/user.repository';
import { MongoCompanyRepository } from '../database/mongodb/repositories/company.repository';

// Application Services (keep current paths for now)
import { AuthService } from '../../application/services/auth.service';
import { UserManagementService } from '../../application/services/user-management.service';
import { CompanyService } from '../../application/services/company.service';

// Infrastructure Services (updated paths)
import { BcryptPasswordHasher } from '../security/bcrypt-password-hasher';
import { JwtTokenService } from '../security/jwt-token-service';
import { GoogleAuthTokenVerifier } from '../security/google-token-verifier';
import { PasswordResetServiceImpl } from '../security/password-reset-service';
import { RedisOtpService } from '../database/redis/services/redis-otp-service';
import { NodemailerService } from '../messaging/mailer';
import { S3Service } from '../external-services/s3/s3.service';

// Use Cases
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
  CreateCompanyProfileUseCase,
  UpdateCompanyProfileUseCase,
  GetCompanyProfileUseCase,
  GetAllUsersUseCase,
  BlockUserUseCase,
  AdminGetUserByIdUseCase,
  GetAllCompaniesUseCase,
  VerifyCompanyUseCase,
} from '../../application/use-cases';

// Controllers (updated paths - now in presentation layer)
import { AuthController } from '../../presentation/controllers/auth.controller';
import { AdminController } from '../../presentation/controllers/admin.controller';
import { CompanyController } from '../../presentation/controllers/company.controller';
import { OtpController } from '../../presentation/controllers/otp.controller';

// Server (updated path - now in presentation layer)
import { AppServer } from '../../presentation/server/app-server';

const container = new Container();

// Repository bindings
container.bind(TYPES.UserRepository).to(MongoUserRepository);
container.bind(TYPES.CompanyRepository).to(MongoCompanyRepository);

// Service bindings
container.bind(TYPES.AuthService).to(AuthService);
container.bind(TYPES.UserManagementService).to(UserManagementService);
container.bind(TYPES.CompanyService).to(CompanyService);

// Infrastructure service bindings
container.bind(TYPES.PasswordHasher).to(BcryptPasswordHasher);
container.bind(TYPES.TokenService).to(JwtTokenService);
container.bind(TYPES.GoogleTokenVerifier).to(GoogleAuthTokenVerifier);
container.bind(TYPES.PasswordResetService).to(PasswordResetServiceImpl);
container.bind(TYPES.OtpService).to(RedisOtpService);
container.bind(TYPES.MailerService).to(NodemailerService);
container.bind(TYPES.S3Service).to(S3Service);

// Use Case bindings - Auth
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

// Use Case bindings - Company
container.bind(TYPES.CreateCompanyProfileUseCase).to(CreateCompanyProfileUseCase);
container.bind(TYPES.UpdateCompanyProfileUseCase).to(UpdateCompanyProfileUseCase);
container.bind(TYPES.GetCompanyProfileUseCase).to(GetCompanyProfileUseCase);

// Use Case bindings - Admin
container.bind(TYPES.GetAllUsersUseCase).to(GetAllUsersUseCase);
container.bind(TYPES.BlockUserUseCase).to(BlockUserUseCase);
container.bind(TYPES.AdminGetUserByIdUseCase).to(AdminGetUserByIdUseCase);
container.bind(TYPES.GetAllCompaniesUseCase).to(GetAllCompaniesUseCase);
container.bind(TYPES.VerifyCompanyUseCase).to(VerifyCompanyUseCase);

// Controller bindings
container.bind(AuthController).toSelf();
container.bind(AdminController).toSelf();
container.bind(CompanyController).toSelf();
container.bind(OtpController).toSelf();

// Server binding
container.bind<AppServer>(TYPES.AppServer).to(AppServer).inSingletonScope();

export { container };