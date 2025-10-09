# 🚀 Quick Start: Deploy Cupperly to Coolify VPS

**Time to deploy**: ~15 minutes

## ✅ Problem Fixed!

The port 8080 conflict error you encountered has been **completely resolved**. You can now deploy without any port conflicts.

## What Was Fixed?

- ❌ **Before**: Adminer tried to use port 8080 (conflicts with Coolify)
- ✅ **After**: Production deployment doesn't include Adminer (no conflict)
- ✅ **Development**: Adminer moved to port 8081 (optional)

## Prerequisites

- ✅ Coolify installed on your VPS
- ✅ Git repository access (GitHub/GitLab)
- ✅ 10 minutes of your time

## Step-by-Step Deployment

### Step 1: Commit and Push Code (2 minutes)

```bash
# In your local project directory
git add .
git commit -m "Fix port conflicts for Coolify deployment"
git push origin main
```

### Step 2: Create Project in Coolify (1 minute)

1. Open Coolify dashboard: `http://your-vps-ip:8080`
2. Click **"+ New"** → **"Project"**
3. Name: `Cupperly`
4. Click **"Create"**

### Step 3: Add Docker Compose Resource (2 minutes)

1. Inside project, click **"+ New Resource"**
2. Select **"Docker Compose"**
3. Choose your Git source
4. Repository: `Alaswadi/cupperly`
5. Branch: `main`
6. **Compose file path**: `docker-compose.prod.yml`
7. Click **"Continue"**

### Step 4: Set Environment Variables (5 minutes)

Click on **"Environment Variables"** and add these:

#### Copy and paste this template (replace values in `<>`):

```env
# Database Configuration
POSTGRES_DB=cupperly
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<GENERATE_STRONG_PASSWORD>

# Database URL (use same password as above)
DATABASE_URL=postgresql://postgres:<SAME_PASSWORD>@postgres:5432/cupperly

# Redis
REDIS_URL=redis://redis:6379

# JWT Secrets (generate 3 random strings, 32+ characters each)
JWT_SECRET=<GENERATE_RANDOM_32_CHARS>
JWT_REFRESH_SECRET=<GENERATE_RANDOM_32_CHARS>
NEXTAUTH_SECRET=<GENERATE_RANDOM_32_CHARS>

# URLs (replace with your domain or VPS IP)
NEXTAUTH_URL=http://your-vps-ip:3000
NEXT_PUBLIC_API_URL=http://your-vps-ip:3001

# Environment
NODE_ENV=production
```

#### Generate Secrets Quickly:

**Windows PowerShell:**
```powershell
# Run this 4 times to generate 4 different secrets
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Linux/Mac:**
```bash
# Run this 4 times
openssl rand -base64 32
```

**Online (quick but less secure):**
- Visit: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" section

### Step 5: Deploy! (5 minutes)

1. Click **"Deploy"** button
2. Watch the logs (this is fun! 🍿)
3. Wait for "Deployment successful" message
4. All containers should show as "running"

### Step 6: Verify Deployment (2 minutes)

1. **Frontend**: Open `http://your-vps-ip:3000`
   - You should see the Cupperly login page
   
2. **API Health**: Open `http://your-vps-ip:3001/health`
   - You should see: `{"status":"ok"}` or similar

3. **Check Containers**: In Coolify dashboard
   - ✅ cupperly-web: Running
   - ✅ cupperly-api: Running
   - ✅ cupperly-postgres: Running
   - ✅ cupperly-redis: Running

## 🎉 Success!

If you can see the login page, **congratulations!** Your Cupperly platform is now deployed!

## Next Steps

### 1. Set Up Domain (Optional but Recommended)

In Coolify → Your Resource → **Domains**:

