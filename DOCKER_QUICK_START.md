# Docker Production Build - Quick Start Guide

## ✅ Problem Fixed!

The "Cannot find module 'next'" error has been resolved. The app now builds and runs successfully in production mode with Docker.

## 🚀 Quick Commands

### Build Production Images
```powershell
docker-compose --env-file .env.production build
```

### Start All Services
```powershell
docker-compose --env-file .env.production up -d
```

### Stop All Services
```powershell
docker-compose --env-file .env.production down
```

### View Logs
```powershell
# All services
docker-compose --env-file .env.production logs -f

# Specific service
docker-compose --env-file .env.production logs -f web
docker-compose --env-file .env.production logs -f api
```

### Check Status
```powershell
docker-compose --env-file .env.production ps
```

### Restart Services
```powershell
docker-compose --env-file .env.production restart
```

## 🔧 Using the Helper Script

```powershell
# Build
.\scripts\docker-prod.ps1 build

# Start
.\scripts\docker-prod.ps1 up

# Stop
.\scripts\docker-prod.ps1 down

# Logs
.\scripts\docker-prod.ps1 logs

# Status
.\scripts\docker-prod.ps1 status

# Restart
.\scripts\docker-prod.ps1 restart
```

## 🌐 Access Points

Once running, access your application at:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Database**: localhost:15432
- **Redis**: localhost:6379

## 📋 Before First Run

1. **Update Environment Variables** in `.env.production`:
   ```env
   POSTGRES_PASSWORD=your-secure-password
   JWT_SECRET=your-random-secret-here
   JWT_REFRESH_SECRET=your-random-refresh-secret
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

2. **Generate Secure Secrets** (PowerShell):
   ```powershell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```

## 🗄️ Database Setup

### Run Migrations (First Time)
```powershell
docker exec -it cupperly-api npx prisma migrate deploy
```

### Seed Database (Optional)
```powershell
docker exec -it cupperly-api npx prisma db seed
```

### Access Database
```powershell
docker exec -it cupperly-postgres psql -U postgres -d cupperly
```

## 🐛 Troubleshooting

### Services Won't Start
```powershell
# Check logs
docker-compose --env-file .env.production logs

# Rebuild without cache
docker-compose --env-file .env.production build --no-cache

# Clean and restart
docker-compose --env-file .env.production down -v
docker-compose --env-file .env.production up -d
```

### Port Already in Use
Edit `.env.production` and change ports:
```env
WEB_PORT=3010
API_PORT=3011
POSTGRES_PORT=15433
```

### Database Connection Issues
```powershell
# Check if postgres is running
docker-compose --env-file .env.production ps postgres

# View postgres logs
docker-compose --env-file .env.production logs postgres
```

## 🔄 Rebuild After Code Changes

```powershell
# Rebuild specific service
docker-compose --env-file .env.production build web
docker-compose --env-file .env.production build api

# Restart the service
docker-compose --env-file .env.production up -d web
docker-compose --env-file .env.production up -d api
```

## 🧹 Cleanup

### Remove Containers (Keep Data)
```powershell
docker-compose --env-file .env.production down
```

### Remove Everything (Including Data)
```powershell
docker-compose --env-file .env.production down -v
```

### Remove Images
```powershell
docker rmi cupping-web cupping-api
```

## 📊 Monitoring

### View Resource Usage
```powershell
docker stats
```

### View Container Details
```powershell
docker inspect cupperly-web
docker inspect cupperly-api
```

## 🚢 For Coolify Deployment

The Dockerfile is now fixed and ready for Coolify. Just:

1. Push your code to Git
2. Connect repository in Coolify
3. Set environment variables in Coolify
4. Deploy!

See `COOLIFY_DEPLOYMENT_FIX.md` for detailed Coolify instructions.

## ✨ What Was Fixed

The Next.js standalone build in monorepos doesn't include `node_modules`. We fixed this by manually copying `node_modules` to the standalone output in the Dockerfile.

**File Modified**: `apps/web/Dockerfile` (line 54)
```dockerfile
RUN cp -r node_modules apps/web/.next/standalone/node_modules
```

## 📚 Additional Resources

- `PRODUCTION_BUILD_GUIDE.md` - Comprehensive production guide
- `COOLIFY_DEPLOYMENT_FIX.md` - Detailed fix explanation
- `.env.production` - Production environment template
- `docker-compose.yml` - Docker configuration

## ✅ Verification

After starting services, verify everything is working:

```powershell
# Check all containers are running
docker-compose --env-file .env.production ps

# Check web service logs
docker-compose --env-file .env.production logs web --tail=10

# Should see:
# ✓ Next.js 14.2.32
# ✓ Ready in XXXms
```

---

**Status**: ✅ Working  
**Last Tested**: October 11, 2025  
**Docker Version**: 28.3.2

