import { injectable } from 'inversify';
import { Request, Response } from 'express';
import { env } from '../../infrastructure/config/env';

@injectable()
export class TestController {
  checkEnv = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        message: 'Environment check successful',
        env: {
          NODE_ENV: process.env.NODE_ENV,
          PORT: env.PORT,
          MONGO_URI: env.MONGO_URI ? 'SET' : 'NOT SET',
          JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET ? 'SET' : 'NOT SET',
          JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET ? 'SET' : 'NOT SET',
          REDIS_URL: env.REDIS_URL ? 'SET' : 'NOT SET',
          EMAIL_USER: env.EMAIL_USER ? 'SET' : 'NOT SET',
          AWS_REGION: env.AWS_REGION ? 'SET' : 'NOT SET',
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Environment check failed' });
    }
  };
}
