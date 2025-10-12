#!/bin/bash
# Start Docker Compose with the correct environment file
# This ensures Docker containers use 'postgres' and 'redis' service names

echo "🐳 Starting Cupperly with Docker Compose..."
echo "📝 Using .env.docker for environment variables"
echo ""

# Use .env.docker file
docker-compose --env-file .env.docker up --build

# Note: Press Ctrl+C to stop all services

