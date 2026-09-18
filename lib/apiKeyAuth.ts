 

import Redis from 'ioredis';
import prisma from './prisma';
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

  _redis.on('error', (err) => logger.error('API auth Redis error', { err }));
  return _redis;
}

const CACHE_TTL_SECONDS = 300; // 5 minutes
const CACHE_PREFIX = 'auth:site:';
const INVALID_SENTINEL = '__INVALID__';

 
export async function validateSiteId(siteId: string): Promise<{ valid: boolean; userId?: string }> {
  if (!siteId?.trim()) return { valid: false };

  const redis = getRedis();
  const cacheKey = `${CACHE_PREFIX}${siteId}`;
 
  try {
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      if (cached === INVALID_SENTINEL) return { valid: false };
      return { valid: true, userId: cached };
    }
  } catch (err) {
    logger.warn('Redis cache miss (error) for siteId validation', { siteId, err });
     
  }
 
  try {
    const model = await prisma.models.findFirst({
      where: {
        collection_name: siteId,
        status: 'COMPLETED',
      },
      select: { userId: true },
    });

    if (!model || !model.userId) { 
      try {
        await redis.setex(cacheKey, CACHE_TTL_SECONDS, INVALID_SENTINEL);
      } catch (_) {   }
      logger.warn('Invalid siteId rejected', { siteId });
      return { valid: false };
    }

     try {
      await redis.setex(cacheKey, CACHE_TTL_SECONDS, model.userId);
    } catch (_) {   }

    return { valid: true, userId: model.userId };
  } catch (err) {
     logger.error('DB lookup failed for siteId validation — failing open', { siteId, err });
    return { valid: true };
  }
}
 
export async function invalidateSiteIdCache(siteId: string): Promise<void> {
  const redis = getRedis();
  try {
    await redis.del(`${CACHE_PREFIX}${siteId}`);
  } catch (err) {
    logger.warn('Failed to invalidate siteId cache', { siteId, err });
  }
}
