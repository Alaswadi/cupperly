# 🚀 Cupperly Deployment Summary

## 📖 Overview

This document provides a high-level overview of deploying your Cupperly application from localhost to production on Coolify with the domains `api.cupperly.com` and `demo.cupperly.com`.

---

## 🎯 What You're Deploying

### Current State (Localhost)
- ✅ Frontend running on `http://localhost:3000`
- ✅ Backend API running on `http://localhost:3001`
- ✅ PostgreSQL database running locally
- ✅ Application fully functional

### Target State (Production)
- 🎯 Frontend at `https://demo.cupperly.com`
- 🎯 Backend API at `https://api.cupperly.com`
- 🎯 PostgreSQL database on Coolify
- 🎯 SSL certificates (automatic via Coolify)
- 🎯 Production-ready configuration

---

## 📚 Documentation Guide

We've created comprehensive documentation to help you deploy. Here's what each file does:

### 1. **PRE_DEPLOYMENT_CHECKLIST.md** ⭐ START HERE
**Purpose:** Ensure you're ready to deploy

**What it covers:**
- Verify local application works
- Check GitHub repository
- Configure DNS records
- Generate secrets
- Prepare environment variables
- Pre-deployment tests

**When to use:** Before you start deploying

---

### 2. **DEPLOY_TO_COOLIFY.md** ⭐ MAIN GUIDE
**Purpose:** Step-by-step deployment instructions

**What it covers:**
- DNS setup
- PostgreSQL database creation
- Backend API deployment
- Frontend web deployment
- Testing and verification
- Troubleshooting

**When to use:** During deployment (follow step-by-step)

---

### 3. **COOLIFY_QUICK_REFERENCE.md** ⭐ QUICK LOOKUP
**Purpose:** Quick reference for settings and commands

**What it covers:**
- Service configuration summary
- Environment variables (copy-paste ready)
- DNS configuration
- Verification commands
- Common fixes

**When to use:** When you need to quickly look up a setting or command

---

### 4. **COOLIFY_SETUP_CHECKLIST.md**
**Purpose:** Detailed checklist with testing procedures

**What it covers:**
- Complete setup checklist
- Verification steps
- Testing procedures
- Common issues and solutions
- Security checklist

**When to use:** For thorough verification and troubleshooting

---

## 🗺️ Deployment Roadmap

### Phase 1: Preparation (15-30 minutes)
1. ✅ Complete `PRE_DEPLOYMENT_CHECKLIST.md`
2. ✅ Configure DNS records
3. ✅ Generate secrets
4. ✅ Prepare environment variables
5. ✅ Push code to GitHub

### Phase 2: Database Setup (5 minutes)
1. Create PostgreSQL service in Coolify
2. Note connection string
3. Verify database is running

### Phase 3: Backend Deployment (10-15 minutes)
1. Create backend service in Coolify
2. Configure build settings
3. Add environment variables
4. Deploy and wait for build
5. Run database migrations
6. Verify API health endpoint

### Phase 4: Frontend Deployment (15-20 minutes)
1. Create frontend service in Coolify
2. Configure build settings
3. Add environment variables (matching backend)
4. Deploy and wait for build
5. Verify website loads

### Phase 5: Testing (10-15 minutes)
1. Test login functionality
2. Check browser console for errors
3. Test creating samples
4. Test creating sessions
5. Test generating reports
6. Verify all features work

**Total Time:** 55-95 minutes (depending on build times)

---

## 🏗️ Architecture Overview

```
User Browser
    ↓
DNS (cupperly.com)
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

See the Mermaid diagram above for a detailed visual representation.

---

## 🔑 Key Configuration Points

### 1. DNS Records
```
api.cupperly.com  → YOUR_COOLIFY_IP
demo.cupperly.com → YOUR_COOLIFY_IP
```

### 2. Backend Environment
```env
DATABASE_URL=postgresql://postgres:PASSWORD@cupperly-db:5432/cupperly
API_URL=https://api.cupperly.com
WEB_URL=https://demo.cupperly.com
```

### 3. Frontend Environment
```env
NEXT_PUBLIC_API_URL=https://api.cupperly.com
NEXTAUTH_URL=https://demo.cupperly.com
```

### 4. Secrets (Must Match in Both Services)
```env
JWT_SECRET=same-in-both
JWT_REFRESH_SECRET=same-in-both
NEXTAUTH_SECRET=same-in-both
```

---

## ✅ Success Criteria

Your deployment is successful when:

- [ ] `https://demo.cupperly.com` loads without errors
- [ ] `https://api.cupperly.com/api/health` returns `{"status":"ok"}`
- [ ] Can login with `admin@demo.com` / `demo123`
- [ ] No CORS errors in browser console
- [ ] Can create samples and sessions
- [ ] Can generate reports
- [ ] All features work as they did on localhost

