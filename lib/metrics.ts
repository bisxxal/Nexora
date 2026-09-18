 
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

  _redis.on('error', (err) => logger.error('Metrics Redis error', { err }));
  return _redis;
}

 const PREFIX = 'metrics:';
 
async function incrementCounter(name: string, by = 1): Promise<void> {
  try {
    await getRedis().incrby(`${PREFIX}counter:${name}`, by);
  } catch (err) {
    logger.warn('metrics.incrementCounter failed', { name, err });
  }
}
 
async function getCounter(name: string): Promise<number> {
  try {
    const val = await getRedis().get(`${PREFIX}counter:${name}`);
    return val ? parseInt(val) : 0;
  } catch {
    return 0;
  }
}
 
const MAX_LATENCY_SAMPLES = 1000;

 
async function recordLatency(name: string, ms: number): Promise<void> {
  try {
    const key = `${PREFIX}latency:${name}`;
    const redis = getRedis();
    await redis.lpush(key, ms.toString());
    await redis.ltrim(key, 0, MAX_LATENCY_SAMPLES - 1);
  } catch (err) {
    logger.warn('metrics.recordLatency failed', { name, err });
  }
}
 
async function getLatencyStats(name: string): Promise<{ p50: number; p95: number; p99: number; count: number }> {
  try {
    const key = `${PREFIX}latency:${name}`;
    const raw = await getRedis().lrange(key, 0, -1);
    if (!raw.length) return { p50: 0, p95: 0, p99: 0, count: 0 };

    const sorted = raw.map(Number).sort((a, b) => a - b);
    const count = sorted.length;
    const p = (pct: number) => sorted[Math.floor((pct / 100) * count)] ?? 0;

    return { p50: p(50), p95: p(95), p99: p(99), count };
  } catch {
    return { p50: 0, p95: 0, p99: 0, count: 0 };
  }
}
 
async function getSnapshot(): Promise<Record<string, unknown>> {
  const [
    chatRequests,
    chatErrors,
    chatRateLimited,
    embeddingQueued,
    embeddingCompleted,
    embeddingFailed,
    llmLatency,
    embeddingLatency,
  ] = await Promise.all([
    getCounter('chat.requests'),
    getCounter('chat.errors'),
    getCounter('chat.rate_limited'),
    getCounter('embedding.queued'),
    getCounter('embedding.completed'),
    getCounter('embedding.failed'),
    getLatencyStats('chat.llm_ms'),
    getLatencyStats('embedding.duration_ms'),
  ]);

  return {
    chat: {
      requests: chatRequests,
      errors: chatErrors,
      rateLimited: chatRateLimited,
      llmLatency,
    },
    embedding: {
      queued: embeddingQueued,
      completed: embeddingCompleted,
      failed: embeddingFailed,
      latency: embeddingLatency,
    },
    ts: new Date().toISOString(),
  };
}

 export const METRIC = {
  CHAT_REQUEST:        'chat.requests',
  CHAT_ERROR:          'chat.errors',
  CHAT_RATE_LIMITED:   'chat.rate_limited',
  CHAT_INVALID_SITE:   'chat.invalid_site',
  EMBEDDING_QUEUED:    'embedding.queued',
  EMBEDDING_COMPLETED: 'embedding.completed',
  EMBEDDING_FAILED:    'embedding.failed',
} as const;

const metrics = {
  incrementCounter,
  getCounter,
  recordLatency,
  getLatencyStats,
  getSnapshot,
};

export default metrics;
