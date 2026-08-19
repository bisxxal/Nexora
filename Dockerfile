# ── Build Stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Install dependencies first (better layer caching — only re-runs when package files change)
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Use ci instead of install for reproducible builds, --ignore-scripts is safer
# but we need postinstall (prisma generate), so use regular install
RUN npm ci --ignore-scripts && npx prisma generate

# ── Application Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (ensure it matches the installed version)
RUN npx prisma generate

# Build the Next.js application (production-optimized bundle)
RUN npm run build

# ── Production Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what is needed to run (reduces image size significantly)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use the standalone server (not `npm run start` which needs full node_modules)
CMD ["node", "server.js"]