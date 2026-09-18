 
import Redis from 'ioredis';
import logger from './logger';

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

//   Sliding window algorithm  
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  limit: number;
}

 
export async function rateLimit(
  key: string,
  limit: number,
  windowSecs: number,
): Promise<RateLimitResult> {
  const redis = getRedis();
  const now = Date.now();
  const windowMs = windowSecs * 1000;
  const windowStart = now - windowMs;
 
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, '-inf', windowStart); // remove old entries
  pipeline.zadd(key, now, `${now}-${Math.random()}`);  // record this request
  pipeline.zcard(key);                                  // count window entries
  pipeline.expire(key, windowSecs + 1);                 // auto-clean the key

  let results: [Error | null, unknown][];
  try {
    results = await pipeline.exec() as [Error | null, unknown][];
  } catch (err) {
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
 
export async function rateLimitByIP(
  ip: string,
  limit = 30,
  windowSecs = 60,
): Promise<RateLimitResult> {
  return rateLimit(`rl:ip:${ip}`, limit, windowSecs);
}
 
export async function rateLimitBySiteId(
  siteId: string,
  limit = 500,
  windowSecs = 86400,
): Promise<RateLimitResult> {
  return rateLimit(`rl:site:${siteId}`, limit, windowSecs);
}
 
export async function rateLimitByUserId(
  userId: string,
  limit = 200,
  windowSecs = 3600,
): Promise<RateLimitResult> {
  return rateLimit(`rl:user:${userId}`, limit, windowSecs);
}
