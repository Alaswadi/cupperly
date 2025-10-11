# 🚀 START HERE - Quick Fix for Database Connection Error

## Your Error
```
Can't reach database server at `localhost:5432`
```

## Quick Fix (5 Minutes)

### Step 1: Start PostgreSQL Database
```bash
docker-compose up postgres -d
```

### Step 2: Setup Database
```bash
cd packages/database
npx prisma migrate dev
npx prisma db seed
cd ../..
```

### Step 3: Start Backend
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

### Step 4: Start Frontend (New Terminal)
```bash
cd apps/web
npm run dev
```

### Step 5: Test
- Open: http://localhost:3000
- Login: `admin@demo.com` / `demo123`

---

## If Docker Doesn't Work

### Option A: Install PostgreSQL
1. Download: https://www.postgresql.org/download/windows/
2. Install with password: `password`
3. Continue from Step 2 above

### Option B: Read Full Guide
See: `DATABASE_SETUP_LOCAL.md`

---

## For Production (Coolify)

See: `COOLIFY_SETUP_CHECKLIST.md`

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

