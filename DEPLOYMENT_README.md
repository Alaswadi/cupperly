# 📚 Deployment Documentation Index

## 🎯 Quick Navigation

### 🚀 **Want to Deploy to Production?**

Follow these documents **in order**:

1. **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Overview and roadmap
2. **[PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)** - Prepare for deployment
3. **[DEPLOY_TO_COOLIFY.md](DEPLOY_TO_COOLIFY.md)** - Step-by-step deployment guide
4. **[COOLIFY_QUICK_REFERENCE.md](COOLIFY_QUICK_REFERENCE.md)** - Quick lookup reference

---

## 📖 Document Descriptions

### 1. DEPLOYMENT_SUMMARY.md
**Purpose:** High-level overview of the deployment process

**Read this if you want to:**
- Understand what you're deploying
- See the deployment roadmap
- Know what documentation is available
- Get a quick overview before starting

**Time to read:** 5-10 minutes

---

### 2. PRE_DEPLOYMENT_CHECKLIST.md ⭐ START HERE
**Purpose:** Ensure you're ready to deploy

**Use this to:**
- Verify local application works
- Configure DNS records
- Generate secrets
- Prepare environment variables
- Complete pre-deployment tests

**Time to complete:** 15-30 minutes

---

### 3. DEPLOY_TO_COOLIFY.md ⭐ MAIN GUIDE
**Purpose:** Step-by-step deployment instructions

**Follow this to:**
- Setup DNS records
- Create PostgreSQL database
- Deploy backend API to api.cupperly.com
- Deploy frontend to demo.cupperly.com
- Test the complete setup
- Troubleshoot issues

**Time to complete:** 55-95 minutes

---

### 4. COOLIFY_QUICK_REFERENCE.md ⭐ QUICK LOOKUP
**Purpose:** Quick reference for settings and commands

**Use this when you need:**
- Service configuration settings
- Environment variables (copy-paste ready)
- DNS configuration
- Verification commands
- Quick fixes for common issues

**Time to read:** 2-5 minutes (as needed)

---

### 5. COOLIFY_SETUP_CHECKLIST.md
**Purpose:** Detailed checklist with testing procedures

**Use this for:**
- Thorough verification
- Testing procedures
- Common issues and solutions
- Security checklist
- Performance checklist

**Time to complete:** 30-60 minutes

---

## 🗺️ Deployment Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT JOURNEY                        │
└─────────────────────────────────────────────────────────────┘

1. 📖 Read DEPLOYMENT_SUMMARY.md
   └─> Understand what you're doing
   
2. ✅ Complete PRE_DEPLOYMENT_CHECKLIST.md
   └─> Prepare everything you need
   
3. 🚀 Follow DEPLOY_TO_COOLIFY.md
   └─> Deploy step-by-step
   
4. 📋 Use COOLIFY_QUICK_REFERENCE.md
   └─> Quick lookups during deployment
   
5. ✅ Verify with COOLIFY_SETUP_CHECKLIST.md
   └─> Ensure everything works
   
6. 🎉 Your app is LIVE!
   └─> demo.cupperly.com & api.cupperly.com
```

---

## 🎯 What You'll Deploy

### From This (Localhost):
```
http://localhost:3000  → Frontend
http://localhost:3001  → Backend API
localhost:5432         → PostgreSQL
```

### To This (Production):
```
https://demo.cupperly.com → Frontend (SSL)
https://api.cupperly.com  → Backend API (SSL)
Coolify PostgreSQL        → Database
```

---

## ⏱️ Time Estimates

| Phase | Time | Document |
|-------|------|----------|
| **Preparation** | 15-30 min | PRE_DEPLOYMENT_CHECKLIST.md |
| **Database Setup** | 5 min | DEPLOY_TO_COOLIFY.md (Step 2) |
| **Backend Deploy** | 10-15 min | DEPLOY_TO_COOLIFY.md (Step 4) |
| **Frontend Deploy** | 15-20 min | DEPLOY_TO_COOLIFY.md (Step 5) |
| **Testing** | 10-15 min | DEPLOY_TO_COOLIFY.md (Step 6) |
| **Total** | **55-95 min** | |

---

## ✅ Prerequisites

Before you start, make sure you have:

- ✅ Application working on localhost
- ✅ Coolify instance running
- ✅ Domain `cupperly.com` with DNS access
- ✅ GitHub repository with code pushed
- ✅ 1-2 hours of time
- ✅ Basic understanding of Docker and DNS

---

## 🔑 Key Concepts

### DNS Records
You'll create two subdomains:
- `api.cupperly.com` → Backend API
- `demo.cupperly.com` → Frontend

### Environment Variables
You'll need to configure:
- Database connection string
- JWT secrets (must match in both services)
- API URLs
- Feature flags

### Services in Coolify
You'll create 3 services:
1. PostgreSQL Database
2. Backend API (Node.js/Express)
3. Frontend Web (Next.js)

---

## 🚨 Common Pitfalls to Avoid

1. **❌ Not matching secrets** - JWT secrets must be identical in both services
2. **❌ Wrong database URL** - Use service name (e.g., `cupperly-db`) not `localhost`
3. **❌ DNS not propagated** - Wait 5-10 minutes after adding DNS records
4. **❌ Skipping migrations** - Must run `prisma migrate deploy` after API deployment
5. **❌ Wrong API URL** - Frontend must use `https://api.cupperly.com` not localhost

