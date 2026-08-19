/**
 * next.config.ts
 *
 * Production-safe Next.js configuration.
 *
 * Changes from original:
 *  - TypeScript and ESLint checks re-enabled (hiding build errors is dangerous)
 *  - CORS moved to /api/chat route handler (not globally on all routes)
 *  - Added security headers (X-Frame-Options, CSP, HSTS etc.)
 *  - Added allowedDevOrigins for local Docker dev
 */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── TypeScript & Lint ────────────────────────────────────────────────────
  // These were disabled before — enabling them catches real bugs at build time.
  // Fix any type errors before deploying to production.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ── Standalone Output (required for production Docker image) ─────────────
  // Produces a self-contained server bundle in .next/standalone that
  // can be run with `node server.js` without the full node_modules tree.
  output: 'standalone',

  // ── Images ───────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth avatars
      },
    ],
  },

  // ── Security Headers ─────────────────────────────────────────────────────
  // Applied to all routes EXCEPT /api/chat (which has its own CORS per-route).
  // These headers significantly harden the app against common web attacks.
  async headers() {
    return [
      {
        source: '/((?!api/chat).*)', // exclude /api/chat — it manages its own CORS
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Force HTTPS (1 year)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Basic permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy — adjust as needed for your CDN/fonts
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // needed for Next.js
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://lh3.googleusercontent.com",
              "connect-src 'self' https://generativelanguage.googleapis.com",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // ── Dev Origins ──────────────────────────────────────────────────────────
  allowedDevOrigins: ['localhost', '127.0.0.1'],
};

export default nextConfig;
