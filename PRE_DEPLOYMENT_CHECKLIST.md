# ✅ Pre-Deployment Checklist for Coolify

Complete this checklist BEFORE deploying to ensure a smooth deployment.

## 🔍 Local Testing

### Verify Application Works Locally

- [ ] Application runs successfully on localhost
- [ ] Can access frontend at `http://localhost:3000`
- [ ] Can access backend at `http://localhost:3001`
- [ ] Database connection works
- [ ] Can login with `admin@demo.com` / `demo123`
- [ ] Can create samples
- [ ] Can create cupping sessions
- [ ] Can generate reports
- [ ] No errors in browser console
- [ ] No errors in backend logs

### Test Commands

Run these to verify everything works:

```bash
# Start the application
docker-compose --env-file .env.docker up --build

# Or if running locally:
# Terminal 1 - Backend
cd apps/api
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

---

## 📦 Code Repository

### GitHub Repository Setup

- [ ] Code is pushed to GitHub repository
- [ ] Repository is accessible: `https://github.com/Alaswadi/cupperly`
- [ ] Main branch is up to date
- [ ] All dependencies are in `package.json` files
- [ ] Dockerfiles are present:
  - [ ] `apps/api/Dockerfile`
  - [ ] `apps/web/Dockerfile`
- [ ] No sensitive data in code (passwords, secrets, etc.)
- [ ] `.gitignore` is properly configured

### Verify Files Exist

```bash
# Check Dockerfiles
ls -la apps/api/Dockerfile
ls -la apps/web/Dockerfile

# Check package.json files
ls -la package.json
ls -la apps/api/package.json
ls -la apps/web/package.json
ls -la packages/database/package.json
```

---

## 🌐 Domain & DNS

### Domain Configuration

- [ ] You own the domain `cupperly.com`
- [ ] You have access to DNS settings
- [ ] Coolify server IP address is known: `_______________`

### DNS Records to Add

Add these A records in your DNS provider:

| Type | Name | Value | TTL | Status |
|------|------|-------|-----|--------|
| A | `api` | `YOUR_COOLIFY_IP` | 300 | [ ] |
| A | `demo` | `YOUR_COOLIFY_IP` | 300 | [ ] |

### Verify DNS Propagation

After adding DNS records, wait 5-10 minutes and verify:

```bash
# Check api subdomain
nslookup api.cupperly.com

# Check demo subdomain
nslookup demo.cupperly.com

# Or use dig
dig api.cupperly.com
dig demo.cupperly.com
```

Both should return your Coolify server IP.

---

## 🔐 Secrets & Environment Variables

### Generate Secrets

- [ ] Generate JWT_SECRET (min 32 chars)
- [ ] Generate JWT_REFRESH_SECRET (min 32 chars)
- [ ] Generate NEXTAUTH_SECRET (min 32 chars)
- [ ] Generate strong database password

**Run this command:**
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'));"
```

**Save the output securely!**

```
JWT_SECRET=_________________________________
JWT_REFRESH_SECRET=_________________________________
NEXTAUTH_SECRET=_________________________________
DATABASE_PASSWORD=_________________________________
```

---

## 🗄️ Database Planning

### PostgreSQL Database

- [ ] Database name decided: `cupperly`
- [ ] Database username: `postgres`
- [ ] Strong password generated (saved above)
- [ ] Know the internal service name: `cupperly-db` (or what Coolify assigns)

### Connection String

Format: `postgresql://postgres:PASSWORD@SERVICE_NAME:5432/cupperly`

Example: `postgresql://postgres:mySecurePass123@cupperly-db:5432/cupperly`

Your connection string:
```
DATABASE_URL=postgresql://postgres:___________@___________:5432/cupperly
```

---

## 🏗️ Coolify Setup

### Coolify Access

- [ ] Coolify instance is running
- [ ] Can access Coolify dashboard
- [ ] Coolify URL: `_______________`
- [ ] Coolify admin credentials saved
- [ ] Know how to create new resources

### Coolify Server Requirements

- [ ] Server has at least 2GB RAM (4GB recommended)
- [ ] Server has at least 20GB disk space
- [ ] Docker is installed on Coolify server
- [ ] Coolify can pull from GitHub

---

## 📋 Deployment Plan

### Service Creation Order

1. [ ] Create PostgreSQL database first
2. [ ] Deploy Backend API second
3. [ ] Run database migrations
4. [ ] Deploy Frontend Web last
5. [ ] Test the complete application

