# Multi-stage Dockerfile for CuppingLab API
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN npm ci --only=production

# Development stage
FROM base AS development
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy source code
COPY . .

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
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy source code
COPY . .

# Build the application
WORKDIR /app/apps/api
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/package.json ./package.json

# Copy production dependencies
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "index.js"]