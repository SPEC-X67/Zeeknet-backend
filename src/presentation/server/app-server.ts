import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import http from 'http';
import mongoose from 'mongoose';
import { injectable } from 'inversify';

// Infrastructure imports
import { connectToDatabase } from '../../infrastructure/database/mongodb/connection/mongoose';
import { connectRedis } from '../../infrastructure/database/redis/connection/redis';
import { env } from '../../infrastructure/config/env';

// Presentation imports
import { createAuthRouter } from '../routes/auth.routes';
import { createAdminRouter } from '../routes/admin.routes';
import { createCompanyRouter } from '../routes/company.routes';
import { authenticateToken } from '../middleware/auth.middleware';
import { errorHandler } from '../middleware/error-handler';

// Controllers
import { AuthController } from '../controllers/auth.controller';
import { AdminController } from '../controllers/admin.controller';
import { CompanyController } from '../controllers/company.controller';
import { OtpController } from '../controllers/otp.controller';

// DI imports
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../infrastructure/di/types';

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
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({ 
      origin: env.FRONTEND_URL || 'http://localhost:5173', 
      credentials: true, 
    }));
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(cookieParser());
    
    // Logging middleware
    this.app.use(morgan('combined'));
  }

  private configureRoutes(): void {
    // Get controllers from DI container
    const authController = container.get<AuthController>(TYPES.AuthController);
    const adminController = container.get<AdminController>(TYPES.AdminController);
    const companyController = container.get<CompanyController>(TYPES.CompanyController);
    const otpController = container.get<OtpController>(TYPES.OtpController);

    // Health check endpoint
    this.app.get('/health', (req, res) => res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }));

    // Protected home route
    this.app.get('/home', authenticateToken, (req, res) =>
      res.json({ message: 'Welcome to ZeekNet Job Portal API' }),
    );

    // API routes
    this.app.use('/api/auth', createAuthRouter(authController, otpController));
    this.app.use('/api/admin', createAdminRouter(adminController));
    this.app.use('/api/company', createCompanyRouter(companyController));

    // Error handling middleware (must be last)
    this.app.use(errorHandler);
  }

  public async connectDatabase(): Promise<void> {
    try {
      await connectToDatabase(env.MONGO_URI as string);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }

    try {
      await connectRedis();
      console.log('✅ Connected to Redis');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  public start(): void {
    if (this.httpServer) {
      console.log('⚠️ Server is already running');
      return;
    }
    
    this.httpServer = this.app.listen(this.port, () => {
      console.log(`🌐 Server running on port ${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
    });
  }

  public async stop(): Promise<void> {
    console.log('🛑 Stopping server...');
    
    // Close HTTP server
    if (this.httpServer) {
      await new Promise<void>((resolve, reject) => {
        this.httpServer!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      this.httpServer = null;
      console.log('✅ HTTP server closed');
    }

    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    }
  }
}
 