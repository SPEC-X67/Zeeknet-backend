import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import http from 'http';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../infrastructure/database/mongodb/connection/mongoose';
import { createAuthRouter } from '../routes/auth.routes';
import { createAdminRouter } from '../routes/admin.routes';
import { createCompanyRouter } from '../routes/company.routes';
import { authenticateToken } from '../middleware/auth.middleware';
import { errorHandler } from '../middleware/error-handler';
import { env } from '../../infrastructure/config/env';
import { injectable } from 'inversify';
import { AuthController } from '../controllers/auth.controller';
import { AdminController } from '../controllers/admin.controller';
import { CompanyController } from '../controllers/company.controller';
import { OtpController } from '../controllers/otp.controller';
import { container } from '../../infrastructure/di/container';
import { connectRedis } from '../../infrastructure/database/redis/connection/redis';

@injectable()
export class AppServer {
  private app: express.Application;
  private port: number;
  private httpServer: http.Server | null;

  constructor() {
    this.app = express();
    this.port = Number(env.PORT ?? 4000);
    this.httpServer = null;
  }

  public init(): void {
    this.configureMiddlewares();
    this.configureRoutes();
  }

  private configureMiddlewares(): void {
    this.app.use(cors({ 
      origin: env.FRONTEND_URL || 'http://localhost:5173', 
      credentials: true, 
    }));
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(morgan('combined'));
  }

  private configureRoutes(): void {
    const authController = container.get<AuthController>(AuthController);
    const adminController = container.get<AdminController>(AdminController);
    const companyController = container.get<CompanyController>(CompanyController);
    const otpController = container.get<OtpController>(OtpController);

    this.app.get('/health', (req, res) => res.json({ ok: true }));
    this.app.get('/home', authenticateToken, (req, res) =>
      res.json({ message: 'Welcome home' }),
    );
    this.app.use('/api/auth', createAuthRouter(authController, otpController));
    this.app.use('/api/admin', createAdminRouter(adminController));
    this.app.use('/api/company', createCompanyRouter(companyController));
    this.app.use(errorHandler);
  }

  public async connectDatabase(): Promise<void> {
    await connectToDatabase(env.MONGO_URI as string).then(() => {
      console.log('Connected to MongoDB');
    });
    await connectRedis().then(() => {
      console.log('Connected to Redis');
    });
  }

  public start(): void {
    if (this.httpServer) return;
    this.httpServer = this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }

  public async stop(): Promise<void> {
    const server = this.httpServer;
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      this.httpServer = null;
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}
