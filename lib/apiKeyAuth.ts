/**
 * lib/apiKeyAuth.ts
 *
 * Validates that a siteId (Qdrant collection name) belongs to a real,
 * COMPLETED model in the database. Results are cached in Redis for 5 minutes
 * to avoid a DB hit on every single chat request.
 *
 * Usage:
 *   const valid = await validateSiteId(siteId);
 *   if (!valid) return 403;
 */

import Redis from 'ioredis';
import prisma from './prisma';
import logger from './logger';

// ── Shared Redis client (same pattern as rateLimit.ts) ───────────────────────
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

/**
 * Returns the userId that owns this siteId, or null if invalid.
 * Caches the result in Redis for 5 minutes.
 */
export async function validateSiteId(siteId: string): Promise<{ valid: boolean; userId?: string }> {
  if (!siteId?.trim()) return { valid: false };

  const redis = getRedis();
  const cacheKey = `${CACHE_PREFIX}${siteId}`;

  // 1. Check Redis cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      if (cached === INVALID_SENTINEL) return { valid: false };
      return { valid: true, userId: cached };
    }
  } catch (err) {
    logger.warn('Redis cache miss (error) for siteId validation', { siteId, err });
    // Fall through to DB lookup
  }

  // 2. DB lookup
  try {
    const model = await prisma.models.findFirst({
      where: {
        collection_name: siteId,
        status: 'COMPLETED',
      },
      select: { userId: true },
    });

    if (!model || !model.userId) {
      // Cache the negative result to avoid DB hammering
      try {
        await redis.setex(cacheKey, CACHE_TTL_SECONDS, INVALID_SENTINEL);
      } catch (_) { /* ignore cache write errors */ }
      logger.warn('Invalid siteId rejected', { siteId });
      return { valid: false };
    }

    // Cache the valid userId
    try {
      await redis.setex(cacheKey, CACHE_TTL_SECONDS, model.userId);
    } catch (_) { /* ignore */ }

    return { valid: true, userId: model.userId };
  } catch (err) {
    // DB failure → fail open to avoid blocking legitimate users
    logger.error('DB lookup failed for siteId validation — failing open', { siteId, err });
    return { valid: true };
  }
}

/**
 * Invalidates the cache for a siteId.
 * Call this when a model's status changes (e.g. PENDING → COMPLETED, or deleted).
 */
export async function invalidateSiteIdCache(siteId: string): Promise<void> {
  const redis = getRedis();
  try {
    await redis.del(`${CACHE_PREFIX}${siteId}`);
  } catch (err) {
    logger.warn('Failed to invalidate siteId cache', { siteId, err });
  }
}