---

## 🚨 Common Issues & Quick Fixes

### Issue: CORS Errors
**Fix:** Verify `WEB_URL` in backend and `NEXT_PUBLIC_API_URL` in frontend

### Issue: 502 Bad Gateway
**Fix:** Check service logs, verify service is running, restart if needed

### Issue: Database Connection Failed
**Fix:** Verify `DATABASE_URL` format and database service name

### Issue: Authentication Not Working
**Fix:** Ensure JWT secrets match exactly in both services

### Issue: Build Fails
**Fix:** Check build logs, verify Dockerfile paths, test build locally

---

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# API Health
curl https://api.cupperly.com/api/health

# Frontend
curl https://demo.cupperly.com
```

### View Logs
1. Go to Coolify dashboard
2. Select service
3. Click "Logs"
4. Monitor for errors

### Updates
1. Push code to GitHub
2. Coolify auto-deploys (if enabled)
3. Or manually click "Redeploy"
4. Verify deployment

---

## 🎓 Learning Resources

### Coolify
- **Docs:** https://coolify.io/docs
- **Discord:** https://discord.gg/coolify

### Next.js
- **Deployment:** https://nextjs.org/docs/deployment
- **Docker:** https://nextjs.org/docs/deployment#docker-image

### Prisma
- **Migrations:** https://www.prisma.io/docs/concepts/components/prisma-migrate
- **Deployment:** https://www.prisma.io/docs/guides/deployment

---

## 🔄 Deployment Workflow

### First Time Deployment
```
1. PRE_DEPLOYMENT_CHECKLIST.md (Prepare)
   ↓
2. DEPLOY_TO_COOLIFY.md (Deploy)
   ↓
3. COOLIFY_SETUP_CHECKLIST.md (Verify)
   ↓
4. Test Application
   ↓
5. 🎉 Live!
```

### Subsequent Deployments
```
1. Make changes locally
   ↓
2. Test on localhost
   ↓
3. Push to GitHub
   ↓
4. Coolify auto-deploys
   ↓
5. Verify deployment
```

---

## 📞 Getting Help

If you encounter issues:

1. **Check the guides:**
   - `DEPLOY_TO_COOLIFY.md` - Troubleshooting section
   - `COOLIFY_SETUP_CHECKLIST.md` - Common issues
   - `COOLIFY_QUICK_REFERENCE.md` - Quick fixes

2. **Check logs:**
   - Coolify service logs
   - Browser console (F12)
   - Network tab for API errors

3. **Verify configuration:**
   - Environment variables
   - DNS records
   - Service status

4. **Resources:**
   - Coolify documentation
   - Coolify Discord community
   - Project documentation

---

## 🎯 Next Steps

### Ready to Deploy?

1. **Start here:** Open `PRE_DEPLOYMENT_CHECKLIST.md`
2. **Complete all items** in the checklist
3. **Then proceed to:** `DEPLOY_TO_COOLIFY.md`
4. **Follow step-by-step** instructions
5. **Use** `COOLIFY_QUICK_REFERENCE.md` for quick lookups
6. **Verify** with `COOLIFY_SETUP_CHECKLIST.md`

### Not Ready Yet?

- Review your local setup
- Ensure application works on localhost
- Read through the deployment guides
- Prepare your Coolify instance
- Configure DNS records

---

## 📝 Quick Start Commands

### Generate Secrets
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'));"
```

### Verify DNS
```bash
nslookup api.cupperly.com
nslookup demo.cupperly.com
```

### Test API Health
```bash
curl https://api.cupperly.com/api/health
```

### Test Frontend
```bash
curl https://demo.cupperly.com
```

---

## 🎉 Conclusion

You have everything you need to deploy your Cupperly application to production:

✅ **Comprehensive guides** for every step
✅ **Quick reference** for settings and commands
✅ **Checklists** to ensure nothing is missed
✅ **Troubleshooting** for common issues
✅ **Architecture diagram** for understanding the setup

**Your application is ready for production!**

Start with `PRE_DEPLOYMENT_CHECKLIST.md` and follow the guides step-by-step.

Good luck with your deployment! 🚀

---

**Documentation Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Project:** Cupperly Coffee Cupping SaaS Platform

