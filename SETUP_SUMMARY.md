# Setup Summary - Cupperly Application

## 🎯 What Was Fixed

You were getting this error:
```
Can't reach database server at `localhost:5432`
```

### Root Cause
The application was trying to connect to a PostgreSQL database on `localhost:5432`, but:
1. The database wasn't running locally
2. Environment variables weren't being loaded correctly
3. The `.env` files had conflicting configurations

### What We Fixed

1. ✅ **Updated environment loading** in `apps/api/src/index.ts`
   - Now loads `.env` from multiple locations
   - Shows debug output for database connection
   - Loads in correct order: `apps/api/.env` → root `.env` → current directory

2. ✅ **Fixed `apps/api/.env`** to use `localhost` instead of `postgres`
   - Changed: `DATABASE_URL="postgresql://postgres:password@localhost:5432/cupperly"`
   - This is correct for local development

3. ✅ **Configured for both localhost and production**
   - Local: Uses `localhost:3001` for API
   - Production: Uses `demo.cupperly.com` and `api.cupperly.com`
   - CORS properly configured for both environments

4. ✅ **Created comprehensive documentation**
   - Environment setup guide
   - Database setup guide
   - Coolify deployment checklist
   - Architecture overview

---

## 🚀 How to Fix Your Current Issue

You have **3 options**:

### Option 1: Use Docker for Database (Recommended) ⭐

```bash
# 1. Start PostgreSQL with Docker
docker-compose up postgres -d

# 2. Run migrations
cd packages/database
npx prisma migrate dev
npx prisma db seed

# 3. Start backend
cd ../..
cd apps/api
npm run dev

# 4. Start frontend (new terminal)
cd apps/web
npm run dev
```

**Why this is best:**
- ✅ One command to start database
- ✅ No installation needed (just Docker)
- ✅ Isolated from other projects
- ✅ Easy to reset/cleanup

### Option 2: Install PostgreSQL Locally

1. Download from: https://www.postgresql.org/download/windows/
2. Install with password: `password`
3. Create database: `createdb -U postgres cupperly`
4. Run migrations: `cd packages/database && npx prisma migrate dev`
5. Start app: `cd apps/api && npm run dev`

### Option 3: Connect to Coolify Database (Not Recommended)

Update `.env` files to point to your Coolify database:
```env
DATABASE_URL="postgresql://postgres:PASSWORD@YOUR_COOLIFY_HOST:5432/cupperly"
```

**⚠️ Warning**: This uses production data!

---

## 📁 Files Changed

### 1. `apps/api/src/index.ts`
**What changed**: Enhanced environment variable loading
```typescript
// Before
dotenv.config();

// After
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

console.log('🔍 Database URL:', process.env.DATABASE_URL ? 'Loaded ✓' : 'NOT FOUND ✗');
```

**Why**: Ensures environment variables are loaded from the correct location

### 2. `apps/api/.env`
**What changed**: Database host from `postgres` to `localhost`
```env
# Before
DATABASE_URL="postgresql://postgres:password@postgres:5432/cupperly"

# After
DATABASE_URL="postgresql://postgres:password@localhost:5432/cupperly"
```

**Why**: `postgres` is for Docker networking, `localhost` is for local development

### 3. `.env` (root)
**What changed**: API port from 3005 to 3001
```env
# Before
PORT="3005"
API_URL="http://localhost:3005"

# After
PORT="3001"
API_URL="http://localhost:3001"
```

**Why**: Consistency across all configuration files

### 4. `apps/api/src/index.ts` (CORS)
**What changed**: Added production domains
```typescript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://demo.cupperly.com',
      'https://api.cupperly.com',
      /\.cupperly\.com$/
    ]
  : [
      'http://localhost:3000',
      'http://localhost:3001'
    ];
```

**Why**: Allows frontend to communicate with backend in production

