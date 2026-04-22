import Redis from 'ioredis';
import { env } from './env';

const maskUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.username ? '***:***@' : ''}${parsed.host}`;
  } catch {
    return 'invalid-url';
  }
};

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) {
      console.error('[Redis] Max retries reached, stopping reconnect.');
      return null;
    }
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  lazyConnect: true,
  // Add SSL support if needed (Upstash usually requires it)
  tls: env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
});

redis.on('connect', () => {
  console.log(`[Redis] Connected to ${maskUrl(env.REDIS_URL)}`);
});

redis.on('error', (err) => {
  console.error('[Redis] Connection Error:', err.message);
});

export async function connectRedis() {
  try {
    if (redis.status === 'ready' || redis.status === 'connecting') return true;
    await redis.connect();
    console.log('[Redis] Connection initialized');
    return true;
  } catch (err: any) {
    console.error('[Redis] Connection initialization failed:', err.message);
    return false;
  }
}

