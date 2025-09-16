require('dotenv').config();
import 'reflect-metadata';
import { container } from './infrastructure/di/container';
import { TYPES } from './infrastructure/di/types';
import { AppServer } from './presentation/server/app-server';

async function bootstrap() {
  try {
    const server = container.get<AppServer>(TYPES.AppServer);
    server.init();
    await server.connectDatabase();
    server.start();

    const shutdown = async (signal: string) => {
      try {
        await server.stop();
        process.exit(0);
      } catch (err) {
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  process.exit(1);
});
