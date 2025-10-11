# Coolify Setup Checklist

Use this checklist to ensure your Cupperly application is properly configured in Coolify.

## Prerequisites

- [ ] Coolify instance is running
- [ ] Two domains are configured:
  - [ ] `demo.cupperly.com` (Frontend)
  - [ ] `api.cupperly.com` (Backend API)
- [ ] DNS records are pointing to your Coolify server
- [ ] SSL certificates are configured (Coolify handles this automatically)

## Database Setup

- [ ] PostgreSQL database service created in Coolify
- [ ] Database name: `cupperly`
- [ ] Database password is secure and saved
- [ ] Database is accessible from both services
- [ ] Note the internal database URL (e.g., `postgresql://postgres:password@postgres:5432/cupperly`)

## Redis Setup (Optional but recommended)

- [ ] Redis service created in Coolify
- [ ] Note the internal Redis URL (e.g., `redis://redis:6379`)

## Backend API Service (api.cupperly.com)

### Service Configuration

- [ ] Service name: `cupperly-api` (or similar)
- [ ] Domain: `api.cupperly.com`
- [ ] Port: `3001`
- [ ] Repository: Connected to your Git repository
- [ ] Branch: `main` (or your production branch)

### Build Settings

- [ ] Build Command: `cd apps/api && npm install && npm run build`
- [ ] Start Command: `cd apps/api && npm start`
- [ ] Base Directory: `/` (root of repository)

### Environment Variables

Copy these to Coolify and replace placeholder values:

```env
NODE_ENV=production
PORT=3001

# Database - REPLACE WITH YOUR VALUES
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_DB_HOST:5432/cupperly

# Redis - REPLACE WITH YOUR VALUES
REDIS_URL=redis://YOUR_REDIS_HOST:6379

# JWT Secrets - GENERATE STRONG RANDOM STRINGS (min 32 characters)
JWT_SECRET=REPLACE_WITH_RANDOM_STRING_MIN_32_CHARS
JWT_REFRESH_SECRET=REPLACE_WITH_RANDOM_STRING_MIN_32_CHARS
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# NextAuth - GENERATE STRONG RANDOM STRING
NEXTAUTH_SECRET=REPLACE_WITH_RANDOM_STRING_MIN_32_CHARS

# API Configuration - USE YOUR ACTUAL DOMAINS
API_URL=https://api.cupperly.com
WEB_URL=https://demo.cupperly.com

# Multi-tenancy
DEFAULT_TENANT=demo
TENANT_SUBDOMAIN_ENABLED=false

# Feature Flags
ENABLE_VOICE_TRANSCRIPTION=true
ENABLE_REAL_TIME_COLLABORATION=true
ENABLE_ANALYTICS=true

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined
```

### Verification

- [ ] Service builds successfully
- [ ] Service starts without errors
- [ ] Health check endpoint works: `https://api.cupperly.com/api/health`
- [ ] Check logs for any errors

## Frontend Web Service (demo.cupperly.com)

### Service Configuration

- [ ] Service name: `cupperly-web` (or similar)
- [ ] Domain: `demo.cupperly.com`
- [ ] Port: `3000`
- [ ] Repository: Same Git repository as backend
- [ ] Branch: `main` (or your production branch)

### Build Settings

- [ ] Build Command: `cd apps/web && npm install && npm run build`
- [ ] Start Command: `cd apps/web && npm start`
- [ ] Base Directory: `/` (root of repository)

### Environment Variables

Copy these to Coolify and use the SAME secrets as backend:

```env
NODE_ENV=production
WEB_PORT=3000

# API Configuration - MUST MATCH YOUR API DOMAIN
NEXT_PUBLIC_API_URL=https://api.cupperly.com
API_URL=https://api.cupperly.com

# NextAuth - USE YOUR FRONTEND DOMAIN
NEXTAUTH_URL=https://demo.cupperly.com
NEXTAUTH_SECRET=SAME_AS_BACKEND_NEXTAUTH_SECRET

# JWT Secrets - MUST BE SAME AS BACKEND
JWT_SECRET=SAME_AS_BACKEND_JWT_SECRET
JWT_REFRESH_SECRET=SAME_AS_BACKEND_JWT_REFRESH_SECRET

# Feature Flags (optional)
ENABLE_VOICE_TRANSCRIPTION=true
ENABLE_REAL_TIME_COLLABORATION=true
ENABLE_ANALYTICS=true
```

### Verification

- [ ] Service builds successfully
- [ ] Service starts without errors
- [ ] Website loads: `https://demo.cupperly.com`
- [ ] Check browser console for errors
- [ ] Check logs for any errors

## Testing the Complete Setup

### 1. Basic Connectivity

- [ ] Open `https://demo.cupperly.com` in browser
- [ ] Page loads without errors
- [ ] No CORS errors in browser console (F12 → Console)

