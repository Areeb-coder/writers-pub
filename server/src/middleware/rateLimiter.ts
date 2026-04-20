import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import { AppError } from './errorHandler';

interface RateLimitOptions {
  windowMs: number;   // Time window in ms
  max: number;        // Max requests per window
  keyPrefix?: string;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyPrefix = 'rl' } = options;
  const windowSec = Math.ceil(windowMs / 1000);

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const identifier = req.user?.userId || req.ip || 'unknown';
      const key = `${keyPrefix}:${identifier}`;

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSec);
      }

      if (current > max) {
        return next(new AppError('Too many requests. Please try again later.', 429));
      }

      next();
    } catch {
      // If Redis is down, allow the request through
      next();
    }
  };
}

// Pre-configured limiters
export const generalLimiter = rateLimit({ windowMs: 60000, max: 100, keyPrefix: 'rl:gen' });
export const authLimiter = rateLimit({ windowMs: 60000, max: 10, keyPrefix: 'rl:auth' });
export const feedbackLimiter = rateLimit({ windowMs: 60000, max: 5, keyPrefix: 'rl:fb' });
export const aiLimiter = rateLimit({ windowMs: 60000, max: 3, keyPrefix: 'rl:ai' });
