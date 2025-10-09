# Fix: package.json Not Found Error in Coolify

## Problem

You're seeing this error in both API and Web containers:

```
npm error code ENOENT
npm error syscall open
npm error path /app/apps/api/package.json
npm error errno -2
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory
```

## Root Cause

Coolify is using `docker-compose.yml` which was configured for **development** with volume mounts. The containers expect source code to be mounted from your local machine, but in Coolify, there's no local source code to mount.

## Solution

I've updated `docker-compose.yml` to work for **both development AND production** using environment variables.

### Step 1: Commit and Push Changes

```bash
git add .
git commit -m "Fix docker-compose.yml for Coolify production deployment"
git push origin main
```

### Step 2: Set Environment Variables in Coolify

Go to Coolify Dashboard → Your Resource → **Environment Variables** and add:

#### Required Variables:

```env
# Build Configuration - IMPORTANT!
BUILD_TARGET=production
NODE_ENV=production

# Database Configuration
POSTGRES_DB=cupperly
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<your-strong-password>
DATABASE_URL=postgresql://postgres:<same-password>@postgres:5432/cupperly

# Redis
REDIS_URL=redis://redis:6379

# JWT Secrets (32+ characters each)
JWT_SECRET=<generate-random-32-chars>
JWT_REFRESH_SECRET=<generate-random-32-chars>

# NextAuth
NEXTAUTH_SECRET=<generate-random-32-chars>
NEXTAUTH_URL=http://your-vps-ip:3000
NEXT_PUBLIC_API_URL=http://your-vps-ip:3001

# Ports
API_PORT=3001
WEB_PORT=3000
```

#### Generate Secrets:

**Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

### Step 3: Redeploy in Coolify

1. Click **"Redeploy"** or **"Force Rebuild"**
2. Watch the build logs
3. Wait for successful deployment

## What Changed?

### Before (Development Only):
```yaml
api:
  build:
    target: development  # ❌ Expects volume mounts
  volumes:
    - ./apps/api:/app/apps/api  # ❌ Doesn't exist in Coolify
```

### After (Production Ready):
```yaml
api:
  build:
    target: ${BUILD_TARGET:-production}  # ✅ Uses production build
  # volumes: commented out  # ✅ No volume mounts needed
```

## Verification

After redeployment, check:

1. **Build Logs**: Should show successful build
2. **Container Logs**: No more "ENOENT" errors
3. **API Health**: `http://your-vps-ip:3001/health` should work
4. **Frontend**: `http://your-vps-ip:3000` should load

## Alternative: Use docker-compose.prod.yml

If you prefer a cleaner separation, you can tell Coolify to use `docker-compose.prod.yml`:

1. In Coolify → Your Resource → Settings
2. Find **"Docker Compose File Path"** or **"Compose File Location"**
3. Change to: `docker-compose.prod.yml`
4. Save and Redeploy

## Troubleshooting

### Still seeing ENOENT errors?

1. **Check BUILD_TARGET is set**:
   - Must be `production` (for API)
   - Must be `runner` (for Web) - but `production` works too

2. **Force rebuild**:
   ```bash
   # In Coolify, use "Force Rebuild" option
   # Or manually:
   docker-compose build --no-cache
   ```

3. **Check build logs**:
   - Look for "COPY apps/api ./apps/api" - should succeed
   - Look for "npm run build" - should complete

### Build fails with "Cannot find module"?

This means the build stage failed. Check:
1. All source files are committed to Git
2. package.json files exist in apps/api and apps/web
3. Build logs for specific error

### Containers start but crash immediately?

Check environment variables:
1. `DATABASE_URL` is correct
2. `JWT_SECRET` is set
3. `NEXTAUTH_SECRET` is set

## For Local Development

To use the updated docker-compose.yml for local development:

1. **Create `.env.local`**:
   ```env
   BUILD_TARGET=development
   NODE_ENV=development
   ```

2. **Uncomment volume mounts** in docker-compose.yml:
   ```yaml
   volumes:
     - ./apps/api:/app/apps/api:cached
     - ./packages:/app/packages:cached
   ```

3. **Run**:
   ```bash
   docker-compose --env-file .env.local up -d
   ```

## Summary

✅ **Fixed**: docker-compose.yml now works for production  
✅ **No volume mounts**: Code is built into the image  
✅ **Environment-based**: Uses BUILD_TARGET to switch modes  
✅ **Backward compatible**: Still works for development  

---

**Next Steps After Fix:**
1. Commit and push changes
2. Set environment variables in Coolify
3. Redeploy
4. Verify application is working
5. Set up domain and SSL (optional)

**Need help?** Check the build logs in Coolify for specific errors.

