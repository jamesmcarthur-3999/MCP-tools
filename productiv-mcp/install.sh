#!/bin/bash

# Colors for output
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}Productiv MCP Server Installer${NC}"
echo -e "This script will install and configure the Productiv MCP server for Claude Desktop."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo -e "Please install Node.js v16 or higher from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)

if [ $NODE_MAJOR -lt 16 ]; then
    echo -e "${RED}Error: Node.js version $NODE_VERSION is too old.${NC}"
    echo -e "Please upgrade to Node.js v16 or higher from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js v$NODE_VERSION detected${NC}"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    echo -e "Please install npm (it usually comes with Node.js)"
    exit 1
fi

echo -e "${GREEN}✓ npm detected${NC}"

# Install the package globally
echo -e "${BLUE}Installing Productiv MCP server...${NC}"
if ! npm install -g @mcptools/productiv-mcp; then
    echo -e "${RED}Failed to install the Productiv MCP server.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Productiv MCP server installed successfully${NC}"

# Run the setup script
echo -e "${BLUE}Configuring Claude Desktop...${NC}"
if ! productiv-mcp setup; then
    echo -e "${YELLOW}Setup not completed. You can run 'productiv-mcp setup' later to configure Claude Desktop.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Installation complete!${NC}"
echo -e "Please restart Claude Desktop to start using the Productiv MCP server."
