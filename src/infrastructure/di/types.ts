export const TYPES = {
  // ===== REPOSITORIES =====
  UserRepository: Symbol.for('UserRepository'),
  CompanyRepository: Symbol.for('CompanyRepository'),

  // ===== INFRASTRUCTURE SERVICES =====
  PasswordHasher: Symbol.for('PasswordHasher'),
  TokenService: Symbol.for('TokenService'),
  GoogleTokenVerifier: Symbol.for('GoogleTokenVerifier'),
  PasswordResetService: Symbol.for('PasswordResetService'),
  OtpService: Symbol.for('OtpService'),
  MailerService: Symbol.for('MailerService'),
  S3Service: Symbol.for('S3Service'),

  // ===== AUTH USE CASES =====
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

  // ===== COMPANY USE CASES =====
  CreateCompanyProfileUseCase: Symbol.for('CreateCompanyProfileUseCase'),
  UpdateCompanyProfileUseCase: Symbol.for('UpdateCompanyProfileUseCase'),
  GetCompanyProfileUseCase: Symbol.for('GetCompanyProfileUseCase'),

  // ===== ADMIN USE CASES =====
  GetAllUsersUseCase: Symbol.for('GetAllUsersUseCase'),
  BlockUserUseCase: Symbol.for('BlockUserUseCase'),
  AdminGetUserByIdUseCase: Symbol.for('AdminGetUserByIdUseCase'),
  GetAllCompaniesUseCase: Symbol.for('GetAllCompaniesUseCase'),
  VerifyCompanyUseCase: Symbol.for('VerifyCompanyUseCase'),

  // ===== CONTROLLERS =====
  AuthController: Symbol.for('AuthController'),
  AdminController: Symbol.for('AdminController'),
  CompanyController: Symbol.for('CompanyController'),
  OtpController: Symbol.for('OtpController'),

  // ===== SERVER =====
  AppServer: Symbol.for('AppServer'),
};
