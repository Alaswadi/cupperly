# Deployment Guide for Coolify

This guide explains how to deploy the Cupperly application to Coolify.

## Prerequisites

1. Coolify instance running
2. Git repository accessible by Coolify
3. Domain names configured (optional but recommended)

## Deployment Steps

### 1. Prepare Environment Variables

Copy the production environment template:
```bash
cp .env.production.example .env.production
```

Edit `.env.production` and set the following required variables:

**Required Variables:**
- `POSTGRES_PASSWORD`: Strong password for PostgreSQL
- `JWT_SECRET`: Secure JWT secret (minimum 32 characters)
- `JWT_REFRESH_SECRET`: Secure refresh token secret (minimum 32 characters)
- `NEXTAUTH_SECRET`: Secure NextAuth secret (minimum 32 characters)
- `NEXTAUTH_URL`: Your frontend domain (e.g., https://cupping.yourdomain.com)
- `NEXT_PUBLIC_API_URL`: Your API domain (e.g., https://api.cupping.yourdomain.com)

### 2. Coolify Configuration

1. **Create a new project** in Coolify
2. **Add your Git repository** as a source
3. **Select Docker Compose** as the deployment method
4. **Use the production compose file**: `docker-compose.prod.yml`

### 3. Environment Variables in Coolify

In your Coolify project settings, add all the environment variables from your `.env.production` file.

### 4. Port Configuration

The application exposes:
- **Frontend (Web)**: Port 3000
- **Backend (API)**: Port 3001

Configure your reverse proxy/domains in Coolify to point to these ports.

### 5. Health Checks

The production compose file includes health checks for both services:
- API health check: `http://localhost:3001/health`
- Web health check: `http://localhost:3000`

## Differences from Development

The production configuration:
- ✅ Uses production Docker targets
- ✅ No external Redis port exposure (security)
- ✅ No external PostgreSQL port exposure (security)
- ✅ Includes health checks
- ✅ Uses environment variables for configuration
- ✅ Optimized for production deployment

## Troubleshooting

### Port Conflicts
If you get "port already allocated" errors:
- The production config doesn't expose Redis (6379) or PostgreSQL (5432) externally
- Only the application ports (3000, 3001) are exposed
- Make sure no other services are using these ports on your Coolify host

### Database Connection Issues
- Ensure `DATABASE_URL` matches your PostgreSQL configuration
- Check that the PostgreSQL container is healthy
- Verify network connectivity between containers

### Redis Connection Issues
- Ensure `REDIS_URL` is set to `redis://redis:6379`
- Check that the Redis container is healthy
- Verify network connectivity between containers

## Security Notes

1. **Change all default secrets** in production
2. **Use strong passwords** for database
3. **Enable HTTPS** for your domains
4. **Regularly update** container images
5. **Monitor** application logs and health checks