---

## 📊 Architecture Overview

```
User Browser
    ↓
DNS (api.cupperly.com, demo.cupperly.com)
    ↓
Coolify Server (Reverse Proxy + SSL)
    ↓
┌─────────────────────────────────────┐
│  Frontend (demo.cupperly.com:3000)  │
│         ↓ API Requests              │
│  Backend API (api.cupperly.com:3001)│
│         ↓ Database Queries          │
│  PostgreSQL Database (cupperly)     │
└─────────────────────────────────────┘
```

---

## 🎓 Learning Path

### Never deployed before?
1. Start with DEPLOYMENT_SUMMARY.md
2. Read through DEPLOY_TO_COOLIFY.md (don't deploy yet)
3. Complete PRE_DEPLOYMENT_CHECKLIST.md
4. Then follow DEPLOY_TO_COOLIFY.md step-by-step

### Experienced with deployments?
1. Skim DEPLOYMENT_SUMMARY.md
2. Complete PRE_DEPLOYMENT_CHECKLIST.md
3. Use COOLIFY_QUICK_REFERENCE.md for settings
4. Deploy following DEPLOY_TO_COOLIFY.md

### Just need a quick reference?
- Use COOLIFY_QUICK_REFERENCE.md

---

## 🆘 Troubleshooting

### Where to find help:

1. **CORS errors** → DEPLOY_TO_COOLIFY.md (Troubleshooting section)
2. **Build failures** → DEPLOY_TO_COOLIFY.md (Troubleshooting section)
3. **Database issues** → DEPLOY_TO_COOLIFY.md (Troubleshooting section)
4. **Auth problems** → DEPLOY_TO_COOLIFY.md (Troubleshooting section)
5. **Quick fixes** → COOLIFY_QUICK_REFERENCE.md
6. **Detailed checks** → COOLIFY_SETUP_CHECKLIST.md

---

## 📞 Additional Resources

### Coolify
- **Documentation:** https://coolify.io/docs
- **Discord Community:** https://discord.gg/coolify

### Next.js
- **Deployment Guide:** https://nextjs.org/docs/deployment
- **Docker Deployment:** https://nextjs.org/docs/deployment#docker-image

### Prisma
- **Migrations:** https://www.prisma.io/docs/concepts/components/prisma-migrate
- **Production Deployment:** https://www.prisma.io/docs/guides/deployment

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ `https://demo.cupperly.com` loads without errors
- ✅ `https://api.cupperly.com/api/health` returns `{"status":"ok"}`
- ✅ Can login with `admin@demo.com` / `demo123`
- ✅ No CORS errors in browser console
- ✅ Can create samples and sessions
- ✅ Can generate reports
- ✅ All features work as on localhost

---

## 🚀 Ready to Start?

### Step 1: Read the Overview
Open **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)**

### Step 2: Prepare
Complete **[PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)**

### Step 3: Deploy
Follow **[DEPLOY_TO_COOLIFY.md](DEPLOY_TO_COOLIFY.md)**

### Step 4: Reference
Use **[COOLIFY_QUICK_REFERENCE.md](COOLIFY_QUICK_REFERENCE.md)** as needed

---

## 📝 Quick Commands

### Generate Secrets
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'));"
```

### Verify DNS
```bash
nslookup api.cupperly.com
nslookup demo.cupperly.com
```

### Test Deployment
```bash
# API Health
curl https://api.cupperly.com/api/health

# Frontend
curl https://demo.cupperly.com
```

---

## 🎉 Let's Deploy!

You have everything you need. Start with **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** and follow the guides.

**Good luck! 🚀**

---

**Documentation Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Project:** Cupperly Coffee Cupping SaaS Platform

