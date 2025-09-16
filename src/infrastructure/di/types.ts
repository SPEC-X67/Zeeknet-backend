export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  CompanyRepository: Symbol.for('CompanyRepository'),

  // Services
  AuthService: Symbol.for('AuthService'),
  UserManagementService: Symbol.for('UserManagementService'),
  CompanyService: Symbol.for('CompanyService'),

  // Infrastructure Services
  PasswordHasher: Symbol.for('PasswordHasher'),
  TokenService: Symbol.for('TokenService'),
  GoogleTokenVerifier: Symbol.for('GoogleTokenVerifier'),
  PasswordResetService: Symbol.for('PasswordResetService'),
  OtpService: Symbol.for('OtpService'),
  MailerService: Symbol.for('MailerService'),
  S3Service: Symbol.for('S3Service'),

  // Use Cases - Auth
  RegisterUserUseCase: Symbol.for('RegisterUserUseCase'),
  LoginUserUseCase: Symbol.for('LoginUserUseCase'),
  AdminLoginUseCase: Symbol.for('AdminLoginUseCase'),
  ForgotPasswordUseCase: Symbol.for('ForgotPasswordUseCase'),
  ResetPasswordUseCase: Symbol.for('ResetPasswordUseCase'),
  VerifyOtpUseCase: Symbol.for('VerifyOtpUseCase'),
  GoogleLoginUseCase: Symbol.for('GoogleLoginUseCase'),
  RefreshTokenUseCase: Symbol.for('RefreshTokenUseCase'),
  LogoutUseCase: Symbol.for('LogoutUseCase'),
  GetUserByIdUseCase: Symbol.for('GetUserByIdUseCase'),

  // Use Cases - Company
  CreateCompanyProfileUseCase: Symbol.for('CreateCompanyProfileUseCase'),
  UpdateCompanyProfileUseCase: Symbol.for('UpdateCompanyProfileUseCase'),
  GetCompanyProfileUseCase: Symbol.for('GetCompanyProfileUseCase'),

  // Use Cases - Admin
  GetAllUsersUseCase: Symbol.for('GetAllUsersUseCase'),
  BlockUserUseCase: Symbol.for('BlockUserUseCase'),
  AdminGetUserByIdUseCase: Symbol.for('AdminGetUserByIdUseCase'),
  GetAllCompaniesUseCase: Symbol.for('GetAllCompaniesUseCase'),
  VerifyCompanyUseCase: Symbol.for('VerifyCompanyUseCase'),

  // Server
  AppServer: Symbol.for('AppServer'),
};
