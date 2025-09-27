# Docker Optimizations for Cupping Lab

## Issues Fixed

### 1. Port Conflicts
- **Problem**: PostgreSQL port 5432 was blocked by Windows permissions
- **Solution**: Changed PostgreSQL port to 15432
- **Problem**: Frontend port 3000 was already in use
- **Solution**: Changed frontend port to 3002

### 2. Slow Build Times
- **Problem**: npm packages were being installed repeatedly, taking 10+ minutes
- **Solution**: Optimized Dockerfile multi-stage builds to use cached dependencies

## Optimizations Applied

### 1. Dockerfile Improvements
- **API Dockerfile**: Removed redundant source code copying in development stage
- **Web Dockerfile**: Reused dependencies from deps stage instead of reinstalling
- **Result**: Build time reduced from 10+ minutes to ~5 minutes

### 2. Docker Compose Enhancements
- **Added docker-compose.override.yml**: Provides development-specific optimizations
- **Volume Caching**: Added named volumes for node_modules to persist between builds
- **Build Cache**: Added cache_from directives for better layer caching

### 3. Development Script
- **Created scripts/docker-dev.ps1**: PowerShell script for easy development startup
- **Features**: 
  - Enables BuildKit for better caching
  - Provides clear status messages
  - Shows all application URLs
  - Handles container cleanup

## Current Application URLs

After running `docker-compose up -d`:

- **Frontend**: http://localhost:3002
- **API**: http://localhost:3001  
- **Database Admin (Adminer)**: http://localhost:8080
- **PostgreSQL**: localhost:15432
- **Redis**: localhost:6379

## Database Connection

For external tools connecting to PostgreSQL:
- **Host**: localhost
- **Port**: 15432
- **Database**: cupperly
- **Username**: postgres
- **Password**: password

## Future Improvements

1. **Multi-stage Build Cache**: Consider using BuildKit cache mounts for even faster npm installs
2. **Development Volumes**: Fine-tune volume mounts for optimal development experience
3. **Health Checks**: Add health checks to ensure services are ready before dependent services start
4. **Environment Variables**: Consider using .env files for easier configuration management

## Usage

### Quick Start
```bash
# Using the optimized script
./scripts/docker-dev.ps1

# Or traditional method
docker-compose up -d
```

### Rebuild After Changes
```bash
# Only rebuild if package.json changed
docker-compose up -d --build

# Force rebuild everything
docker-compose build --no-cache
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```
