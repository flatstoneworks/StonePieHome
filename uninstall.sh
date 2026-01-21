#!/bin/bash

# StonePieHome Uninstallation Script
# Stops and removes StonePieHome systemd services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}╔══════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║ StonePieHome Uninstallation Script  ║${NC}"
echo -e "${YELLOW}╚══════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
   echo -e "${RED}Error: Please run this script as your regular user, not as root.${NC}"
   echo "The script will use sudo when needed."
   exit 1
fi

echo -e "${YELLOW}This will stop and remove StonePieHome services.${NC}"
echo -e "${YELLOW}Your data in the 'data' directory will be preserved.${NC}"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Uninstallation cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}Stopping services...${NC}"

# Stop services
sudo systemctl stop stonepiehome-frontend.service 2>/dev/null || true
sudo systemctl stop stonepiehome-backend.service 2>/dev/null || true

echo -e "${GREEN}✓ Services stopped${NC}"
echo ""

echo -e "${YELLOW}Disabling services...${NC}"

# Disable services
sudo systemctl disable stonepiehome-frontend.service 2>/dev/null || true
sudo systemctl disable stonepiehome-backend.service 2>/dev/null || true

echo -e "${GREEN}✓ Services disabled${NC}"
echo ""

echo -e "${YELLOW}Removing service files...${NC}"

# Remove service files
sudo rm -f /etc/systemd/system/stonepiehome-backend.service
sudo rm -f /etc/systemd/system/stonepiehome-frontend.service

# Reload systemd daemon
sudo systemctl daemon-reload

echo -e "${GREEN}✓ Service files removed${NC}"
echo ""

echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    Uninstallation Complete! ✓       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo "StonePieHome services have been removed."
echo "Your data directory and application files are still intact."
echo ""
echo "To completely remove StonePieHome:"
echo "  cd .. && rm -rf StonePieHome"
echo ""