### 5. `apps/web/next.config.js`
**What changed**: Conditional rewrites
```javascript
async rewrites() {
  if (process.env.NODE_ENV === 'development') {
    return [{ source: '/api/:path*', destination: '...' }];
  }
  return [];
}
```

**Why**: In production, frontend makes direct calls to `api.cupperly.com`

---

## 📚 Documentation Created

1. **`QUICK_START.md`** - Get started in 5 minutes
2. **`ENVIRONMENT_SETUP.md`** - Complete environment configuration guide
3. **`COOLIFY_SETUP_CHECKLIST.md`** - Step-by-step Coolify deployment
4. **`ARCHITECTURE.md`** - System architecture and data flow
5. **`ENV_FILES_GUIDE.md`** - Understanding .env files
6. **`DATABASE_SETUP_LOCAL.md`** - Local database setup options
7. **`.env.production.coolify`** - Production environment template
8. **`scripts/generate-secrets.js`** - Generate secure secrets

---

## ✅ Next Steps

### For Local Development (Right Now)

1. **Start the database**:
   ```bash
   docker-compose up postgres -d
   ```

2. **Run migrations**:
   ```bash
   cd packages/database
   npx prisma migrate dev
   npx prisma db seed
   ```

3. **Start the backend**:
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

4. **Start the frontend** (new terminal):
   ```bash
   cd apps/web
   npm run dev
   ```

5. **Test it**:
   - Open: http://localhost:3000
   - Login: `admin@demo.com` / `demo123`

### For Production (Coolify)

1. **Generate secrets**:
   ```bash
   node scripts/generate-secrets.js
   ```

2. **Follow the checklist**:
   - Read: `COOLIFY_SETUP_CHECKLIST.md`
   - Set up backend service at `api.cupperly.com`
   - Set up frontend service at `demo.cupperly.com`
   - Use the same JWT secrets for both services

3. **Set environment variables in Coolify**:
   - Reference: `.env.production.coolify`
   - Backend: `WEB_URL=https://demo.cupperly.com`
   - Frontend: `NEXT_PUBLIC_API_URL=https://api.cupperly.com`

---

## 🔍 Debugging

If you still have issues, check:

1. **Is the database running?**
   ```bash
   docker ps
   # Should show: cupperly-postgres
   ```

2. **Are environment variables loaded?**
   ```bash
   cd apps/api
   npm run dev
   # Look for: "🔍 Database URL: Loaded ✓"
   ```

3. **Can Prisma connect?**
   ```bash
   cd packages/database
   npx prisma studio
   # Should open a browser window
   ```

4. **What's the actual DATABASE_URL?**
   ```bash
   # Windows PowerShell
   Get-Content apps/api/.env | Select-String "DATABASE_URL"
   ```

---

## 📞 Quick Reference

### Local Development URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:3001 | 3001 |
| PostgreSQL | localhost:5432 | 5432 |
| Prisma Studio | http://localhost:5555 | 5555 |

### Production URLs (Coolify)

| Service | URL | Port |
|---------|-----|------|
| Frontend | https://demo.cupperly.com | 3000 |
| Backend API | https://api.cupperly.com | 3001 |

### Default Credentials

- Email: `admin@demo.com`
- Password: `demo123`

---

## 🎓 Key Takeaways

1. **For local development**: Use `localhost` in DATABASE_URL
2. **For Docker**: Use service names like `postgres` in DATABASE_URL
3. **For production**: Set environment variables in Coolify, not .env files
4. **Environment loading**: The API now loads .env from multiple locations
5. **CORS**: Configured for both localhost and production domains

---

## 🆘 Still Need Help?

1. Check `DATABASE_SETUP_LOCAL.md` for database setup
2. Check `ENV_FILES_GUIDE.md` for environment configuration
3. Check `QUICK_START.md` for step-by-step instructions
4. Look at the debug output when starting the API

---

**You're all set!** Start with Option 1 (Docker for database) and you should be up and running in minutes! 🚀

