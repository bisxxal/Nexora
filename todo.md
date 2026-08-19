/**
 * lib/prisma.ts
 *
 * Singleton Prisma client for the Next.js app.
 *
 * PRODUCTION NOTE:
 * PostgreSQL has a default max_connections limit (~100).
 * At scale you MUST use a connection pooler in front of Postgres:
 *
 * Option A — Vercel/Neon/Supabase: Use Prisma Accelerate or their built-in
 *            pooler URL. Set DATABASE_URL to the pooler URL (port 6543).
 *
 * Option B — Self-hosted: Run PgBouncer and point DATABASE_URL at it.
 *            Add ?pgbouncer=true&connection_limit=1 to the URL.
 *
 * Option C — AWS RDS: Use RDS Proxy.
 *
 * This singleton ensures that during hot-reload in dev we don't create
 * multiple Prisma clients (which would exhaust connections quickly).
 */
