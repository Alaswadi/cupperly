#!/bin/bash

# Port Conflict Checker for Cupperly Deployment
# This script checks if required ports are available before deployment

echo "🔍 Checking port availability for Cupperly deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ports to check
PORTS=(3000 3001 3003 5432 6379 8081 15432)
PORT_NAMES=("Web (Production)" "API" "Web (Dev)" "PostgreSQL (Local)" "Redis" "Adminer (Dev)" "PostgreSQL (Docker)")

# Function to check if port is in use
check_port() {
    local port=$1
    local name=$2
    
    if command -v lsof &> /dev/null; then
        # Using lsof (Linux/Mac)
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${RED}✗${NC} Port $port ($name) is ${RED}IN USE${NC}"
            lsof -Pi :$port -sTCP:LISTEN
            return 1
        else
            echo -e "${GREEN}✓${NC} Port $port ($name) is ${GREEN}available${NC}"
            return 0
        fi
    elif command -v netstat &> /dev/null; then
        # Using netstat (Windows/Linux)
        if netstat -an | grep ":$port " | grep LISTEN >/dev/null 2>&1; then
            echo -e "${RED}✗${NC} Port $port ($name) is ${RED}IN USE${NC}"
            netstat -an | grep ":$port "
            return 1
        else
            echo -e "${GREEN}✓${NC} Port $port ($name) is ${GREEN}available${NC}"
            return 0
        fi
    else
        echo -e "${YELLOW}⚠${NC} Cannot check port $port - neither lsof nor netstat available"
        return 2
    fi
}

# Check all ports
all_clear=true
for i in "${!PORTS[@]}"; do
    if ! check_port "${PORTS[$i]}" "${PORT_NAMES[$i]}"; then
        all_clear=false
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$all_clear" = true ]; then
    echo -e "${GREEN}✓ All ports are available!${NC}"
    echo "You can proceed with deployment."
else
    echo -e "${RED}✗ Some ports are in use!${NC}"
    echo ""
    echo "Solutions:"
    echo "1. Stop the services using these ports"
    echo "2. For Coolify deployments, use docker-compose.prod.yml (no port conflicts)"
    echo "3. Modify port mappings in docker-compose.yml if needed"
    echo ""
    echo "Common conflicts:"
    echo "  - Port 8080: Usually Coolify itself (Fixed: Adminer now uses 8081)"
    echo "  - Port 3000: Another web server"
    echo "  - Port 5432: Local PostgreSQL installation"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

