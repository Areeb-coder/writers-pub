import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) {
      console.error('[Redis] Max retries reached, stopping reconnect.');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

redis.on('connect', () => {
  console.log('[Redis] Connected');
});

redis.on('error', (err) => {
  console.error('[Redis] Error:', err.message);
});

export async function connectRedis() {
  try {
    await redis.connect();
    return true;
  } catch (err: any) {
    console.warn('[Redis] Connection failed (non-fatal):', err.message);
    return false;
  }
}
