# Local Database Setup Guide

## The Problem

You're getting this error:
```
Can't reach database server at `localhost:5432`
```

This means the application is trying to connect to PostgreSQL on your local machine, but it's either:
1. Not installed
2. Not running
3. Running on a different port

## Solutions

You have **3 options** to fix this:

---

## Option 1: Use Docker for Database (Recommended)

This is the easiest option - use Docker only for the database, run the app locally.

### Step 1: Start PostgreSQL with Docker

```bash
# From the root directory
docker-compose up postgres -d
```

This will:
- Start PostgreSQL on `localhost:5432`
- Create the `cupperly` database
- Use password: `password`

### Step 2: Verify it's running

```bash
docker ps
# You should see: cupperly-postgres
```

### Step 3: Update .env files (already done!)

Both `.env` files are already configured for `localhost:5432`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cupperly"
```

### Step 4: Run migrations

```bash
cd packages/database
npx prisma migrate dev
npx prisma db seed
```

### Step 5: Start the application

```bash
# Terminal 1: Backend
cd apps/api
npm run dev

# Terminal 2: Frontend
cd apps/web
npm run dev
```

**✅ This is the recommended approach!**

---

## Option 2: Install PostgreSQL Locally

If you don't want to use Docker, install PostgreSQL directly on Windows.

### Step 1: Download PostgreSQL

1. Go to: https://www.postgresql.org/download/windows/
2. Download the installer (version 15 or 16)
3. Run the installer

### Step 2: During Installation

- Set password to: `password` (or update your .env files)
- Port: `5432` (default)
- Remember the password!

### Step 3: Create Database

```bash
# Open Command Prompt or PowerShell
# Navigate to PostgreSQL bin directory (usually):
cd "C:\Program Files\PostgreSQL\15\bin"

# Create database
createdb -U postgres cupperly

# Or use psql:
psql -U postgres
CREATE DATABASE cupperly;
\q
```

### Step 4: Update .env files

Make sure both `.env` files have:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cupperly"
```

Replace `YOUR_PASSWORD` with the password you set during installation.

### Step 5: Run migrations

```bash
cd packages/database
npx prisma migrate dev
npx prisma db seed
```

### Step 6: Start the application

```bash
# Terminal 1: Backend
cd apps/api
npm run dev

# Terminal 2: Frontend
cd apps/web
npm run dev
```

---

## Option 3: Use Coolify Database (Remote)

If you already have the database set up in Coolify, you can connect to it remotely.

### Step 1: Get Database Connection Details from Coolify

1. Go to Coolify Dashboard
2. Find your PostgreSQL service
3. Get the connection details:
   - Host: (your Coolify server IP or domain)
   - Port: (usually 5432 or a custom port)
   - Database: `cupperly`
   - User: `postgres`
   - Password: (from Coolify)

### Step 2: Update .env files

```env
# Root .env
DATABASE_URL="postgresql://postgres:PASSWORD@YOUR_COOLIFY_HOST:5432/cupperly"

# apps/api/.env
DATABASE_URL="postgresql://postgres:PASSWORD@YOUR_COOLIFY_HOST:5432/cupperly"
```

### Step 3: Make sure Coolify database is accessible

You may need to:
1. Open port 5432 in Coolify firewall
2. Allow remote connections in PostgreSQL config
3. Use SSH tunnel if direct connection is not allowed

### Step 4: Start the application

```bash
# Terminal 1: Backend
cd apps/api
npm run dev

# Terminal 2: Frontend
cd apps/web
npm run dev
```

**⚠️ Warning**: This is not recommended for development as it uses production data!

---

## Recommended Setup: Docker for Database

Here's the complete setup using Docker for database only:

### 1. Make sure Docker is installed and running

```bash
docker --version
# Should show: Docker version 20.x.x or higher
```

### 2. Start PostgreSQL

```bash
# From root directory
docker-compose up postgres -d
```

