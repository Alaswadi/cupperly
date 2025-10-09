# Port 8080 Conflict Fix - Summary

## Problem
When deploying to Coolify VPS, the deployment failed with:
```
Error response from daemon: driver failed programming external connectivity on endpoint adminer-qcgs4w0g4o8400w4wog8w0cc-165329602745: Bind for 0.0.0.0:8080 failed: port is already allocated
```

**Root Cause**: Adminer (database admin tool) was trying to use port 8080, which is already used by Coolify itself.

## Solution Applied

### 1. Changed Adminer Port (Development)
- **File**: `docker-compose.yml`
- **Change**: Adminer port changed from `8080:8080` to `8081:8080`
- **Impact**: Adminer now accessible at `http://localhost:8081` instead of `http://localhost:8080`
- **Added**: Profile flag to make Adminer optional (only runs with `--profile dev`)

### 2. Production Configuration
- **File**: `docker-compose.prod.yml`
- **Status**: Already correct - no Adminer included
- **Impact**: Production deployments don't have this conflict

### 3. Coolify-Specific Configuration
- **New File**: `.coolify/docker-compose.yml`
- **Purpose**: Optimized configuration specifically for Coolify deployments
- **Features**:
  - No Adminer service
  - Proper health checks
  - Optimized for production
  - No port conflicts

### 4. Documentation
Created comprehensive deployment guides:
- **COOLIFY_DEPLOYMENT.md**: Complete step-by-step Coolify deployment guide
- **.coolify/README.md**: Quick reference for Coolify deployment
- **Updated README.md**: Added deployment section and port information

### 5. Utility Scripts
Created port checking scripts:
- **scripts/check-ports.sh**: Linux/Mac port checker
- **scripts/check-ports.ps1**: Windows PowerShell port checker

## Files Changed

1. ✅ `docker-compose.yml` - Adminer port changed to 8081, added profile
2. ✅ `README.md` - Updated port information and added deployment section
3. ✅ `COOLIFY_DEPLOYMENT.md` - NEW: Complete Coolify deployment guide
4. ✅ `.coolify/docker-compose.yml` - NEW: Coolify-optimized configuration
5. ✅ `.coolify/README.md` - NEW: Quick reference
6. ✅ `scripts/check-ports.sh` - NEW: Port conflict checker (Linux/Mac)
7. ✅ `scripts/check-ports.ps1` - NEW: Port conflict checker (Windows)
8. ✅ `FIXES_SUMMARY.md` - NEW: This file

## How to Deploy to Coolify Now

### Option 1: Using Production Compose File (Recommended)

1. **In Coolify Dashboard**:
   - Create new project: "Cupperly"
   - Add Docker Compose resource
   - Point to your Git repository
   - Set compose file path: `docker-compose.prod.yml`

2. **Set Environment Variables**:
   ```env
   POSTGRES_PASSWORD=<strong-password>
   DATABASE_URL=postgresql://postgres:<password>@postgres:5432/cupperly
   JWT_SECRET=<32-char-random-string>
   JWT_REFRESH_SECRET=<32-char-random-string>
   NEXTAUTH_SECRET=<32-char-random-string>
   NEXTAUTH_URL=https://your-domain.com
   NEXT_PUBLIC_API_URL=https://api.your-domain.com
   ```

3. **Deploy**: Click "Deploy" button

### Option 2: Using Coolify-Specific Configuration

Same as Option 1, but use compose file path: `.coolify/docker-compose.yml`

## Port Mapping Reference

### Development (docker-compose.yml)
- Frontend: `3003:3000`
- API: `3001:3001`
- PostgreSQL: `15432:5432`
- Redis: `6379:6379`
- Adminer: `8081:8080` (dev only, optional)

### Production (docker-compose.prod.yml)
- Frontend: `3000:3000` (configurable via WEB_PORT)
- API: `3001:3001` (configurable via API_PORT)
- PostgreSQL: Internal only (not exposed)
- Redis: Internal only (not exposed)
- Adminer: Not included

## Testing the Fix

### Before Deploying to Coolify

1. **Check for port conflicts**:
   ```bash
   # Linux/Mac
   ./scripts/check-ports.sh
   
   # Windows
   .\scripts\check-ports.ps1
   ```

2. **Test locally**:
   ```bash
   # Test production configuration
   docker-compose -f docker-compose.prod.yml up -d
   
   # Check all services are running
   docker ps
   
   # Check logs
   docker-compose -f docker-compose.prod.yml logs
   ```

3. **Verify services**:
   - Frontend: http://localhost:3000
   - API Health: http://localhost:3001/health

### After Deploying to Coolify

1. **Check deployment logs** in Coolify dashboard
2. **Verify all containers are running**
3. **Test the application**:
   - Visit your domain
   - Check API health endpoint
   - Try logging in

## Troubleshooting

### If you still see port conflicts:

1. **Check what's using the port**:
   ```bash
   # Linux/Mac
   lsof -i :8080
   
   # Windows
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess
   ```

2. **Stop conflicting services**:
   ```bash
   # Stop all Docker containers
   docker stop $(docker ps -aq)
   
   # Or stop specific container
   docker stop <container-name>
   ```

3. **Use production configuration**: Always use `docker-compose.prod.yml` for Coolify

### If database connection fails:

1. Check `DATABASE_URL` environment variable
2. Verify PostgreSQL container is running
3. Check PostgreSQL logs: `docker logs <postgres-container>`

### If build fails:

1. Check all required environment variables are set
2. Review build logs in Coolify
3. Ensure sufficient resources (RAM/CPU) on VPS

## Next Steps After Successful Deployment

1. ✅ Commit and push these changes to your repository
2. ✅ Deploy to Coolify using the guide
3. ✅ Set up your domain and SSL
4. ✅ Create your first admin user
5. ✅ Configure organization settings
6. ✅ Start using Cupperly!

## Support

If you encounter any issues:
1. Check [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) for detailed troubleshooting
2. Review Coolify deployment logs
3. Check container logs: `docker logs <container-name>`
4. Verify all environment variables are set correctly

## Summary

✅ **Problem Fixed**: Port 8080 conflict resolved
✅ **Development**: Adminer moved to port 8081
✅ **Production**: Adminer excluded (no conflict possible)
✅ **Documentation**: Complete deployment guides created
✅ **Tools**: Port checking scripts added
✅ **Ready**: Can now deploy to Coolify without issues

---

**Last Updated**: 2025-10-09
**Status**: ✅ RESOLVED

