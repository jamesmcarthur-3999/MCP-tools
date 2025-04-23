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

## Prerequisites

- Node.js (v16 or higher)
- Productiv API credentials (API key)
- Claude Desktop or other MCP-compatible client

## Installation

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

## Usage with Claude Desktop

1. Build the server:
   ```bash
   npm run build
   ```

2. Add the server to Claude Desktop:
   - Open Claude Desktop
   - Go to Settings > MCP Servers
   - Click "Add Server"
   - Configure with the following:
     - Name: Productiv
     - Command: node
     - Arguments: /path/to/MCP-tools/productiv-mcp/dist/server.js

3. Once connected, you can ask Claude about your SaaS portfolio with queries like:
   - "Show me our most expensive SaaS applications"
   - "Which applications have the lowest usage rates?"
   - "When is our Salesforce contract up for renewal?"
   - "What applications have new licenses added in the last month?"
   - "Show me potential license optimization opportunities"

## Development

- `npm run dev` - Run the server in development mode
- `npm run build` - Build the server for production
- `npm run test` - Run tests

## License

MIT