### 3. Verify it's running

```bash
docker ps
# Should show: cupperly-postgres

# Check logs
docker logs cupperly-postgres
```

### 4. Run migrations

```bash
cd packages/database
npx prisma migrate dev
npx prisma db seed
cd ../..
```

### 5. Start backend

```bash
cd apps/api
npm run dev
```

You should see:
```
🔍 Database URL: Loaded ✓
🔍 Database Host: localhost:5432
🚀 Cupperly API server running on port 3001
```

### 6. Start frontend (in new terminal)

```bash
cd apps/web
npm run dev
```

### 7. Test the application

1. Open: http://localhost:3000
2. Login with:
   - Email: `admin@demo.com`
   - Password: `demo123`

---

## Troubleshooting

### Issue: "docker-compose: command not found"

**Solution**: Install Docker Desktop for Windows
- Download: https://www.docker.com/products/docker-desktop/
- Install and restart your computer
- Make sure Docker Desktop is running

### Issue: "Port 5432 is already in use"

**Solution**: Another PostgreSQL instance is running

```bash
# Option 1: Stop the other PostgreSQL
Get-Service | Where-Object {$_.Name -like "*postgres*"} | Stop-Service

# Option 2: Use a different port in docker-compose.yml
# Change: "15432:5432" to expose on port 15432
# Then update DATABASE_URL to use port 15432
```

### Issue: "Database 'cupperly' does not exist"

**Solution**: Create the database

```bash
# If using Docker:
docker exec -it cupperly-postgres psql -U postgres -c "CREATE DATABASE cupperly;"

# If using local PostgreSQL:
psql -U postgres -c "CREATE DATABASE cupperly;"
```

### Issue: "password authentication failed"

**Solution**: Check password in .env files

```bash
# Check what password Docker is using:
docker exec -it cupperly-postgres env | grep POSTGRES_PASSWORD

# Update .env files to match
DATABASE_URL="postgresql://postgres:CORRECT_PASSWORD@localhost:5432/cupperly"
```

### Issue: Still can't connect

**Debug steps**:

1. Check if PostgreSQL is listening:
```bash
# If using Docker:
docker exec -it cupperly-postgres psql -U postgres -c "SELECT version();"

# Should show PostgreSQL version
```

2. Check the actual DATABASE_URL being used:
```bash
cd apps/api
npm run dev
# Look for: "🔍 Database URL: Loaded ✓"
# Look for: "🔍 Database Host: localhost:5432"
```

3. Test Prisma connection:
```bash
cd packages/database
npx prisma studio
# If this opens, your connection works!
```

---

## Quick Commands Reference

### Docker Database

```bash
# Start database
docker-compose up postgres -d

# Stop database
docker-compose down

# View logs
docker logs cupperly-postgres

# Access PostgreSQL shell
docker exec -it cupperly-postgres psql -U postgres -d cupperly

# Restart database
docker-compose restart postgres
```

### Prisma Commands

```bash
cd packages/database

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Application Commands

```bash
# Start backend
cd apps/api && npm run dev

# Start frontend
cd apps/web && npm run dev

# Start both (from root)
npm run dev
```

---

## Summary

**For local development, I recommend:**

1. ✅ Use Docker for PostgreSQL: `docker-compose up postgres -d`
2. ✅ Keep `.env` files with `localhost:5432`
3. ✅ Run migrations: `cd packages/database && npx prisma migrate dev`
4. ✅ Start backend: `cd apps/api && npm run dev`
5. ✅ Start frontend: `cd apps/web && npm run dev`

This gives you:
- Easy setup (one command to start database)
- Isolated database (won't conflict with other projects)
- Easy cleanup (just `docker-compose down`)
- Same environment as production (Docker)

---

**Need help?** Check the debug output when starting the API:
```
🔍 Database URL: Loaded ✓
🔍 Database Host: localhost:5432
```

If you see this, your configuration is correct! 🎉

