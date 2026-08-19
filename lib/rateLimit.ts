/**
 * lib/rateLimit.ts
 *
 * sliding window rate limiter.
 *
 * Usage:
 *   const result = await rateLimitByIP(ip, 20, 60);  // 20 req per 60s
 *   if (!result.allowed) return 429;
 *
 *   const result = await rateLimitBySiteId(siteId, 100, 86400); // 100/day
 */

import Redis from 'ioredis';
import logger from './logger';

 // Re-uses the same env vars as queue.ts. This is a separate lightweight client.
const redisUrl = process.env.REDIS_URL;
const useTls = process.env.REDIS_TLS === 'true';

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (_redis) return _redis;

  if (redisUrl) {
    _redis = new Redis(redisUrl, { tls: useTls ? {} : undefined, lazyConnect: true });
  } else {
    _redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      tls: useTls ? {} : undefined,
      lazyConnect: true,
    });
  }

  _redis.on('error', (err) => logger.error('Rate-limit Redis error', { err }));
  return _redis;
}

// ── Sliding window algorithm  
export interface RateLimitResult {
  /** Whether the request is allowed to proceed */
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Seconds until the window resets */
  resetInSeconds: number;
  /** The limit that was applied */
  limit: number;
}

/**
 * Sliding window rate limiter using Redis sorted sets.
 * Each unique key tracks timestamps of requests within the window.
 *
 * @param key         Unique rate-limit key (e.g. "rl:ip:1.2.3.4")
 * @param limit       Maximum requests allowed in the window
 * @param windowSecs  Window size in seconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSecs: number,
): Promise<RateLimitResult> {
  const redis = getRedis();
  const now = Date.now();
  const windowMs = windowSecs * 1000;
  const windowStart = now - windowMs;

  // Use a pipeline for atomicity and fewer round-trips
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, '-inf', windowStart); // remove old entries
  pipeline.zadd(key, now, `${now}-${Math.random()}`);  // record this request
  pipeline.zcard(key);                                  // count window entries
  pipeline.expire(key, windowSecs + 1);                 // auto-clean the key

  let results: [Error | null, unknown][];
  try {
    results = await pipeline.exec() as [Error | null, unknown][];
  } catch (err) {
    // Redis failure → fail open (don't block users if Redis is down)
    logger.warn('Rate limit Redis pipeline failed — failing open', { key, err });
    return { allowed: true, remaining: limit, resetInSeconds: windowSecs, limit };
  }

  const countResult = results[2];
  const count = (countResult && !countResult[0]) ? (countResult[1] as number) : 0;

  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);
  const resetInSeconds = windowSecs;

  return { allowed, remaining, resetInSeconds, limit };
}

// ── Convenience helpers  

/**
 * Rate limit by client IP address.
 * Default: 30 requests per minute.
 */
export async function rateLimitByIP(
  ip: string,
  limit = 30,
  windowSecs = 60,
): Promise<RateLimitResult> {
  return rateLimit(`rl:ip:${ip}`, limit, windowSecs);
}

/**
 * Rate limit per siteId (chatbot widget).
 * Default: 500 requests per day.
 */
export async function rateLimitBySiteId(
  siteId: string,
  limit = 500,
  windowSecs = 86400,
): Promise<RateLimitResult> {
  return rateLimit(`rl:site:${siteId}`, limit, windowSecs);
}

/**
 * Rate limit per authenticated user.
 * Default: 200 requests per hour.
 */
export async function rateLimitByUserId(
  userId: string,
  limit = 200,
  windowSecs = 3600,
): Promise<RateLimitResult> {
  return rateLimit(`rl:user:${userId}`, limit, windowSecs);
}
