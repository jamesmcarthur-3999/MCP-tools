# Productiv MCP Server

A Model Context Protocol (MCP) server for the [Productiv SaaS Management Platform](https://productiv.com/). This MCP server allows Claude and other AI assistants to interact with your Productiv account to manage your SaaS portfolio.

## Features

This MCP server provides tools to:

- Get a complete view of your SaaS portfolio and application inventory
- Analyze application usage and adoption at the feature level
- Optimize license allocation based on actual usage patterns
- Track spend and manage contract renewals
- Identify shadow IT and security risks
- Generate insights and recommendations for SaaS optimization

## Quick Installation

### Option 1: Install via NPX (Recommended)

The easiest way to install and configure the Productiv MCP server is using NPX:

```bash
npx @mcptools/productiv-mcp setup
```

This interactive setup will:
1. Check if Claude Desktop is installed
2. Prompt for your Productiv API key
3. Let you select which toolsets to enable
4. Update your Claude Desktop configuration automatically

### Option 2: Global Installation

You can also install the server globally:

```bash
npm install -g @mcptools/productiv-mcp
productiv-mcp setup
```

### Option 3: Manual Configuration

If you prefer to manually configure Claude Desktop:

1. Edit your Claude Desktop configuration file:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Add the Productiv MCP server configuration:

```json
{
  "mcpServers": {
    "productiv-saas": {
      "command": "node",
      "args": ["path/to/productiv-mcp/dist/server.js"],
      "env": {
        "PRODUCTIV_API_KEY": "your-api-key-here",
        "MCP_ENABLED_TOOLSETS": "applications,contracts,licenses,security,analytics,recommendations",
        "MCP_DEBUG_MODE": "false"
      }
    }
  }
}
```

## Prerequisites

- Node.js (v16 or higher)
- Productiv API credentials (API key)
- Claude Desktop or other MCP-compatible client

## Manual Installation (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/jamesmcarthur-3999/MCP-tools.git
   cd MCP-tools/productiv-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your Productiv API key.

4. Build the server:
   ```bash
   npm run build
   ```

5. Run the installation script:
   ```bash
   npm run setup
   ```

## Usage with Claude Desktop

1. After installation, restart Claude Desktop.
2. You should see a hammer icon in the message input area, indicating that MCP tools are available.
3. You can now ask Claude about your SaaS portfolio with queries like:
   - "Show me our most expensive SaaS applications"
   - "Which applications have the lowest usage rates?"
   - "When is our Salesforce contract up for renewal?"
   - "What applications have new licenses added in the last month?"
   - "Show me potential license optimization opportunities"

## Toolsets

The server is organized into several toolsets that can be enabled or disabled:

- **Applications**: Manage your SaaS application inventory
- **Contracts**: Track and manage vendor contracts and renewals
- **Licenses**: Optimize license allocation based on usage
- **Security**: Detect shadow IT and security risks
- **Analytics**: Analyze spend and usage patterns
- **Recommendations**: Get optimization suggestions and alerts

## Configuration Options

The server supports the following environment variables:

- `PRODUCTIV_API_KEY`: Your Productiv API key (required)
- `PRODUCTIV_API_URL`: Productiv API URL (defaults to `https://api.productiv.com`)
- `MCP_ENABLED_TOOLSETS`: Comma-separated list of toolsets to enable (defaults to `all`)
- `MCP_DEBUG_MODE`: Enable debug logging (set to `true` or `false`)
- `MCP_ENABLE_HTTP_TRANSPORT`: Enable HTTP transport (set to `true` or `false`)
- `MCP_HTTP_PORT`: HTTP port for the server (defaults to 3000)
- `MCP_PROTOCOL_VERSION`: MCP protocol version (defaults to `1.0`)

## Development

- `npm run dev` - Run the server in development mode
- `npm run build` - Build the server for production
- `npm run start` - Start the server
- `npm run test` - Run tests
- `npm run lint` - Lint the codebase
- `npm run inspector` - Run the MCP inspector for debugging

## License

MIT
