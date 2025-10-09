# Coolify Deployment Checklist

Use this checklist to ensure a smooth deployment to your Coolify VPS.

## Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All changes committed to Git
- [ ] Code pushed to remote repository (GitHub/GitLab/Bitbucket)
- [ ] Branch selected for deployment (usually `main` or `production`)

### 2. Environment Variables Prepared
Generate and save these securely before starting deployment:

- [ ] `POSTGRES_PASSWORD` - Strong password (16+ characters)
- [ ] `JWT_SECRET` - Random string (32+ characters)
- [ ] `JWT_REFRESH_SECRET` - Random string (32+ characters)
- [ ] `NEXTAUTH_SECRET` - Random string (32+ characters)
- [ ] Domain names configured (if using custom domains)

**Generate secrets using:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### 3. VPS Requirements
- [ ] Coolify installed and running
- [ ] Minimum 4GB RAM available
- [ ] Minimum 20GB disk space available
- [ ] Docker and Docker Compose installed (usually automatic with Coolify)

## Deployment Steps

### Step 1: Create Project in Coolify
- [ ] Log in to Coolify dashboard
- [ ] Click "+ New" → "Project"
- [ ] Name: `Cupperly` (or your preferred name)
- [ ] Click "Create"

### Step 2: Add Docker Compose Resource
- [ ] Inside project, click "+ New Resource"
- [ ] Select "Docker Compose"
- [ ] Choose Git source (GitHub/GitLab/etc.)
- [ ] Select repository: `Alaswadi/cupperly` (or your fork)
- [ ] Select branch: `main`
- [ ] Set compose file path: `docker-compose.prod.yml` or `.coolify/docker-compose.yml`
- [ ] Click "Continue"

### Step 3: Configure Environment Variables
Add these in Coolify → Resource → Environment Variables:

#### Database Configuration
- [ ] `POSTGRES_DB=cupperly`
- [ ] `POSTGRES_USER=postgres`
- [ ] `POSTGRES_PASSWORD=<your-secure-password>`
- [ ] `DATABASE_URL=postgresql://postgres:<your-password>@postgres:5432/cupperly`

#### Redis Configuration
- [ ] `REDIS_URL=redis://redis:6379`

#### JWT Configuration
- [ ] `JWT_SECRET=<your-jwt-secret>`
- [ ] `JWT_REFRESH_SECRET=<your-refresh-secret>`

#### NextAuth Configuration
- [ ] `NEXTAUTH_SECRET=<your-nextauth-secret>`
- [ ] `NEXTAUTH_URL=https://your-domain.com` (or `http://your-vps-ip:3000`)
- [ ] `NEXT_PUBLIC_API_URL=https://api.your-domain.com` (or `http://your-vps-ip:3001`)

#### Port Configuration (Optional)
- [ ] `API_PORT=3001`
- [ ] `WEB_PORT=3000`

#### Environment
- [ ] `NODE_ENV=production`

