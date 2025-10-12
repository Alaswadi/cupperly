# 🚀 START HERE - Quick Fix for CORS & Database Errors

## Your Errors
```
CORS policy: No 'Access-Control-Allow-Origin' header
Can't reach database server at `localhost:5432`
```

## Quick Fix - Choose Your Method

### Method 1: Docker (Recommended - Everything in Containers)

```bash
# Windows PowerShell
.\docker-start.ps1

# Mac/Linux
./docker-start.sh

# Or manually:
docker-compose --env-file .env.docker up --build
```

**✅ This starts:**
- PostgreSQL database
- Redis
- Backend API (port 3001)
- Frontend Web (port 3000)

**Then:**
- Open: http://localhost:3000
- Login: `admin@demo.com` / `demo123`

---

### Method 2: Local Development (No Docker for App)

**Step 1: Start Database with Docker**
```bash
docker-compose --env-file .env.docker up postgres -d
```

**Step 2: Setup Database**
```bash
cd packages/database
npx prisma migrate dev
npx prisma db seed
cd ../..
```

**Step 3: Start Backend**
```bash
cd apps/api
npm run dev
```

**✅ Look for this output:**
```
🔍 Database URL: Loaded ✓
🔍 Database Host: localhost:5432
🚀 Cupperly API server running on port 3001
```

**Step 4: Start Frontend (New Terminal)**
```bash
cd apps/web
npm run dev
```

**Step 5: Test**
- Open: http://localhost:3000
- Login: `admin@demo.com` / `demo123`

---

## Important Notes

### If You See CORS Errors

The issue is that `.env` has `localhost` but Docker needs `postgres`.

**Solution**: Always use `.env.docker` with Docker:
```bash
docker-compose --env-file .env.docker up --build
```

See: `CORS_FIX.md` for detailed explanation

### If Docker Doesn't Work

**Option A**: Install PostgreSQL locally
1. Download: https://www.postgresql.org/download/windows/
2. Install with password: `password`
3. Use Method 2 above (Local Development)

**Option B**: Read full guide
See: `DATABASE_SETUP_LOCAL.md`

---

## For Production (Coolify)

**🚀 Ready to deploy to api.cupperly.com and demo.cupperly.com?**

See: `DEPLOYMENT_SUMMARY.md` - Start here for deployment overview
Then: `PRE_DEPLOYMENT_CHECKLIST.md` - Complete before deploying
Then: `DEPLOY_TO_COOLIFY.md` - Step-by-step deployment guide

---

## Documentation Index

| File | Purpose |
|------|---------|
| **START_HERE.md** | ← You are here! Quick fix |
| **SETUP_SUMMARY.md** | What was fixed and why |
| **QUICK_START.md** | Complete local & production setup |
| **DATABASE_SETUP_LOCAL.md** | Database setup options |
| **ENV_FILES_GUIDE.md** | Understanding .env files |
| **ENVIRONMENT_SETUP.md** | Environment configuration |
| **COOLIFY_SETUP_CHECKLIST.md** | Production deployment |
| **ARCHITECTURE.md** | System architecture |

---

## Need Help?

1. ❌ Database error → `DATABASE_SETUP_LOCAL.md`
2. ❌ Environment variables → `ENV_FILES_GUIDE.md`
3. ❌ Coolify deployment → `COOLIFY_SETUP_CHECKLIST.md`
4. ❓ General questions → `SETUP_SUMMARY.md`

---

**TL;DR**: Run `docker-compose up postgres -d` then follow steps above! 🎯

