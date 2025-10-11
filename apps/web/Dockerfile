# Multi-stage build for Next.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files for workspace setup
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
COPY packages/database/package.json ./packages/database/

# Install dependencies
RUN npm ci --legacy-peer-deps


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/apps/web/package.json ./apps/web/package.json

# Copy source code (web app and packages)
COPY apps/web ./apps/web
COPY packages ./packages

# Ensure next.config.js is present (it should be in apps/web already, but let's be explicit)
RUN test -f apps/web/next.config.js || (echo "ERROR: next.config.js not found!" && exit 1)

# Verify next.config.js exists
RUN echo "=== Checking next.config.js ===" && \
    cat apps/web/next.config.js && \
    echo "=== End next.config.js ==="

# Build from root to maintain monorepo structure
RUN npm run build --workspace=apps/web

# Debug: Verify standalone output was created
RUN echo "=== Checking build output ===" && \
    ls -la apps/web/.next/ && \
    echo "=== Checking standalone folder ===" && \
    ls -la apps/web/.next/standalone/ && \
    echo "=== Checking standalone .next folder ===" && \
    ls -la apps/web/.next/standalone/.next/ 2>/dev/null || echo "No .next in standalone" && \
    echo "=== Looking for server.js ===" && \
    find apps/web/.next/standalone -name "server.js" -type f

# Manually copy node_modules to standalone since monorepo standalone doesn't include them
RUN cp -r node_modules apps/web/.next/standalone/node_modules

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output which includes everything needed to run
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# Copy static files to the correct location
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
# Copy public folder
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./public

# Debug: Check what was copied
RUN echo "=== Checking /app contents ===" && \
    ls -la /app/ && \
    echo "=== Checking for node_modules ===" && \
    ls -la /app/node_modules/ 2>/dev/null || echo "No node_modules found" && \
    echo "=== Checking for next module ===" && \
    ls -la /app/node_modules/next 2>/dev/null || echo "Next module not found"

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]

# Development stage
FROM base AS development
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/apps/web/package.json ./apps/web/package.json
COPY --from=deps /app/packages ./packages

# Set working directory to web app
WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npm", "run", "dev"]
