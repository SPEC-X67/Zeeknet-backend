import { createClient } from 'redis';
import { env } from '../../../config/env';

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on('error', (err) => {
  // Redis client error handling
});

export async function connectRedis(): Promise<void> {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    // Redis connection failed, OTP features will be disabled
  }
}
