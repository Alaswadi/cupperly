# Local Development Setup - Step by Step

This guide will help you run the Cupperly application **locally** (not in Docker) on your machine.

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ PostgreSQL installed and running
- ✅ Git repository cloned

## Step-by-Step Setup

### Step 1: Start PostgreSQL Database

You have two options:

#### Option A: Use Docker for Database Only (Recommended)
```bash
# Start just the PostgreSQL container
docker-compose up postgres -d

# Verify it's running
docker ps
# Should show: cupperly-postgres
```

#### Option B: Use Local PostgreSQL
Make sure PostgreSQL is installed and running on your machine.

```bash
# Windows: Check if PostgreSQL service is running
services.msc
# Look for "postgresql" service

# Create database
psql -U postgres
CREATE DATABASE cupperly;
\q
```

### Step 2: Configure Environment Variables

Make sure your `.env` file has `localhost` for database:

```bash
# Check current configuration
Get-Content .env | Select-String "DATABASE_URL"

# Should show:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/cupperly"
```

If it shows `postgres:5432` instead of `localhost:5432`, update it:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cupperly"
```

### Step 3: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd apps/api
npm install

# Install frontend dependencies
cd ../web
npm install

# Go back to root
cd ../..
```

### Step 4: Setup Database Schema

```bash
cd packages/database

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with demo data
npx prisma db seed

# Go back to root
cd ../..
```

### Step 5: Start Backend API

Open a new terminal:

```bash
cd apps/api
npm run dev
```

**✅ You should see:**
```
🔍 Database URL: Loaded ✓
🔍 Database Host: localhost:5432
🔒 CORS Configuration:
   Environment: development
   Allowed Origins: [ 'http://localhost:3000', ... ]
🔧 Registering routes...
✅ Health routes registered
✅ Auth routes registered
... (more routes)
🚀 Cupperly API server running on port 3001
📊 Environment: development
🔗 Health check: http://localhost:3001/api/health
```

**❌ If you see errors:**
- Database connection error → Check Step 1
- Port already in use → Kill the process using port 3001
- Module not found → Run `npm install` again

### Step 6: Test the API

Open another terminal:

```bash
# Run the test script
.\test-api.ps1
```

**✅ All tests should pass:**
```
🧪 Testing Cupperly API...
1️⃣  Testing Health Endpoint...
   ✅ Health check passed!
2️⃣  Testing CORS Preflight (OPTIONS)...
   ✅ CORS headers present!
3️⃣  Testing Login Endpoint...
   ✅ Login endpoint responding!
   ✅ CORS header in response: http://localhost:3000
```

### Step 7: Start Frontend

Open another terminal:

```bash
cd apps/web
npm run dev
```

**✅ You should see:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

### Step 8: Test the Application

1. Open browser: http://localhost:3000
2. You should see the login page
3. Login with:
   - Email: `admin@demo.com`
   - Password: `demo123`
4. You should be redirected to the dashboard

**✅ No CORS errors!**

## Troubleshooting

### Issue: CORS Errors in Browser

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

1. **Check API is running:**
   ```bash
   # Should return 200 OK
   curl http://localhost:3001/api/health
   ```

2. **Check CORS configuration:**
   Look at the API terminal output. You should see:
   ```
   🔒 CORS Configuration:
      Environment: development
      Allowed Origins: [ 'http://localhost:3000', ... ]
   ```

3. **Restart the API:**
   ```bash
   # In the API terminal, press Ctrl+C
   # Then start again:
   npm run dev
   ```

4. **Check for CORS headers:**
   ```bash
   .\test-api.ps1
   ```

### Issue: Database Connection Failed

**Symptoms:**
```
Can't reach database server at `localhost:5432`
```

**Solutions:**

1. **If using Docker for database:**
   ```bash
   # Check if container is running
   docker ps
   
   # If not running, start it:
   docker-compose up postgres -d
   ```

2. **If using local PostgreSQL:**
   ```bash
   # Windows: Check service
   services.msc
   
   # Test connection
   psql -h localhost -p 5432 -U postgres -d cupperly
   ```

3. **Check DATABASE_URL:**
   ```bash
   Get-Content .env | Select-String "DATABASE_URL"
   # Should show: localhost:5432
   ```

### Issue: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solutions:**

```bash
# Windows: Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use a different port:
# Edit .env:
PORT=3002
```

### Issue: Module Not Found

**Symptoms:**
```
Error: Cannot find module '@cupperly/database'
```

**Solutions:**

```bash
# Rebuild packages
cd packages/database
npm install
npm run build

# Regenerate Prisma client
npx prisma generate

# Go back and restart API
cd ../../apps/api
npm run dev
```

### Issue: Frontend Can't Connect to API

**Symptoms:**
- Network errors in browser console
- API requests failing

**Solutions:**

1. **Check API is running:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check frontend environment:**
   ```bash
   # Should be http://localhost:3001
   Get-Content .env | Select-String "NEXT_PUBLIC_API_URL"
   ```

3. **Restart frontend:**
   ```bash
   # In frontend terminal, press Ctrl+C
   npm run dev
   ```

## Quick Commands Reference

### Start Everything

```bash
# Terminal 1: Database (if using Docker)
docker-compose up postgres -d

# Terminal 2: Backend
cd apps/api && npm run dev

# Terminal 3: Frontend
cd apps/web && npm run dev
```

### Stop Everything

```bash
# Stop backend: Ctrl+C in Terminal 2
# Stop frontend: Ctrl+C in Terminal 3
# Stop database:
docker-compose down
```

### Reset Database

```bash
cd packages/database
npx prisma migrate reset
npx prisma db seed
```

### View Database

```bash
cd packages/database
npx prisma studio
# Opens at http://localhost:5555
```

### Check Logs

```bash
# Backend logs: Check Terminal 2
# Frontend logs: Check Terminal 3
# Database logs (if Docker):
docker logs cupperly-postgres
```

## Environment Variables Checklist

Make sure your `.env` file has these for local development:

```env
# Database - MUST be localhost for local dev
DATABASE_URL="postgresql://postgres:password@localhost:5432/cupperly"

# Redis - MUST be localhost for local dev
REDIS_URL="redis://localhost:6379"

# API URLs - MUST be localhost
API_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Ports
PORT="3001"
WEB_PORT="3000"

# Environment
NODE_ENV="development"
```

## Success Checklist

- [ ] PostgreSQL is running (Docker or local)
- [ ] Database is created and migrated
- [ ] Backend API is running on port 3001
- [ ] API health check returns 200 OK
- [ ] CORS test passes
- [ ] Frontend is running on port 3000
- [ ] Can login successfully
- [ ] No CORS errors in browser console

## Next Steps

Once everything is working:

1. ✅ Start developing features
2. ✅ Make changes and see them hot-reload
3. ✅ Use Prisma Studio to view/edit database
4. ✅ Check API logs for debugging

## Need Help?

- **CORS issues**: See `CORS_FIX.md`
- **Database issues**: See `DATABASE_SETUP_LOCAL.md`
- **Environment issues**: See `ENV_FILES_GUIDE.md`
- **General setup**: See `QUICK_START.md`

---

**You're all set for local development!** 🚀

