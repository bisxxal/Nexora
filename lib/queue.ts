import { Queue } from 'bullmq';

const useTls = process.env.REDIS_TLS === 'true';

const connection = process.env.REDIS_URL
  ? {
       url: process.env.REDIS_URL,
      tls: useTls ? {} : undefined,
    }
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      tls: useTls ? {} : undefined,
    };

export const embeddingQueue = new Queue('embedding-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5s → 10s → 20s
    },
    removeOnComplete: { count: 100 },  
    removeOnFail: { count: 200 }, 
  },
});
