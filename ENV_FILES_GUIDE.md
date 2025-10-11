# Environment Files Guide

This project has multiple `.env` files for different purposes. Here's what each one does:

## 📁 Environment Files Overview

```
cupping/
├── .env                          # Root - Used by both frontend and backend (LOCAL DEV)
├── .env.example                  # Template for .env
├── .env.production               # Docker production (not for Coolify)
├── .env.production.coolify       # Template for Coolify deployment
├── .env.coolify                  # Coolify configuration reference
├── apps/
│   ├── api/
│   │   └── .env                  # Backend API specific (LOCAL DEV)
│   └── web/
│       └── (no .env needed)      # Uses root .env
└── packages/
    └── database/
        └── (uses DATABASE_URL from parent)
```

## 🎯 Which File to Use When?

### Local Development (Localhost)

**Primary File**: `.env` (root directory)
- Used when running: `npm run dev` from root
- Contains: `DATABASE_URL=postgresql://postgres:password@localhost:5432/cupperly`

**Secondary File**: `apps/api/.env`
- Used when running: `cd apps/api && npm run dev`
- Contains: Same as root `.env` but specific to API
- **IMPORTANT**: Must use `localhost` not `postgres` for local development

**How it works**:
```bash
# The API server loads .env files in this order:
1. apps/api/.env (if running from apps/api)
2. Root .env (fallback)
3. Current directory .env (fallback)
```

### Production (Coolify)

**Don't use `.env` files!** Instead:
1. Set environment variables in Coolify Dashboard
2. Reference: `.env.production.coolify` for the list of variables
3. Each service (frontend & backend) has its own environment variables

## 🔧 Current Configuration

### Root `.env` (For Local Development)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cupperly"
API_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3001"
PORT="3001"
WEB_PORT="3000"
NODE_ENV="development"
```

**Use this when**:
- Running the full stack locally
- Database is on `localhost:5432`
- API is on `localhost:3001`
- Frontend is on `localhost:3000`

### `apps/api/.env` (For API Development)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cupperly"
PORT="3001"
NODE_ENV="development"
```

**Use this when**:
- Running only the API: `cd apps/api && npm run dev`
- Database is on `localhost:5432`
- **Must match root `.env` for consistency**

## 🐳 Docker vs Local Development

### Local Development (No Docker)
```env
# Use localhost
DATABASE_URL="postgresql://postgres:password@localhost:5432/cupperly"
```

### Docker Development
```env
# Use service name (postgres)
DATABASE_URL="postgresql://postgres:password@postgres:5432/cupperly"
```

### Coolify Production
```env
# Use Coolify internal service name
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_DB_HOST:5432/cupperly"
```

## 🚨 Common Issues & Solutions

### Issue 1: "Can't reach database server at localhost:5432"

**Cause**: Database URL is pointing to wrong host

**Solution**:
1. Check if PostgreSQL is running: `pg_isready -h localhost -p 5432`
2. Verify `.env` files use `localhost` not `postgres`
3. Check `apps/api/.env` has correct DATABASE_URL

```bash
# Check what the API is using
cd apps/api
npm run dev
# Look for: "🔍 Database URL: Loaded ✓"
# Look for: "🔍 Database Host: localhost:5432"
```

### Issue 2: Environment variables not loading

**Cause**: Running from wrong directory or .env file not found

**Solution**:
```bash
# Option 1: Run from root directory
npm run dev

# Option 2: Run from apps/api directory
cd apps/api
npm run dev

# The API now loads .env from multiple locations automatically
```

### Issue 3: Different values in different .env files

**Cause**: Multiple .env files with conflicting values

**Solution**: Keep them in sync!
```bash
# Root .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cupperly"
PORT="3001"

# apps/api/.env (should match)
DATABASE_URL="postgresql://postgres:password@localhost:5432/cupperly"
PORT="3001"
```

## 📝 Environment Variables Priority

The API loads environment variables in this order (last one wins):

1. `apps/api/.env` (if exists)
2. Root `.env` (if exists)
3. Current directory `.env` (if exists)
4. System environment variables (highest priority)

## ✅ Quick Checklist

Before starting development:

- [ ] PostgreSQL is running on `localhost:5432`
- [ ] Root `.env` exists with `DATABASE_URL=postgresql://postgres:password@localhost:5432/cupperly`
- [ ] `apps/api/.env` exists with same `DATABASE_URL`
- [ ] Both files use `localhost` not `postgres`
- [ ] Run `npm install` in root and `apps/api`
- [ ] Run migrations: `cd packages/database && npx prisma migrate dev`

## 🔍 Debugging Environment Variables

Add this to your code to debug:

```typescript
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
```

Or run the API with debug output:
```bash
cd apps/api
npm run dev
# Look for:
# 🔍 Database URL: Loaded ✓
# 🔍 Database Host: localhost:5432
```

## 📚 Reference

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
| PostgreSQL | Internal Coolify service | 5432 |

## 🎓 Best Practices

1. **Never commit sensitive data** to `.env` files
2. **Keep `.env.example` updated** with all required variables
3. **Use the same values** in root `.env` and `apps/api/.env` for local dev
4. **Use `localhost`** for local development
5. **Use service names** (`postgres`) only in Docker
6. **Set variables in Coolify** for production, don't use `.env` files

## 🆘 Still Having Issues?

1. Check which .env file is being loaded:
   ```bash
   cd apps/api
   npm run dev
   # Look for: "🔍 Database URL: Loaded ✓"
   ```

2. Verify PostgreSQL is running:
   ```bash
   # Windows
   services.msc  # Look for PostgreSQL

   # Mac
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

3. Test database connection:
   ```bash
   cd packages/database
   npx prisma studio
   # If this works, your DATABASE_URL is correct
   ```

4. Check the actual value:
   ```bash
   # Windows PowerShell
   Get-Content .env | Select-String "DATABASE_URL"

   # Mac/Linux
   grep DATABASE_URL .env
   ```

## 📞 Quick Fix Commands

```bash
# Fix 1: Ensure .env files are correct
cp .env.example .env
# Then edit .env with your values

# Fix 2: Regenerate Prisma client
cd packages/database
npx prisma generate

# Fix 3: Reset database (WARNING: Deletes all data)
cd packages/database
npx prisma migrate reset

# Fix 4: Check if PostgreSQL is accessible
psql -h localhost -p 5432 -U postgres -d cupperly
```

---

**Remember**: For local development, always use `localhost` in your DATABASE_URL! 🎯

