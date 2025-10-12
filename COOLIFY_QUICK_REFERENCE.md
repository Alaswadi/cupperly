# 🚀 Coolify Deployment Quick Reference

## 📋 Service Configuration Summary

### 1️⃣ Backend API Service (api.cupperly.com)

| Setting | Value |
|---------|-------|
| **Service Name** | `cupperly-api` |
| **Domain** | `api.cupperly.com` |
| **Port** | `3001` |
| **Repository** | `https://github.com/Alaswadi/cupperly.git` |
| **Branch** | `main` |
| **Build Pack** | Dockerfile |
| **Dockerfile** | `apps/api/Dockerfile` |
| **Build Context** | `.` (root) |
| **Build Target** | `production` |

**Build Command (if needed):**
```bash
docker build -f apps/api/Dockerfile --target production -t cupperly-api .
```

---

### 2️⃣ Frontend Web Service (demo.cupperly.com)

| Setting | Value |
|---------|-------|
| **Service Name** | `cupperly-web` |
| **Domain** | `demo.cupperly.com` |
| **Port** | `3000` |
| **Repository** | `https://github.com/Alaswadi/cupperly.git` |
| **Branch** | `main` |
| **Build Pack** | Dockerfile |
| **Dockerfile** | `apps/web/Dockerfile` |
| **Build Context** | `.` (root) |
| **Build Target** | `runner` |

**Build Command (if needed):**
```bash
docker build -f apps/web/Dockerfile --target runner -t cupperly-web .
```

---

### 3️⃣ PostgreSQL Database

| Setting | Value |
|---------|-------|
| **Service Name** | `cupperly-db` |
| **Database Name** | `cupperly` |
| **Username** | `postgres` |
| **Password** | `[GENERATE STRONG PASSWORD]` |
| **Port** | `5432` (internal) |
| **Version** | `15` or latest |

**Connection String Format:**
```
postgresql://postgres:YOUR_PASSWORD@cupperly-db:5432/cupperly
```

---

## 🔑 Environment Variables

### Backend API Environment Variables

Copy and paste this into Coolify (replace placeholders):

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@cupperly-db:5432/cupperly
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_MIN_32_CHARS
JWT_REFRESH_SECRET=YOUR_GENERATED_JWT_REFRESH_SECRET_MIN_32_CHARS
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NEXTAUTH_SECRET=YOUR_GENERATED_NEXTAUTH_SECRET_MIN_32_CHARS
API_URL=https://api.cupperly.com
WEB_URL=https://demo.cupperly.com
DEFAULT_TENANT=demo
TENANT_SUBDOMAIN_ENABLED=false
ENABLE_VOICE_TRANSCRIPTION=true
ENABLE_REAL_TIME_COLLABORATION=true
ENABLE_ANALYTICS=true
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
LOG_FORMAT=combined
```

---

### Frontend Web Environment Variables

Copy and paste this into Coolify (use SAME secrets as backend):

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://api.cupperly.com
API_URL=https://api.cupperly.com
NEXTAUTH_URL=https://demo.cupperly.com
NEXTAUTH_SECRET=SAME_AS_BACKEND_NEXTAUTH_SECRET
JWT_SECRET=SAME_AS_BACKEND_JWT_SECRET
JWT_REFRESH_SECRET=SAME_AS_BACKEND_JWT_REFRESH_SECRET
ENABLE_VOICE_TRANSCRIPTION=true
ENABLE_REAL_TIME_COLLABORATION=true
ENABLE_ANALYTICS=true
```

---

## 🔐 Generate Secrets

Run this command locally:

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'));"
```

Or use this PowerShell command:

```powershell
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'));"
```

---

## 🌐 DNS Configuration

Add these A records to your DNS provider:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `api` | `YOUR_COOLIFY_SERVER_IP` | 300 |
| A | `demo` | `YOUR_COOLIFY_SERVER_IP` | 300 |

**Verify DNS:**
```bash
nslookup api.cupperly.com
nslookup demo.cupperly.com
```

---

## 🗄️ Database Migration Commands

After deploying the API, run these commands in the API service terminal:

```bash
# Navigate to app directory
cd /app

