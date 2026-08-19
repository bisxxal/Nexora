/**
 * app/api/chat/route.ts
 *
 * Public chat endpoint — called by embedded widgets on third-party websites.
 *
 * Security layers applied in order:
 *  1. CORS — allow only requests from origins registered with their siteId
 *  2. Rate limiting — 30 req/min per IP, 500 req/day per siteId
 *  3. siteId validation — must belong to a real, COMPLETED model in the DB
 *  4. Input validation
 *  5. AI call with quota check
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatAIAction } from '@/action/chat.ai';
import { rateLimitByIP, rateLimitBySiteId } from '@/lib/rateLimit';
import { validateSiteId } from '@/lib/apiKeyAuth';
import logger from '@/lib/logger';
import metrics, { METRIC } from '@/lib/metrics';

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allow all origins for embedded widgets — the real auth layer is siteId
// validation (the siteId must exist in our DB). This is intentional.
// If you want to lock down to known domains, add them to the allowlist below.
function corsHeaders(origin?: string | null): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

// ── POST /api/chat ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  // 1. Get client IP for rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  // 2. Rate limit by IP first (cheapest check — no DB/Redis lookup)
  const ipLimit = await rateLimitByIP(ip, 30, 60);
  if (!ipLimit.allowed) {
    await metrics.incrementCounter(METRIC.CHAT_RATE_LIMITED);
    logger.warn('Rate limited by IP', { ip });
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': String(ipLimit.resetInSeconds),
          'X-RateLimit-Limit': String(ipLimit.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + ipLimit.resetInSeconds),
        },
      }
    );
  }

  // 3. Parse and validate body
  let body: { message?: string; siteId?: string; uniqueId?: string; sessionId?: string; botName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400, headers });
  }

  const { message, siteId, uniqueId, sessionId, botName } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required.' }, { status: 400, headers });
  }
  if (!siteId?.trim() || !uniqueId?.trim()) {
    return NextResponse.json({ error: 'siteId and uniqueId are required.' }, { status: 400, headers });
  }

  // 4. Rate limit by siteId (500 req/day per chatbot widget)
  const siteLimit = await rateLimitBySiteId(siteId, 500, 86400);
  if (!siteLimit.allowed) {
    await metrics.incrementCounter(METRIC.CHAT_RATE_LIMITED);
    logger.warn('Rate limited by siteId', { siteId });
    return NextResponse.json(
      { error: 'Daily request limit for this widget has been reached.' },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': String(siteLimit.resetInSeconds),
        },
      }
    );
  }

  // 5. Validate siteId — must be a real, COMPLETED model
  const authResult = await validateSiteId(siteId);
  if (!authResult.valid) {
    await metrics.incrementCounter(METRIC.CHAT_INVALID_SITE);
    logger.warn('Invalid or inactive siteId rejected', { siteId, ip });
    return NextResponse.json(
      { error: 'The requested chatbot is not available.' },
      { status: 403, headers }
    );
  }

  // 6. AI call
  await metrics.incrementCounter(METRIC.CHAT_REQUEST);
  logger.info('Chat request', { siteId, sessionId, ip });

  try {
    const reply = await chatAIAction(
      message,
      siteId,
      uniqueId,
      sessionId ?? 'widget-session',
      [],
      botName ?? 'AI Assistant'
    );

    const latencyMs = Date.now() - startTime;
    await metrics.recordLatency('chat.llm_ms', latencyMs);
    logger.info('Chat response sent', { siteId, latencyMs });

    return NextResponse.json({ reply }, { status: 200, headers });
  } catch (err) {
    await metrics.incrementCounter(METRIC.CHAT_ERROR);
    logger.error('Chat action failed', { err, siteId, ip });
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500, headers }
    );
  }
}