### Backend API Configuration Ready

- [ ] Service name: `cupperly-api`
- [ ] Domain: `api.cupperly.com`
- [ ] Port: `3001`
- [ ] Dockerfile path: `apps/api/Dockerfile`
- [ ] Build target: `production`
- [ ] Environment variables prepared (see below)

### Frontend Web Configuration Ready

- [ ] Service name: `cupperly-web`
- [ ] Domain: `demo.cupperly.com`
- [ ] Port: `3000`
- [ ] Dockerfile path: `apps/web/Dockerfile`
- [ ] Build target: `runner`
- [ ] Environment variables prepared (see below)

---

## 📝 Environment Variables Prepared

### Backend API Environment Variables

Copy this template and fill in your values:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@cupperly-db:5432/cupperly
JWT_SECRET=YOUR_GENERATED_SECRET
JWT_REFRESH_SECRET=YOUR_GENERATED_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NEXTAUTH_SECRET=YOUR_GENERATED_SECRET
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

- [ ] All placeholders replaced with actual values
- [ ] Saved in a secure location (password manager)

### Frontend Web Environment Variables

Copy this template and fill in your values (MUST match backend secrets):

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://api.cupperly.com
API_URL=https://api.cupperly.com
NEXTAUTH_URL=https://demo.cupperly.com
NEXTAUTH_SECRET=SAME_AS_BACKEND
JWT_SECRET=SAME_AS_BACKEND
JWT_REFRESH_SECRET=SAME_AS_BACKEND
ENABLE_VOICE_TRANSCRIPTION=true
ENABLE_REAL_TIME_COLLABORATION=true
ENABLE_ANALYTICS=true
```

- [ ] All secrets match backend exactly
- [ ] Saved in a secure location (password manager)

---

## 🧪 Pre-Deployment Tests

### Docker Build Test (Optional but Recommended)

Test building the Docker images locally:

```bash
# Test backend build
docker build -f apps/api/Dockerfile --target production -t test-api .

# Test frontend build
docker build -f apps/web/Dockerfile --target runner -t test-web .

# Clean up
docker rmi test-api test-web
```

- [ ] Backend builds successfully
- [ ] Frontend builds successfully
- [ ] No build errors

---

## 📚 Documentation Review

### Read These Guides

- [ ] Read `DEPLOY_TO_COOLIFY.md` - Complete deployment guide
- [ ] Read `COOLIFY_QUICK_REFERENCE.md` - Quick reference
- [ ] Read `COOLIFY_SETUP_CHECKLIST.md` - Detailed checklist
- [ ] Understand the deployment process
- [ ] Know where to find troubleshooting info

---

## 🎯 Final Checks

### Before You Start Deploying

- [ ] All items above are checked
- [ ] Secrets are generated and saved
- [ ] DNS records are configured and propagated
- [ ] Environment variables are prepared
- [ ] Code is pushed to GitHub
- [ ] Coolify is accessible
- [ ] You have 30-60 minutes for deployment
- [ ] You're ready to troubleshoot if needed

---

## 🚀 Ready to Deploy!

If all items are checked, you're ready to deploy!

**Next Steps:**

1. Open `DEPLOY_TO_COOLIFY.md`
2. Follow Step 2: Create PostgreSQL Database
3. Follow Step 4: Deploy Backend API
4. Follow Step 5: Deploy Frontend Web
5. Follow Step 6: Test the Complete Setup

---

## 📞 Resources

- **Deployment Guide:** `DEPLOY_TO_COOLIFY.md`
- **Quick Reference:** `COOLIFY_QUICK_REFERENCE.md`
- **Detailed Checklist:** `COOLIFY_SETUP_CHECKLIST.md`
- **Coolify Docs:** https://coolify.io/docs

---

## ⚠️ Important Reminders

1. **Secrets Must Match:** JWT and NEXTAUTH secrets must be identical in both services
2. **DNS First:** Configure DNS before deploying (wait for propagation)
3. **Database First:** Always create database before deploying API
4. **Migrations:** Don't forget to run database migrations after API deployment
5. **Test Locally:** Make sure everything works on localhost first
6. **Save Secrets:** Keep all secrets in a password manager
7. **Be Patient:** Builds can take 10-15 minutes

---

**Good luck with your deployment! 🎉**

Once you've completed this checklist, proceed to `DEPLOY_TO_COOLIFY.md` for step-by-step deployment instructions.

