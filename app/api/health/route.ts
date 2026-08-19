/**
 * app/api/health/route.ts
 *
 * Health check endpoint used by Docker/Kubernetes readiness probes.
 * Returns 200 if the app can reach Postgres.
 * Returns 503 if Postgres is unreachable.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Simple DB ping
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'ok',
        ts: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database unreachable',
        ts: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