# Run migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

Or add to the build command:
```bash
cd apps/api && npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

---

## ✅ Verification Checklist

### After Backend Deployment:

```bash
# Check API health
curl https://api.cupperly.com/api/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

### After Frontend Deployment:

```bash
# Check frontend
curl https://demo.cupperly.com

# Should return HTML
```

### Test Login:

1. Go to `https://demo.cupperly.com`
2. Login with: `admin@demo.com` / `demo123`
3. Should redirect to dashboard

### Check Browser Console:

1. Press F12
2. Console tab - no CORS errors
3. Network tab - requests go to `https://api.cupperly.com`

---

## 🔧 Common Coolify Settings

### Health Check (Optional)

**Backend API:**
- **Path:** `/api/health`
- **Port:** `3001`
- **Interval:** `30s`

**Frontend:**
- **Path:** `/`
- **Port:** `3000`
- **Interval:** `30s`

### Resource Limits (Recommended)

**Backend API:**
- **Memory:** 512MB - 1GB
- **CPU:** 0.5 - 1 core

**Frontend:**
- **Memory:** 512MB - 1GB
- **CPU:** 0.5 - 1 core

**Database:**
- **Memory:** 1GB - 2GB
- **CPU:** 1 core

---

## 🚨 Troubleshooting Commands

### Check Service Logs in Coolify:
1. Go to service
2. Click "Logs"
3. Look for errors

### Test Database Connection:
```bash
# From API service terminal
psql $DATABASE_URL -c "SELECT 1;"
```

### Test API from Frontend:
```bash
# From web service terminal
curl http://api:3001/api/health
```

### Restart Services:
1. Go to service in Coolify
2. Click "Restart"

---

## 📊 Monitoring URLs

| Service | URL | Expected Response |
|---------|-----|-------------------|
| **API Health** | `https://api.cupperly.com/api/health` | `{"status":"ok"}` |
| **Frontend** | `https://demo.cupperly.com` | Login page |
| **API Docs** | `https://api.cupperly.com/api/docs` | API documentation (if enabled) |

---

## 🔄 Deployment Workflow

### Initial Deployment:
1. Create PostgreSQL database
2. Deploy Backend API
3. Run database migrations
4. Deploy Frontend Web
5. Test the application

### Updates:
1. Push code to GitHub
2. Coolify auto-deploys (if enabled)
3. Or manually click "Redeploy" in Coolify
4. Verify deployment

---

## 📝 Important Notes

1. **Secrets Must Match:** JWT and NEXTAUTH secrets must be identical in both services
2. **Database URL:** Use internal service name (e.g., `cupperly-db`) not `localhost`
3. **CORS:** Backend is configured for `demo.cupperly.com` and `api.cupperly.com`
4. **Build Time:** Backend ~5-10 min, Frontend ~10-15 min
5. **SSL:** Coolify handles SSL certificates automatically

---

## 🆘 Quick Fixes

### CORS Error:
```env
# Backend must have:
WEB_URL=https://demo.cupperly.com

# Frontend must have:
NEXT_PUBLIC_API_URL=https://api.cupperly.com
```

### Database Error:
```env
# Check DATABASE_URL format:
postgresql://postgres:PASSWORD@SERVICE_NAME:5432/cupperly
```

### Auth Error:
```env
# Ensure these match in BOTH services:
JWT_SECRET=same-value
JWT_REFRESH_SECRET=same-value
NEXTAUTH_SECRET=same-value
```

---

## 📞 Support Resources

- **Coolify Docs:** https://coolify.io/docs
- **Coolify Discord:** https://discord.gg/coolify
- **Project Docs:** See `DEPLOY_TO_COOLIFY.md` for detailed guide

---

**Last Updated:** 2025-01-XX
**Version:** 1.0