### Step 4: Configure Domains (Optional)
If using custom domains:
- [ ] Add domain for frontend: `cupping.yourdomain.com` → Port 3000
- [ ] Add domain for API: `api.cupping.yourdomain.com` → Port 3001
- [ ] Enable SSL/TLS (Let's Encrypt)
- [ ] Update DNS A records to point to VPS IP
- [ ] Wait for DNS propagation (5-30 minutes)

### Step 5: Deploy
- [ ] Click "Deploy" button
- [ ] Monitor deployment logs
- [ ] Wait for build to complete (5-10 minutes first time)
- [ ] Verify all containers started successfully

## Post-Deployment Verification

### Step 1: Check Services
- [ ] All containers running: Check in Coolify dashboard
- [ ] PostgreSQL healthy
- [ ] Redis healthy
- [ ] API healthy
- [ ] Web healthy

### Step 2: Test Application
- [ ] Frontend accessible: Visit `https://your-domain.com` or `http://vps-ip:3000`
- [ ] API health check: Visit `https://api.your-domain.com/health` or `http://vps-ip:3001/health`
- [ ] Can load login page
- [ ] Can create account (if registration enabled)
- [ ] Can log in

### Step 3: Database Verification
- [ ] Database initialized with schema
- [ ] Can create data (test by creating a sample)
- [ ] Data persists after container restart

### Step 4: Performance Check
- [ ] Page load times acceptable
- [ ] API response times acceptable
- [ ] No memory leaks (monitor over 24 hours)
- [ ] No excessive CPU usage

## Security Checklist

### Application Security
- [ ] All secrets are strong and unique
- [ ] Database not exposed to internet (no external port)
- [ ] Redis not exposed to internet (no external port)
- [ ] HTTPS enabled (if using domains)
- [ ] Environment variables not committed to Git

### VPS Security
- [ ] SSH key authentication enabled
- [ ] Password authentication disabled
- [ ] Firewall configured (UFW or similar)
- [ ] Only necessary ports open (80, 443, 22)
- [ ] Regular security updates enabled

### Backup Configuration
- [ ] Database backup scheduled in Coolify
- [ ] Backup retention policy set
- [ ] Backup restoration tested
- [ ] Volume backups configured

## Monitoring Setup

### Application Monitoring
- [ ] Health checks configured
- [ ] Log aggregation set up
- [ ] Error tracking configured (optional: Sentry)
- [ ] Uptime monitoring (optional: UptimeRobot)

### Resource Monitoring
- [ ] CPU usage monitoring
- [ ] Memory usage monitoring
- [ ] Disk space monitoring
- [ ] Network usage monitoring

## Troubleshooting Common Issues

### Port 8080 Conflict
**Status**: ✅ FIXED
- Using `docker-compose.prod.yml` - no Adminer, no port 8080
- If still seeing error, check Coolify logs

### Build Failures
- [ ] Check build logs in Coolify
- [ ] Verify all environment variables set
- [ ] Ensure sufficient disk space
- [ ] Try "Force Rebuild"

### Database Connection Errors
- [ ] Verify `DATABASE_URL` is correct
- [ ] Check PostgreSQL container logs
- [ ] Ensure password matches in all places
- [ ] Verify network connectivity between containers

### Application Not Loading
- [ ] Check all containers are running
- [ ] Review application logs
- [ ] Verify environment variables
- [ ] Check health endpoints
- [ ] Verify domain DNS settings (if using domains)

## Maintenance Tasks

### Daily
- [ ] Check application logs for errors
- [ ] Monitor resource usage

### Weekly
- [ ] Review backup status
- [ ] Check for security updates
- [ ] Monitor disk space usage

### Monthly
- [ ] Test backup restoration
- [ ] Review and rotate logs
- [ ] Update dependencies (if needed)
- [ ] Performance optimization review

## Rollback Plan

If deployment fails:
1. [ ] Note the error from logs
2. [ ] Click "Stop" in Coolify
3. [ ] Fix the issue in code
4. [ ] Commit and push fix
5. [ ] Click "Redeploy"

If need to rollback to previous version:
1. [ ] In Coolify, go to Deployments history
2. [ ] Select previous successful deployment
3. [ ] Click "Redeploy this version"

## Success Criteria

Deployment is successful when:
- ✅ All containers running without errors
- ✅ Frontend accessible and loads correctly
- ✅ API health check returns 200 OK
- ✅ Can log in to application
- ✅ Can create and view data
- ✅ No errors in logs
- ✅ Performance is acceptable

## Next Steps After Successful Deployment

1. [ ] Create first admin user
2. [ ] Configure organization settings
3. [ ] Set up cupping templates
4. [ ] Invite team members
5. [ ] Configure email settings (if needed)
6. [ ] Set up monitoring alerts
7. [ ] Document any custom configurations
8. [ ] Train users on the platform

---

## Quick Reference

**Compose File**: `docker-compose.prod.yml` or `.coolify/docker-compose.yml`

**Ports**:
- Frontend: 3000
- API: 3001
- PostgreSQL: Internal only
- Redis: Internal only

**Health Endpoints**:
- API: `http://localhost:3001/health`
- Web: `http://localhost:3000`

**Logs**:
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# View specific service
docker logs cupperly-api
docker logs cupperly-web
docker logs cupperly-postgres
```

**Restart Services**:
```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker restart cupperly-api
```

---

**Last Updated**: 2025-10-09
**Version**: 1.0

