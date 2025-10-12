# Multi-stage Dockerfile for Cupperly API
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files for workspace
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
COPY packages/database/package.json ./packages/database/

# Install dependencies
RUN npm install

# Development stage
FROM base AS development
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/apps/api/package.json ./apps/api/package.json
COPY --from=deps /app/packages ./packages

# Set working directory to API
WORKDIR /app/apps/api

# Expose port
EXPOSE 3001

# Start development server
CMD ["npm", "run", "dev"]

# Production builder stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/apps/api/package.json ./apps/api/package.json

# Copy source code (including packages)
COPY apps/api ./apps/api
COPY packages ./packages

# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/package.json ./package.json

# Copy Prisma files from packages/database
COPY --from=builder --chown=nodejs:nodejs /app/packages/database/schema.prisma ./prisma/schema.prisma
COPY --from=builder --chown=nodejs:nodejs /app/packages/database/migrations ./prisma/migrations
COPY --from=builder --chown=nodejs:nodejs /app/packages/database/seed.ts ./prisma/seed.ts
COPY --from=builder --chown=nodejs:nodejs /app/packages/database/seed-flavors.ts ./prisma/seed-flavors.ts
COPY --from=builder --chown=nodejs:nodejs /app/packages/database/package.json ./prisma/package.json

# Copy production dependencies (includes Prisma client)
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy startup script
COPY --chown=nodejs:nodejs apps/api/start.sh ./start.sh
RUN chmod +x ./start.sh

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# Use startup script that runs migrations before starting
CMD ["./start.sh"]