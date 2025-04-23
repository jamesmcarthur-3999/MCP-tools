/**
 * Post-installation script
 * Displays installation instructions after npm install
 */

const os = require('os');
const path = require('path');
const fs = require('fs');

// Get the path to the package directory
const packageDir = path.resolve(__dirname, '..', '..');
const packageJsonPath = path.join(packageDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const isGlobalInstall = process.env.npm_config_global === 'true';

console.log('\n\x1b[1mProductiv MCP Server v' + packageJson.version + ' installed!\x1b[0m');
console.log('\nThis MCP server allows Claude to interact with your Productiv SaaS Management Platform.\n');

if (isGlobalInstall) {
  console.log('\x1b[32mGlobal installation detected!\x1b[0m');
  console.log('\nRun the following command to configure Claude Desktop:');
  console.log('\n  \x1b[36mproductiv-mcp setup\x1b[0m');
} else {
  console.log('\nTo configure Claude Desktop, run:');
  console.log('\n  \x1b[36mnpx productiv-mcp setup\x1b[0m');
  console.log('\nOr install globally:');
  console.log('\n  \x1b[36mnpm install -g @mcptools/productiv-mcp\x1b[0m');
  console.log('  \x1b[36mproductiv-mcp setup\x1b[0m');
}

console.log('\nFor manual configuration, add this to your Claude Desktop config file:');

const configPath = process.platform === 'win32'
  ? '%APPDATA%\\Claude\\claude_desktop_config.json'
  : process.platform === 'darwin'
    ? '~/Library/Application Support/Claude/claude_desktop_config.json'
    : '~/.config/Claude/claude_desktop_config.json';

console.log(`\nConfig file location: \x1b[33m${configPath}\x1b[0m\n`);

const serverPath = path.join(
  isGlobalInstall ? 'global-node-modules-path' : 'node_modules',
  '@mcptools/productiv-mcp/dist/server.js'
);

console.log(`\x1b[34m{
  "mcpServers": {
    "productiv-saas": {
      "command": "node",
      "args": ["${serverPath}"],
      "env": {
        "PRODUCTIV_API_KEY": "your-api-key-here",
        "MCP_ENABLED_TOOLSETS": "applications,contracts,licenses,security,analytics,recommendations",
        "MCP_DEBUG_MODE": "false"
      }
    }
  }
}\x1b[0m\n`);

console.log('For more information, visit: https://github.com/jamesmcarthur-3999/MCP-tools');
