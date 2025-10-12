# CORS Error Fix - Quick Reference

## The Problem

You're seeing this error:
```
Access to XMLHttpRequest at 'http://localhost:3001/api/auth/login' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Root Cause

You're running the app with `docker-compose up`, but the `.env` file has `DATABASE_URL` pointing to `localhost:5432`.

In Docker:
- `localhost` = the container itself ❌
- `postgres` = the PostgreSQL service ✅

So the API container can't reach the database, fails to start properly, and doesn't respond to CORS preflight requests.

## The Fix

### Option 1: Use the Correct Env File (Easiest)

Stop the current docker-compose:
```bash
# Press Ctrl+C in the terminal running docker-compose
docker-compose down
```

Start with the correct environment file:
```bash
# Windows PowerShell
.\docker-start.ps1

# Mac/Linux
./docker-start.sh

# Or manually:
docker-compose --env-file .env.docker up --build
```

### Option 2: Update Your .env File

If you want to keep using `docker-compose up` without the `--env-file` flag:

1. Rename current `.env` to `.env.local`:
   ```bash
   mv .env .env.local
   ```

2. Copy `.env.docker` to `.env`:
   ```bash
   cp .env.docker .env
   ```

3. Now you can use:
   ```bash
   docker-compose up --build
   ```

## Understanding the Environment Files

| File | Purpose | DATABASE_URL |
|------|---------|--------------|
| `.env.local` | Local development (no Docker) | `localhost:5432` |
| `.env.docker` | Docker Compose | `postgres:5432` |
| `.env.production.coolify` | Coolify production | Your Coolify DB host |

## Quick Test

After starting with the correct env file, you should see:

```
cupperly-api       | 🔍 Database URL: Loaded ✓
cupperly-api       | 🚀 Cupperly API server running on port 3001
cupperly-api       | 📊 Environment: production
```

Then open http://localhost:3000 and try to login. No more CORS errors!

## Why This Happens

### Docker Networking

When you run services in Docker Compose:

```yaml
services:
  postgres:
    # This service is accessible as 'postgres' from other containers
  
  api:
    # This container can reach postgres via 'postgres:5432'
    # But 'localhost:5432' refers to THIS container, not the host
```

### The Flow

1. Frontend (browser) → `http://localhost:3001/api/auth/login`
2. Request goes to API container
3. API tries to connect to database at `DATABASE_URL`
4. If `DATABASE_URL=localhost:5432` → ❌ Can't find database
5. API crashes or doesn't respond
6. Browser sees no CORS headers → CORS error

### The Fix

1. Use `DATABASE_URL=postgres:5432` in Docker
2. API connects to database successfully ✅
3. API responds with proper CORS headers ✅
4. Frontend works! ✅

## Commands Reference

### Stop Everything
```bash
docker-compose down
```

### Start with Correct Env
```bash
# Windows
.\docker-start.ps1

# Mac/Linux
./docker-start.sh
```

### View Logs
```bash
# All services
docker-compose logs -f

# Just API
docker-compose logs -f api

# Just Database
docker-compose logs -f postgres
```

### Check What's Running
```bash
docker ps
```

### Restart Just One Service
```bash
docker-compose restart api
```

## Still Having Issues?

1. **Make sure Docker is running**
   ```bash
   docker --version
   ```

2. **Check if ports are available**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   
   # Mac/Linux
   lsof -i :3000
   lsof -i :3001
   ```

3. **Clean start**
   ```bash
   docker-compose down -v  # Remove volumes
   docker-compose --env-file .env.docker up --build
   ```

4. **Check the API logs**
   ```bash
   docker-compose logs api
   ```
   
   Look for:
   - `🔍 Database URL: Loaded ✓`
   - `🚀 Cupperly API server running on port 3001`

## Summary

**Problem**: Using `localhost` in Docker containers  
**Solution**: Use service names (`postgres`, `redis`)  
**How**: Use `.env.docker` file with docker-compose  
**Command**: `docker-compose --env-file .env.docker up --build`

---

**You're all set!** 🎉

