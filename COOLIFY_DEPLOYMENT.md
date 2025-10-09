# Coolify Deployment Guide for Cupperly

This guide will help you deploy the Cupperly coffee cupping platform on your Coolify VPS.

## Prerequisites

- Coolify instance running on your VPS
- Git repository access (GitHub/GitLab/Bitbucket)
- Domain name (optional but recommended)

## Quick Fix for Port 8080 Conflict

The error you encountered is because Adminer tries to use port 8080, which Coolify already uses. This has been fixed by:
1. Changing Adminer port to 8081 in development
2. Making Adminer optional (only runs with `--profile dev`)
3. Removing Adminer from production deployment

## Step-by-Step Deployment on Coolify

### 1. Push Your Code to Git Repository

First, make sure all your code is committed and pushed to your Git repository:

```bash
git add .
git commit -m "Fix port conflicts for Coolify deployment"
git push origin main
```

### 2. Create a New Project in Coolify

1. Log in to your Coolify dashboard (usually at `https://your-vps-ip:8080`)
2. Click **"+ New"** → **"Project"**
3. Give it a name: `Cupperly`
4. Click **"Create"**

### 3. Add a New Resource

1. Inside your project, click **"+ New Resource"**
2. Select **"Docker Compose"**
3. Choose your Git source (GitHub, GitLab, etc.)
4. Select your repository: `Alaswadi/cupperly`
5. Select branch: `main`
6. Set the compose file path: `docker-compose.prod.yml`

### 4. Configure Environment Variables

In Coolify, go to your resource → **Environment Variables** and add the following:

#### Required Variables:

```env
# Database Configuration
POSTGRES_DB=cupperly
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<GENERATE_STRONG_PASSWORD>

# Database URL (use the password from above)
DATABASE_URL=postgresql://postgres:<YOUR_PASSWORD>@postgres:5432/cupperly

# Redis Configuration
REDIS_URL=redis://redis:6379

# JWT Secrets (Generate strong random strings - minimum 32 characters)
JWT_SECRET=<GENERATE_RANDOM_STRING_32_CHARS>
JWT_REFRESH_SECRET=<GENERATE_RANDOM_STRING_32_CHARS>

# NextAuth Configuration
NEXTAUTH_SECRET=<GENERATE_RANDOM_STRING_32_CHARS>
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Port Configuration (Coolify will handle these)
API_PORT=3001
WEB_PORT=3000

# Node Environment
NODE_ENV=production
```

#### How to Generate Secure Secrets:

You can generate secure random strings using:

**On Linux/Mac:**
```bash
openssl rand -base64 32
```

**On Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Online (use with caution):**
- https://randomkeygen.com/

### 5. Configure Domains (Optional but Recommended)

If you have a domain:

1. In Coolify, go to your resource → **Domains**
2. Add your domains:
   - Frontend: `cupping.yourdomain.com` → Port `3000`
   - API: `api.cupping.yourdomain.com` → Port `3001`
3. Enable **SSL/TLS** (Let's Encrypt)
4. Update your DNS records to point to your VPS IP

### 6. Deploy

1. Click **"Deploy"** button in Coolify
2. Monitor the deployment logs
3. Wait for all services to start (this may take 5-10 minutes on first deployment)

### 7. Verify Deployment

Once deployed, check:

1. **Frontend**: Visit `https://your-domain.com` or `http://your-vps-ip:3000`
2. **API Health**: Visit `https://api.your-domain.com/health` or `http://your-vps-ip:3001/health`
3. **Database**: Should be running internally (not exposed to internet)
4. **Redis**: Should be running internally (not exposed to internet)

## Troubleshooting

### Port Already Allocated Error

If you see: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution:** This is fixed in the latest code. Make sure you're using `docker-compose.prod.yml` which doesn't include Adminer.

### Database Connection Issues

If the API can't connect to the database:

1. Check that `DATABASE_URL` environment variable is correct
2. Verify PostgreSQL container is running: `docker ps | grep postgres`
3. Check logs: `docker logs cupperly-postgres`

### Build Failures

If the build fails:

1. Check Coolify build logs for specific errors
2. Ensure all environment variables are set
3. Try rebuilding: Click **"Redeploy"** in Coolify

### Services Not Starting

If services fail to start:

1. Check individual container logs in Coolify
2. Verify health checks are passing
3. Ensure sufficient resources (RAM/CPU) on your VPS

## Accessing the Database

Since Adminer is not included in production, you have several options:

### Option 1: Use Coolify's Built-in Database Tools

Coolify may have built-in database management tools.

### Option 2: SSH Tunnel

Create an SSH tunnel to access the database:

```bash
ssh -L 5432:localhost:5432 user@your-vps-ip
```

Then connect using any PostgreSQL client to `localhost:5432`

### Option 3: Temporarily Enable Adminer

If you need Adminer temporarily:

1. SSH into your VPS
2. Navigate to your project directory
3. Run:
```bash
docker run -d --name temp-adminer \
  --network cupperly-network \
  -p 8081:8080 \
  -e ADMINER_DEFAULT_SERVER=postgres \
  adminer:4.8.1
```
4. Access at `http://your-vps-ip:8081`
5. Remove when done: `docker rm -f temp-adminer`

## Updating Your Deployment

To update your deployment after making changes:

1. Push changes to your Git repository
2. In Coolify, click **"Redeploy"** or enable **Auto Deploy** for automatic deployments

## Performance Optimization

### For Production:

1. **Enable Redis Persistence**: Already configured in `docker-compose.prod.yml`
2. **Database Backups**: Set up regular backups in Coolify
3. **Resource Limits**: Configure in Coolify resource settings
4. **Monitoring**: Enable Coolify monitoring features

### Recommended VPS Specs:

- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage
- **For high traffic**: 8+ CPU cores, 16GB+ RAM, 100GB+ storage

## Security Checklist

- ✅ Strong passwords for database
- ✅ Secure JWT secrets (32+ characters)
- ✅ HTTPS enabled (SSL/TLS)
- ✅ Database not exposed to internet
- ✅ Redis not exposed to internet
- ✅ Environment variables properly set
- ✅ Regular backups configured

## Support

If you encounter issues:

1. Check Coolify logs
2. Check container logs: `docker logs <container-name>`
3. Review this guide
4. Check the main DEPLOYMENT.md for additional information

## Next Steps

After successful deployment:

1. Create your first admin user
2. Configure organization settings
3. Set up cupping templates
4. Invite team members
5. Start your first cupping session!

---

**Note**: This deployment uses Docker Compose in production mode, which is optimized for performance and security. Development features like hot-reload and Adminer are disabled.

