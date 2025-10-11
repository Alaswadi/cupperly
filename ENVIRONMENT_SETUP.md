# Environment Setup Guide

This guide explains how to configure the Cupperly application for both local development and production (Coolify) deployment.

## Architecture Overview

- **Frontend (Web)**: Next.js application
  - Local: `http://localhost:3000`
  - Production: `https://demo.cupperly.com`

- **Backend (API)**: Express.js application
  - Local: `http://localhost:3001`
  - Production: `https://api.cupperly.com`

## Local Development Setup

### 1. Root Environment Variables (`.env`)

The root `.env` file is already configured for local development:

```env
# API Configuration
API_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Application Configuration
PORT="3001"
WEB_PORT="3000"
```

### 2. Backend Environment Variables (`apps/api/.env`)

The backend `.env` is configured to run on port 3001:

```env
PORT="3001"
API_URL="http://localhost:3001"
```

### 3. Running Locally

```bash
# Start the backend API (from root directory)
cd apps/api
npm run dev
# API will run on http://localhost:3001

# Start the frontend (from root directory, in a new terminal)
cd apps/web
npm run dev
# Web will run on http://localhost:3000
```

The frontend will automatically connect to the backend at `http://localhost:3001`.

## Production Setup (Coolify)

### Architecture

In production, you have two separate domains:
- **Frontend**: `https://demo.cupperly.com`
- **Backend API**: `https://api.cupperly.com`

### Coolify Configuration

You need to set up **TWO separate services** in Coolify:

#### Service 1: Backend API (api.cupperly.com)

**Domain**: `api.cupperly.com`

**Environment Variables**:
```env
NODE_ENV=production
PORT=3001

# Database (use your Coolify database service)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_DB_HOST:5432/cupperly

# Redis (use your Coolify redis service)
REDIS_URL=redis://YOUR_REDIS_HOST:6379

# JWT Secrets (generate strong random strings)
JWT_SECRET=YOUR_SECURE_JWT_SECRET_MIN_32_CHARS
JWT_REFRESH_SECRET=YOUR_SECURE_REFRESH_SECRET_MIN_32_CHARS
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# NextAuth
NEXTAUTH_SECRET=YOUR_SECURE_NEXTAUTH_SECRET_MIN_32_CHARS

# API Configuration
API_URL=https://api.cupperly.com
WEB_URL=https://demo.cupperly.com

# Multi-tenancy
DEFAULT_TENANT=demo
TENANT_SUBDOMAIN_ENABLED=false

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined
```

**Build Configuration**:
- Build Command: `cd apps/api && npm install && npm run build`
- Start Command: `cd apps/api && npm start`
- Port: `3001`

#### Service 2: Frontend Web (demo.cupperly.com)

**Domain**: `demo.cupperly.com`

**Environment Variables**:
```env
NODE_ENV=production
WEB_PORT=3000

# IMPORTANT: Point to the API domain
NEXT_PUBLIC_API_URL=https://api.cupperly.com
API_URL=https://api.cupperly.com

# NextAuth
NEXTAUTH_URL=https://demo.cupperly.com
NEXTAUTH_SECRET=YOUR_SECURE_NEXTAUTH_SECRET_MIN_32_CHARS

# Same JWT secrets as backend
JWT_SECRET=YOUR_SECURE_JWT_SECRET_MIN_32_CHARS
JWT_REFRESH_SECRET=YOUR_SECURE_REFRESH_SECRET_MIN_32_CHARS
```

**Build Configuration**:
- Build Command: `cd apps/web && npm install && npm run build`
- Start Command: `cd apps/web && npm start`
- Port: `3000`

### Important Notes for Production

1. **CORS Configuration**: The backend is already configured to allow requests from `demo.cupperly.com`

2. **Credentials**: Make sure both services use the same JWT secrets so tokens work across domains

3. **HTTPS**: Both domains should use HTTPS (Coolify handles this automatically)

4. **Database & Redis**: Both services should connect to the same database and Redis instances

5. **Environment Variables**: Use Coolify's environment variable management, not `.env` files in production

## Testing the Connection

### Local Development

1. Start the backend:
   ```bash
   cd apps/api
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd apps/web
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser

4. Try to login - if successful, the connection is working!

### Production (Coolify)

1. Open `https://demo.cupperly.com` in your browser

2. Open browser DevTools (F12) → Network tab

3. Try to login

4. Check the network requests - they should go to `https://api.cupperly.com/api/auth/login`

5. If you see CORS errors, check:
   - Backend environment variable `WEB_URL=https://demo.cupperly.com`
   - Frontend environment variable `NEXT_PUBLIC_API_URL=https://api.cupperly.com`

## Troubleshooting

### Issue: "Network Error" or "Failed to fetch"

**Solution**: Check that:
- Backend is running and accessible at the configured URL
- CORS is properly configured in `apps/api/src/index.ts`
- Environment variables are set correctly

### Issue: CORS errors in production

**Solution**: Verify in Coolify:
- Backend has `WEB_URL=https://demo.cupperly.com`
- Frontend has `NEXT_PUBLIC_API_URL=https://api.cupperly.com`
- Both services are running

### Issue: Authentication not working

**Solution**: Ensure:
- Both frontend and backend use the **same** JWT secrets
- `withCredentials: true` is set in the API client (already configured)
- Cookies are being sent with requests

### Issue: "Cannot connect to database"

**Solution**: Check:
- Database service is running in Coolify
- `DATABASE_URL` is correct in backend environment variables
- Database host is accessible from the backend service

## Quick Reference

### Environment Variables Summary

| Variable | Local | Production Frontend | Production Backend |
|----------|-------|-------------------|-------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | `https://api.cupperly.com` | N/A |
| `API_URL` | `http://localhost:3001` | `https://api.cupperly.com` | `https://api.cupperly.com` |
| `WEB_URL` | `http://localhost:3000` | N/A | `https://demo.cupperly.com` |
| `PORT` | `3001` (API) | N/A | `3001` |
| `WEB_PORT` | `3000` | `3000` | N/A |
| `NODE_ENV` | `development` | `production` | `production` |

### Key Files Modified

1. **`.env`** - Root environment for local development (updated PORT to 3001)
2. **`apps/api/src/index.ts`** - CORS configuration updated for production domains
3. **`apps/web/next.config.js`** - Rewrites disabled in production (uses direct API calls)
4. **`apps/web/src/lib/api.ts`** - Already configured to use `NEXT_PUBLIC_API_URL`

## Next Steps

1. ✅ Local development is configured and ready to use
2. 📋 Copy `.env.production.coolify` values to your Coolify services
3. 🚀 Deploy both services in Coolify
4. 🧪 Test the connection using the steps above