1. Add domain for frontend: `cupping.yourdomain.com` → Port `3000`
2. Add domain for API: `api.cupping.yourdomain.com` → Port `3001`
3. Enable **SSL/TLS** (automatic with Let's Encrypt)
4. Update DNS A records to point to your VPS IP
5. Update environment variables:
   ```env
   NEXTAUTH_URL=https://cupping.yourdomain.com
   NEXT_PUBLIC_API_URL=https://api.cupping.yourdomain.com
   ```
6. Redeploy

### 2. Create First Admin User

1. Visit your frontend URL
2. Click "Sign Up" (if enabled) or use the API to create admin user
3. Log in with admin credentials

### 3. Configure Your Platform

1. Set up organization settings
2. Create cupping templates
3. Configure flavor wheels
4. Invite team members

## Troubleshooting

### "Port already allocated" Error

**This should NOT happen anymore!** But if it does:

1. Make sure you're using `docker-compose.prod.yml`
2. Check Coolify logs for the actual conflicting port
3. Stop any conflicting containers:
   ```bash
   docker ps  # See what's running
   docker stop <container-name>  # Stop conflicting container
   ```

### Build Fails

1. Check build logs in Coolify
2. Verify all environment variables are set
3. Try "Force Rebuild" in Coolify
4. Check VPS has enough disk space: `df -h`

### Can't Access Application

1. Check firewall allows ports 3000 and 3001:
   ```bash
   sudo ufw status
   sudo ufw allow 3000
   sudo ufw allow 3001
   ```

2. Check all containers are running:
   ```bash
   docker ps
   ```

3. Check logs:
   ```bash
   docker logs cupperly-web
   docker logs cupperly-api
   ```

### Database Connection Error

1. Verify `DATABASE_URL` matches `POSTGRES_PASSWORD`
2. Check PostgreSQL logs:
   ```bash
   docker logs cupperly-postgres
   ```

## Useful Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker logs -f cupperly-api
docker logs -f cupperly-web
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific
docker restart cupperly-api
```

### Check Status
```bash
# See running containers
docker ps

# See resource usage
docker stats
```

### Access Database (if needed)
```bash
# Connect to PostgreSQL
docker exec -it cupperly-postgres psql -U postgres -d cupperly

# Or use a temporary Adminer
docker run -d --name temp-adminer \
  --network cupperly-network \
  -p 8081:8080 \
  -e ADMINER_DEFAULT_SERVER=postgres \
  adminer:4.8.1

# Access at: http://your-vps-ip:8081
# Remove when done: docker rm -f temp-adminer
```

## Port Reference

| Service | Port | Exposed | Access |
|---------|------|---------|--------|
| Coolify | 8080 | Yes | Coolify Dashboard |
| Frontend | 3000 | Yes | Public Access |
| API | 3001 | Yes | Public Access |
| PostgreSQL | 5432 | No | Internal Only |
| Redis | 6379 | No | Internal Only |

## Security Checklist

- ✅ Strong database password (16+ characters)
- ✅ Unique JWT secrets (32+ characters)
- ✅ Database not exposed to internet
- ✅ Redis not exposed to internet
- ✅ Environment variables not in Git
- ⬜ HTTPS enabled (if using domain)
- ⬜ Firewall configured
- ⬜ Backups scheduled

## Performance Tips

### Recommended VPS Specs

- **Minimum**: 2 CPU, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU, 8GB RAM, 50GB storage
- **Production**: 8 CPU, 16GB RAM, 100GB storage

### Optimize Performance

1. Enable Redis persistence (already configured)
2. Set up database backups in Coolify
3. Monitor resource usage
4. Scale up VPS if needed

## Getting Help

1. **Check logs first**: Most issues show up in logs
2. **Review documentation**: 
   - [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) - Detailed guide
   - [.coolify/DEPLOYMENT_CHECKLIST.md](./.coolify/DEPLOYMENT_CHECKLIST.md) - Complete checklist
3. **Common issues**: See troubleshooting section above

## Summary

✅ **Port conflict**: FIXED  
✅ **Deployment time**: ~15 minutes  
✅ **Difficulty**: Easy  
✅ **Production ready**: Yes  

---

**You're all set!** 🎉

Your Cupperly coffee cupping platform is now running on your Coolify VPS. Start cupping! ☕

---

**Need more details?** See [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) for comprehensive documentation.