### 2. API Connection

- [ ] Open browser DevTools (F12) → Network tab
- [ ] Try to access login page
- [ ] Check that API requests go to `https://api.cupperly.com`
- [ ] Requests should return 200 or appropriate status codes (not CORS errors)

### 3. Authentication Flow

- [ ] Try to register a new organization
- [ ] Try to login with credentials
- [ ] Check that authentication token is received
- [ ] Check that you're redirected to dashboard after login
- [ ] Verify that authenticated requests work (e.g., loading samples, sessions)

### 4. Database Connection

- [ ] Login successfully (proves database connection works)
- [ ] Create a sample (proves write operations work)
- [ ] View samples list (proves read operations work)
- [ ] Create a cupping session (proves complex operations work)

### 5. Full Application Test

- [ ] Navigate through all main pages (Dashboard, Samples, Sessions, etc.)
- [ ] Create a new sample
- [ ] Create a new cupping session
- [ ] Submit scores for a session
- [ ] Generate a report
- [ ] Check that all features work as expected

## Common Issues and Solutions

### Issue: CORS Errors

**Symptoms**: Browser console shows CORS policy errors

**Solutions**:
- [ ] Verify `WEB_URL=https://demo.cupperly.com` in backend environment
- [ ] Verify `NEXT_PUBLIC_API_URL=https://api.cupperly.com` in frontend environment
- [ ] Restart both services after changing environment variables
- [ ] Check backend logs for CORS configuration

### Issue: 502 Bad Gateway

**Symptoms**: Website shows 502 error

**Solutions**:
- [ ] Check service logs in Coolify
- [ ] Verify service is running
- [ ] Check that port configuration is correct (3000 for web, 3001 for API)
- [ ] Verify build completed successfully

### Issue: Database Connection Failed

**Symptoms**: API logs show database connection errors

**Solutions**:
- [ ] Verify `DATABASE_URL` is correct
- [ ] Check database service is running
- [ ] Verify database host is accessible from API service
- [ ] Check database credentials are correct

### Issue: Authentication Not Working

**Symptoms**: Login fails or tokens are invalid

**Solutions**:
- [ ] Verify JWT secrets are the SAME in both frontend and backend
- [ ] Check `NEXTAUTH_SECRET` is set in both services
- [ ] Verify `NEXTAUTH_URL` matches your frontend domain
- [ ] Clear browser cookies and try again

### Issue: API Requests Failing

**Symptoms**: Network errors when making API calls

**Solutions**:
- [ ] Verify `NEXT_PUBLIC_API_URL=https://api.cupperly.com` in frontend
- [ ] Check API service is running and accessible
- [ ] Test API health endpoint: `https://api.cupperly.com/api/health`
- [ ] Check browser network tab for actual error messages

## Security Checklist

- [ ] All JWT secrets are strong random strings (min 32 characters)
- [ ] Database password is secure
- [ ] Environment variables are set in Coolify (not committed to Git)
- [ ] HTTPS is enabled for both domains
- [ ] CORS is properly configured (only allows your domains)
- [ ] Rate limiting is enabled
- [ ] `BCRYPT_ROUNDS` is set to 12 or higher for production

## Performance Checklist

- [ ] `NODE_ENV=production` is set for both services
- [ ] Build optimization is enabled
- [ ] Logging level is set to `info` (not `debug`)
- [ ] Database connection pooling is configured
- [ ] Redis is configured for session storage (if applicable)

## Monitoring

- [ ] Check Coolify logs regularly
- [ ] Monitor service health
- [ ] Set up alerts for service downtime (if available)
- [ ] Monitor database performance
- [ ] Check error logs for issues

## Deployment Workflow

When you push changes to your repository:

1. [ ] Coolify detects the changes
2. [ ] Both services rebuild automatically (if auto-deploy is enabled)
3. [ ] Services restart with new code
4. [ ] Test the application after deployment
5. [ ] Check logs for any errors

## Quick Commands for Debugging

### Check API Health
```bash
curl https://api.cupperly.com/api/health
```

### Check Frontend
```bash
curl https://demo.cupperly.com
```

### Test Login API
```bash
curl -X POST https://api.cupperly.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: demo" \
  -d '{"email":"admin@demo.com","password":"demo123"}'
```

## Support

If you encounter issues:

1. Check Coolify service logs
2. Check browser console for frontend errors
3. Review this checklist
4. Verify all environment variables are set correctly
5. Ensure both services are running

## Summary

Once all items are checked:

- ✅ Backend API is running at `https://api.cupperly.com`
- ✅ Frontend is running at `https://demo.cupperly.com`
- ✅ Both services can communicate
- ✅ Database is connected
- ✅ Authentication works
- ✅ All features are functional

Your Cupperly application is now live! 🎉

