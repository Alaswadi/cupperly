# Production Build & Docker Guide

This guide will help you build and run the Cupperly application in production mode using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (comes with Docker Desktop)
- At least 4GB of free RAM
- At least 10GB of free disk space

## Quick Start (Production Mode)

### 1. Configure Environment Variables

First, update the production environment file with your actual secrets:

```bash
# Edit .env.production and update these critical values:
# - POSTGRES_PASSWORD
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL (your production domain)
# - NEXT_PUBLIC_API_URL (your production API URL)
```

**Generate secure secrets:**
```powershell
# Generate random secrets (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### 2. Build Production Images

```powershell
# Using the helper script (recommended)
.\scripts\docker-prod.ps1 build

# Or manually
docker-compose --env-file .env.production build --no-cache
```

This will:
- Build optimized production images for the API and Web app
- Install only production dependencies
- Compile TypeScript code
- Generate Prisma client
- Create Next.js production build with standalone output

### 3. Start Services

```powershell
# Using the helper script
.\scripts\docker-prod.ps1 up

# Or manually
docker-compose --env-file .env.production up -d
```

### 4. Access the Application

Once started, the application will be available at:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Database**: localhost:15432
- **Redis**: localhost:6379

### 5. Initialize Database (First Time Only)

```powershell
# Run database migrations
docker exec -it cupperly-api npx prisma migrate deploy

# Seed initial data (optional)
docker exec -it cupperly-api npx prisma db seed
```

## Helper Script Commands

The `docker-prod.ps1` script provides convenient commands:

```powershell
# Build production images
.\scripts\docker-prod.ps1 build

# Start all services
.\scripts\docker-prod.ps1 up

# Stop all services
.\scripts\docker-prod.ps1 down

# Restart all services
.\scripts\docker-prod.ps1 restart

# View logs
.\scripts\docker-prod.ps1 logs

# Check container status
.\scripts\docker-prod.ps1 status

# Clean up (WARNING: deletes all data)
.\scripts\docker-prod.ps1 clean

# Show help
.\scripts\docker-prod.ps1 help
```

## Manual Docker Commands

If you prefer to use Docker commands directly:

```bash
# Build images
docker-compose --env-file .env.production build

# Start services in detached mode
docker-compose --env-file .env.production up -d

# View logs
docker-compose --env-file .env.production logs -f

# View logs for specific service
docker-compose --env-file .env.production logs -f web
docker-compose --env-file .env.production logs -f api

# Stop services
docker-compose --env-file .env.production down

# Stop and remove volumes (deletes data)
docker-compose --env-file .env.production down -v

# Check running containers
docker-compose --env-file .env.production ps

# Execute commands in containers
docker exec -it cupperly-api sh
docker exec -it cupperly-web sh
```

## Production Architecture

The production setup includes:

1. **PostgreSQL Database** (postgres:15-alpine)
   - Persistent data storage
   - Exposed on port 15432
   - Data persisted in Docker volume

2. **Redis Cache** (redis:7-alpine)
   - Session storage and caching
   - Exposed on port 6379
   - Data persisted in Docker volume

3. **API Service** (Node.js/Express)
   - Production-optimized build
   - Runs compiled JavaScript
   - Exposed on port 3001
   - Non-root user for security

4. **Web Service** (Next.js)
   - Standalone production build
   - Server-side rendering
   - Exposed on port 3000
   - Non-root user for security

## Troubleshooting

### Build Fails

```powershell
# Clean Docker cache and rebuild
docker system prune -a
.\scripts\docker-prod.ps1 build
```

### Services Won't Start

```powershell
# Check logs
.\scripts\docker-prod.ps1 logs

# Check specific service
docker-compose --env-file .env.production logs api
docker-compose --env-file .env.production logs web
```

### Database Connection Issues

```powershell
# Verify database is running
docker-compose --env-file .env.production ps postgres

# Check database logs
docker-compose --env-file .env.production logs postgres

# Connect to database
docker exec -it cupperly-postgres psql -U postgres -d cupperly
```

### Port Conflicts

If ports are already in use, update `.env.production`:

```env
WEB_PORT=3010
API_PORT=3011
POSTGRES_PORT=15433
```

### Reset Everything

```powershell
# Stop and remove everything
.\scripts\docker-prod.ps1 clean

# Rebuild from scratch
.\scripts\docker-prod.ps1 build
.\scripts\docker-prod.ps1 up
```

## Performance Optimization

### Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Health Checks

Services include health checks to ensure they're running properly:

```bash
# Check health status
docker inspect cupperly-api | grep -A 10 Health
docker inspect cupperly-web | grep -A 10 Health
```

## Production Deployment

For deploying to a production server:

1. **Update Environment Variables**
   - Set proper domain names
   - Use strong secrets
   - Configure SSL/TLS

2. **Use Reverse Proxy**
   - Nginx or Traefik for SSL termination
   - Load balancing
   - Rate limiting

3. **Database Backups**
   ```bash
   # Backup database
   docker exec cupperly-postgres pg_dump -U postgres cupperly > backup.sql
   
   # Restore database
   docker exec -i cupperly-postgres psql -U postgres cupperly < backup.sql
   ```

4. **Monitoring**
   - Set up logging aggregation
   - Monitor container health
   - Track resource usage

## Security Checklist

- [ ] Update all default passwords
- [ ] Generate strong JWT secrets
- [ ] Configure HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Environment variables secured

## Next Steps

1. Configure your domain and SSL certificates
2. Set up automated backups
3. Configure monitoring and alerting
4. Set up CI/CD pipeline
5. Review security settings

## Support

For issues or questions:
- Check the logs: `.\scripts\docker-prod.ps1 logs`
- Review Docker documentation
- Check application documentation

