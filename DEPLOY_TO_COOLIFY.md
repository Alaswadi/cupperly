# 🚀 Deploy Cupperly to Coolify (api.cupperly.com & demo.cupperly.com)

This guide will help you deploy your working localhost application to production on Coolify.

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ Coolify instance running and accessible
- ✅ Domain `cupperly.com` with DNS access
- ✅ GitHub repository with your code pushed
- ✅ Application working on localhost

## 🎯 Deployment Overview

You'll create **3 services** in Coolify:

1. **PostgreSQL Database** - Shared database
2. **Backend API** - `api.cupperly.com` (port 3001)
3. **Frontend Web** - `demo.cupperly.com` (port 3000)

---

## Step 1: Setup DNS Records

In your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare):

### Add A Records pointing to your Coolify server IP:

```
Type    Name    Value               TTL
A       api     YOUR_COOLIFY_IP     300
A       demo    YOUR_COOLIFY_IP     300
```

**Example:**
- If your Coolify server IP is `123.45.67.89`
- `api.cupperly.com` → `123.45.67.89`
- `demo.cupperly.com` → `123.45.67.89`

**Wait 5-10 minutes** for DNS propagation.

**Verify DNS:**
```bash
nslookup api.cupperly.com
nslookup demo.cupperly.com
```

---

## Step 2: Create PostgreSQL Database in Coolify

1. **Go to Coolify Dashboard** → **Resources** → **Add New Resource**
2. **Select:** PostgreSQL
3. **Configure:**
   - **Name:** `cupperly-db`
   - **Database Name:** `cupperly`
   - **Username:** `postgres`
   - **Password:** Generate a strong password (save it!)
   - **Port:** `5432` (internal)
   - **Version:** `15` or latest

4. **Click:** Start Database

5. **Note the connection details:**
   - Internal URL: `postgresql://postgres:YOUR_PASSWORD@cupperly-db:5432/cupperly`
   - Replace `YOUR_PASSWORD` with your actual password
   - Replace `cupperly-db` with the actual service name Coolify assigns

---

## Step 3: Generate Secrets

Run this command locally to generate secure secrets:

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'));"
```

**Save the output!** You'll need these for both services.

Example output:
```
JWT_SECRET=a1b2c3d4e5f6...
JWT_REFRESH_SECRET=f6e5d4c3b2a1...
NEXTAUTH_SECRET=1a2b3c4d5e6f...
```

---

## Step 4: Deploy Backend API (api.cupperly.com)

### 4.1 Create New Service

1. **Go to:** Coolify Dashboard → **Add New Resource**
2. **Select:** Application
3. **Choose:** GitHub Repository
4. **Select your repository:** `Alaswadi/cupperly`
5. **Branch:** `main`

### 4.2 Configure Build Settings

- **Name:** `cupperly-api`
- **Domain:** `api.cupperly.com`
- **Port:** `3001`
- **Build Pack:** Dockerfile
- **Dockerfile Location:** `apps/api/Dockerfile`
- **Docker Build Context:** `.` (root)
- **Docker Build Target:** `production`

### 4.3 Set Environment Variables

Click **Environment Variables** and add these:

```env
NODE_ENV=production
PORT=3001

# Database - Use your actual database connection string
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@cupperly-db:5432/cupperly

# Redis (optional - skip if not using)
# REDIS_URL=redis://cupperly-redis:6379

# JWT Secrets - Use the ones you generated in Step 3
JWT_SECRET=YOUR_GENERATED_JWT_SECRET
JWT_REFRESH_SECRET=YOUR_GENERATED_JWT_REFRESH_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# NextAuth - Use the secret you generated in Step 3
NEXTAUTH_SECRET=YOUR_GENERATED_NEXTAUTH_SECRET

# API Configuration
API_URL=https://api.cupperly.com
WEB_URL=https://demo.cupperly.com

# Multi-tenancy
DEFAULT_TENANT=demo
TENANT_SUBDOMAIN_ENABLED=false

# Feature Flags
ENABLE_VOICE_TRANSCRIPTION=true
ENABLE_REAL_TIME_COLLABORATION=true
ENABLE_ANALYTICS=true

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined
```

### 4.4 Deploy

1. **Click:** Deploy
2. **Wait** for build to complete (5-10 minutes)
3. **Check logs** for any errors

### 4.5 Run Database Migrations

After the API is deployed, you need to run migrations:

1. **Go to:** API Service → **Terminal/Console**
2. **Run:**
   ```bash
   cd /app
   npx prisma migrate deploy
   npx prisma db seed
   ```

Or if Coolify doesn't have a terminal, add a one-time command:
- **Build Command:** `cd apps/api && npm install && npx prisma generate && npx prisma migrate deploy && npm run build`

### 4.6 Verify API is Running

Open in browser: `https://api.cupperly.com/api/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX..."
}
```

---

## Step 5: Deploy Frontend Web (demo.cupperly.com)

### 5.1 Create New Service

1. **Go to:** Coolify Dashboard → **Add New Resource**
2. **Select:** Application
3. **Choose:** GitHub Repository
4. **Select your repository:** `Alaswadi/cupperly`
5. **Branch:** `main`

### 5.2 Configure Build Settings

- **Name:** `cupperly-web`
- **Domain:** `demo.cupperly.com`
- **Port:** `3000`
- **Build Pack:** Dockerfile
- **Dockerfile Location:** `apps/web/Dockerfile`
- **Docker Build Context:** `.` (root)
- **Docker Build Target:** `runner`

### 5.3 Set Environment Variables

Click **Environment Variables** and add these:

```env
NODE_ENV=production
PORT=3000

