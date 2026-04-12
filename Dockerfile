# syntax=docker/dockerfile:1

# ─── Stage 1: deps ──────────────────────────────────────────────────────────
# npm ci runs the "postinstall" script which calls "prisma generate",
# writing the generated client to src/generated/prisma/ (gitignored, so it
# must be carried forward explicitly).
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

# ─── Stage 2: build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Full source (excludes gitignored src/generated/prisma/)
COPY . .
# 2. node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# 3. Prisma-generated client (gitignored; produced by postinstall in deps)
COPY --from=deps /app/src/generated ./src/generated

# DATABASE_URL is NOT required at build time. next build is a pure TS/JS
# compilation — no DB connection is made.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 3: runner ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# next.config.ts sets output:"standalone" which produces a self-contained
# .next/standalone/server.js with all required node_modules bundled.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static   ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public         ./public

USER nextjs

EXPOSE 3000

# DATABASE_URL must be injected by the orchestrator at runtime.
# GET /api/health returns {"status":"ok"} without requiring DATABASE_URL.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
