# Docker CORS Fix - For Local Development

## The Problem You Had

When running with Docker, you saw:
```
Cross-Origin Request Blocked: CORS header 'Access-Control-Allow-Origin' missing
Status code: 200
```

The API was responding (200 OK) but **no CORS headers** were being sent.

## Root Cause

The `docker-compose.yml` had `NODE_ENV=production`, which made the API only allow these origins:
- `https://demo.cupperly.com`
- `https://api.cupperly.com`

But your browser was requesting from `http://localhost:3000`, which was **blocked**!

## The Fix

Changed `docker-compose.yml` to use `NODE_ENV=development` for local Docker, which allows:
- `http://localhost:3000` ✅
- `http://localhost:3001` ✅
- `http://127.0.0.1:3000` ✅
- `http://127.0.0.1:3001` ✅

## How to Apply the Fix

### Step 1: Stop Current Containers

```bash
docker-compose down
```

### Step 2: Rebuild and Start with Correct Environment

```bash
# Windows PowerShell
.\docker-start.ps1

# Or manually:
docker-compose --env-file .env.docker up --build
```

**Important**: The `--build` flag is required to rebuild the containers with the new `NODE_ENV` setting!

### Step 3: Wait for Containers to Start

You should see:
```
cupperly-api       | 🔒 CORS Configuration:
cupperly-api       |    Environment: development
cupperly-api       |    Allowed Origins: [ 'http://localhost:3000', ... ]
cupperly-api       | 🚀 Cupperly API server running on port 3001
cupperly-web       | ▲ Next.js 14.x.x
cupperly-web       | - Local:        http://localhost:3000
```

### Step 4: Test

1. Open: http://localhost:3000
2. Login: `admin@demo.com` / `demo123`
3. **No more CORS errors!** ✅

## What Changed

### Before (BROKEN for localhost):
```yaml
api:
  environment:
    NODE_ENV: production  # ❌ Only allows demo.cupperly.com
```

### After (WORKS for localhost):
```yaml
api:
  environment:
    NODE_ENV: development  # ✅ Allows localhost:3000
```

## Understanding the Environments

| Environment | Allowed Origins | Use Case |
|-------------|----------------|----------|
| `development` | `localhost:3000`, `localhost:3001` | Local development |
| `production` | `demo.cupperly.com`, `api.cupperly.com` | Coolify deployment |

## For Coolify Production

When deploying to Coolify, you'll set environment variables directly in Coolify's UI:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.cupperly.com
```

This will make the API only accept requests from your production domains.

## Quick Commands

### Start Docker (Local Development)
```bash
.\docker-start.ps1
```

### Stop Docker
```bash
docker-compose down
```

### Rebuild (After Code Changes)
```bash
docker-compose --env-file .env.docker up --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Just API
docker-compose logs -f api

# Just Web
docker-compose logs -f web
```

### Check CORS Configuration
When the API starts, look for this in the logs:
```
🔒 CORS Configuration:
   Environment: development
   Allowed Origins: [ 'http://localhost:3000', ... ]
```

If it says `Environment: production`, the fix didn't apply. Make sure to:
1. Stop containers: `docker-compose down`
2. Rebuild: `docker-compose --env-file .env.docker up --build`

## Troubleshooting

### Still Seeing CORS Errors?

1. **Check the API logs:**
   ```bash
   docker-compose logs api | Select-String "CORS"
   ```
   
   Should show:
   ```
   🔒 CORS Configuration:
      Environment: development
   ```

2. **Make sure you rebuilt:**
   ```bash
   docker-compose down
   docker-compose --env-file .env.docker up --build
   ```

3. **Check browser console:**
   - Should NOT see "CORS header missing"
   - Should see successful login

### API Shows "Environment: production"?

The containers weren't rebuilt. Run:
```bash
docker-compose down
docker-compose --env-file .env.docker up --build --force-recreate
```

### Port Already in Use?

```bash
# Windows: Find and kill process
netstat -ano | findstr :3000
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Then restart Docker
.\docker-start.ps1
```

## Files Modified

1. **`docker-compose.yml`** - Changed `NODE_ENV` from `production` to `development`
2. **`.env.docker`** - Added comment about NODE_ENV
3. **`docker-start.ps1`** - Added info about NODE_ENV

## Summary

**Problem**: Docker was using `NODE_ENV=production`, blocking localhost  
**Solution**: Changed to `NODE_ENV=development` for local Docker  
**Command**: `docker-compose --env-file .env.docker up --build`  
**Result**: CORS works with localhost! ✅

---

**You're all set!** 🎉

Now you can develop locally with Docker and deploy to Coolify with production settings.