# API Configuration - MUST point to your API domain
NEXT_PUBLIC_API_URL=https://api.cupperly.com
API_URL=https://api.cupperly.com

# NextAuth - Use your frontend domain
NEXTAUTH_URL=https://demo.cupperly.com
NEXTAUTH_SECRET=SAME_AS_BACKEND_NEXTAUTH_SECRET

# JWT Secrets - MUST BE SAME AS BACKEND
JWT_SECRET=SAME_AS_BACKEND_JWT_SECRET
JWT_REFRESH_SECRET=SAME_AS_BACKEND_JWT_REFRESH_SECRET

# Feature Flags (optional)
ENABLE_VOICE_TRANSCRIPTION=true
ENABLE_REAL_TIME_COLLABORATION=true
ENABLE_ANALYTICS=true
```

**⚠️ IMPORTANT:** Use the **EXACT SAME** secrets as the backend!

### 5.4 Deploy

1. **Click:** Deploy
2. **Wait** for build to complete (10-15 minutes - Next.js builds take longer)
3. **Check logs** for any errors

### 5.5 Verify Frontend is Running

Open in browser: `https://demo.cupperly.com`

You should see the Cupperly login page!

---

## Step 6: Test the Complete Setup

### 6.1 Test Login

1. Go to `https://demo.cupperly.com`
2. Try to login with: `admin@demo.com` / `demo123`
3. You should be redirected to the dashboard

### 6.2 Check Browser Console

1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Look for any errors (especially CORS errors)
4. Go to **Network** tab
5. Verify API requests go to `https://api.cupperly.com`

### 6.3 Test Features

- ✅ Create a sample
- ✅ Create a cupping session
- ✅ Submit scores
- ✅ Generate a report

---

## 🔧 Troubleshooting

### Issue: 502 Bad Gateway

**Solution:**
1. Check service logs in Coolify
2. Verify the service is running
3. Check port configuration (3000 for web, 3001 for API)
4. Restart the service

### Issue: CORS Errors

**Symptoms:** Browser console shows `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution:**
1. Verify backend has `WEB_URL=https://demo.cupperly.com`
2. Verify frontend has `NEXT_PUBLIC_API_URL=https://api.cupperly.com`
3. Restart both services
4. Clear browser cache

### Issue: Database Connection Failed

**Symptoms:** API logs show `Can't reach database server`

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database service is running
3. Verify the database service name matches (e.g., `cupperly-db`)
4. Test connection from API terminal: `psql $DATABASE_URL`

### Issue: Authentication Not Working

**Symptoms:** Login fails or tokens are invalid

**Solution:**
1. Verify JWT secrets are **EXACTLY THE SAME** in both services
2. Check `NEXTAUTH_SECRET` is set in both
3. Verify `NEXTAUTH_URL=https://demo.cupperly.com`
4. Clear browser cookies and try again

### Issue: Build Fails

**Solution:**
1. Check build logs in Coolify
2. Verify Dockerfile paths are correct
3. Ensure all dependencies are in package.json
4. Try building locally first: `docker build -f apps/api/Dockerfile -t test .`

---

## 📊 Monitoring

### Check Service Health

**API Health:**
```bash
curl https://api.cupperly.com/api/health
```

**Frontend:**
```bash
curl https://demo.cupperly.com
```

### View Logs

In Coolify:
1. Go to your service
2. Click **Logs**
3. Monitor for errors

---

## 🔄 Updating Your Application

When you push changes to GitHub:

1. **Automatic Deployment** (if enabled in Coolify):
   - Coolify detects the push
   - Rebuilds the service
   - Restarts automatically

2. **Manual Deployment:**
   - Go to service in Coolify
   - Click **Redeploy**
   - Wait for build to complete

---

## ✅ Success Checklist

- [ ] DNS records configured and propagated
- [ ] PostgreSQL database created and running
- [ ] Backend API deployed at `api.cupperly.com`
- [ ] Frontend deployed at `demo.cupperly.com`
- [ ] Database migrations completed
- [ ] Can access `https://demo.cupperly.com`
- [ ] Can login successfully
- [ ] No CORS errors in browser console
- [ ] API requests work (check Network tab)
- [ ] Can create samples and sessions
- [ ] All features working

---

## 🎉 You're Live!

Your Cupperly application is now running in production!

- **Frontend:** https://demo.cupperly.com
- **API:** https://api.cupperly.com
- **API Health:** https://api.cupperly.com/api/health

---

## 📚 Additional Resources

- **Coolify Docs:** https://coolify.io/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Prisma Migrations:** https://www.prisma.io/docs/concepts/components/prisma-migrate

---

## 🆘 Need Help?

If you encounter issues:

1. Check Coolify service logs
2. Check browser console (F12)
3. Review this guide
4. Verify all environment variables
5. Ensure both services are running
6. Check the `COOLIFY_SETUP_CHECKLIST.md` for detailed troubleshooting

---

**Good luck with your deployment! 🚀**

