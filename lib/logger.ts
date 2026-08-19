/**
 * lib/logger.ts
 *
 * Structured JSON logger for production.
 * - In production: JSON lines (compatible with Datadog / CloudWatch / Loki)
 * - In development: human-readable coloured output
 *
 * Usage:
 *   import logger from '@/lib/logger';
 *   logger.info('Chat request received', { siteId, sessionId });
 *   logger.error('LLM call failed', { err, siteId });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV !== 'production';

const LEVEL_COLOURS: Record<LogLevel, string> = {
  debug: '\x1b[36m',  // cyan
  info:  '\x1b[32m',  // green
  warn:  '\x1b[33m',  // yellow
  error: '\x1b[31m',  // red
};
const RESET = '\x1b[0m';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum level: debug in dev, info in prod
const MIN_LEVEL: LogLevel = isDev ? 'debug' : 'info';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[MIN_LEVEL];
}

function formatError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: isDev ? err.stack : undefined,
    };
  }
  return { raw: String(err) };
}

function buildMeta(meta?: LogMeta): LogMeta {
  const out: LogMeta = {};
  if (!meta) return out;
  for (const [k, v] of Object.entries(meta)) {
    if (k === 'err' || k === 'error') {
      out[k] = formatError(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function log(level: LogLevel, message: string, meta?: LogMeta): void {
  if (!shouldLog(level)) return;

  const timestamp = new Date().toISOString();

  if (isDev) {
    const colour = LEVEL_COLOURS[level];
    const prefix = `${colour}[${level.toUpperCase()}]${RESET}`;
    const metaStr = meta ? `\n  ${JSON.stringify(buildMeta(meta), null, 2).replace(/\n/g, '\n  ')}` : '';
    console.log(`${timestamp} ${prefix} ${message}${metaStr}`);
  } else {
    // Structured JSON for log aggregators
    const entry = {
      ts: timestamp,
      level,
      msg: message,
      ...buildMeta(meta),
    };
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(JSON.stringify(entry));
  }
}

const logger = {
  debug: (message: string, meta?: LogMeta) => log('debug', message, meta),
  info:  (message: string, meta?: LogMeta) => log('info',  message, meta),
  warn:  (message: string, meta?: LogMeta) => log('warn',  message, meta),
  error: (message: string, meta?: LogMeta) => log('error', message, meta),
};

export default logger;
