# Coolify Deployment Configuration

This directory contains Coolify-specific deployment configurations for the Cupperly platform.

## Quick Start

1. **In Coolify Dashboard:**
   - Create new project
   - Add Docker Compose resource
   - Point to this repository
   - Use compose file: `.coolify/docker-compose.yml` or `docker-compose.prod.yml`

2. **Set Environment Variables** (see below)

3. **Deploy!**

## Required Environment Variables

```env
# Database
POSTGRES_DB=cupperly
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<your-secure-password>
DATABASE_URL=postgresql://postgres:<your-password>@postgres:5432/cupperly

# Redis
REDIS_URL=redis://redis:6379

# JWT Secrets (32+ characters each)
JWT_SECRET=<generate-random-string>
JWT_REFRESH_SECRET=<generate-random-string>

# NextAuth
NEXTAUTH_SECRET=<generate-random-string>
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Ports (optional, defaults provided)
API_PORT=3001
WEB_PORT=3000

# Environment
NODE_ENV=production
```

## Generate Secrets

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## Port Configuration

- **Frontend (Web)**: Port 3000
- **Backend (API)**: Port 3001
- **PostgreSQL**: Internal only (not exposed)
- **Redis**: Internal only (not exposed)

## Health Checks

All services include health checks:
- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`
- **API**: `GET /health`
- **Web**: `GET /` (homepage)

## Troubleshooting

### Port 8080 Conflict
**Fixed!** Adminer is not included in production deployment.

### Build Issues
- Ensure all environment variables are set
- Check build logs in Coolify
- Verify Dockerfile paths are correct

### Database Connection
- Verify `DATABASE_URL` is correct
- Check PostgreSQL container is healthy
- Review API logs for connection errors

## Monitoring

Check service health:
```bash
docker ps
docker logs cupperly-api
docker logs cupperly-web
docker logs cupperly-postgres
docker logs cupperly-redis
```

## Backup

Important data locations:
- **Database**: Volume `postgres_data`
- **Redis**: Volume `redis_data`

Configure backups in Coolify settings.

## Support

See main documentation:
- [COOLIFY_DEPLOYMENT.md](../COOLIFY_DEPLOYMENT.md) - Detailed deployment guide
- [DEPLOYMENT.md](../DEPLOYMENT.md) - General deployment information
- [README.md](../README.md) - Project overview

