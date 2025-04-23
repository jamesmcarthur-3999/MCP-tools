/**
 * Installation helper for Productiv MCP server
 * Configures Claude Desktop to use the server
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as inquirer from 'inquirer';
import * as chalk from 'chalk';

// Get Claude Desktop config file path based on OS
function getClaudeConfigPath(): string {
  const homeDir = os.homedir();
  if (process.platform === 'win32') {
    return path.join(homeDir, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
  } else if (process.platform === 'darwin') {
    return path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else {
    // Linux or other OS
    return path.join(homeDir, '.config', 'Claude', 'claude_desktop_config.json');
  }
}

// Get the full path to the server.js file
function getServerPath(): string {
  const scriptDir = __dirname;
  const distDir = path.dirname(scriptDir);
  return path.join(distDir, 'server.js');
}

// Create or update Claude Desktop config with our server
async function updateClaudeConfig(): Promise<void> {
  const configPath = getClaudeConfigPath();
  const serverPath = getServerPath();
  
  console.log(chalk.blue('\nConfiguring Claude Desktop to use Productiv MCP server...'));
  console.log(chalk.dim(`Config path: ${configPath}`));
  console.log(chalk.dim(`Server path: ${serverPath}`));

  // Ensure config directory exists
  const configDir = path.dirname(configPath);
  await fs.ensureDir(configDir);

  // Create or read existing config
  let config = { mcpServers: {} };
  if (await fs.pathExists(configPath)) {
    try {
      const configData = await fs.readFile(configPath, 'utf8');
      config = JSON.parse(configData);
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
    } catch (error) {
      console.log(chalk.yellow('Invalid Claude Desktop config, creating a new one'));
    }
  }

  // Check if server already exists
  const hasServer = config.mcpServers['productiv-saas'];

  if (hasServer) {
    const { updateExisting } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'updateExisting',
        message: 'Productiv MCP server already configured. Update it?',
        default: true
      }
    ]);

    if (!updateExisting) {
      console.log(chalk.yellow('\nConfiguration skipped.'));
      return;
    }
  }

  // Prompt for API key
  const { apiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter your Productiv API key:',
      validate: (input) => input.trim() !== '' ? true : 'API key is required'
    }
  ]);

  // Prompt for enabled toolsets
  const { toolsets } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'toolsets',
      message: 'Select toolsets to enable:',
      choices: [
        { name: 'Applications (manage SaaS applications)', value: 'applications', checked: true },
        { name: 'Contracts (manage contracts and renewals)', value: 'contracts', checked: true },
        { name: 'Licenses (manage license allocations)', value: 'licenses', checked: true },
        { name: 'Security (detect shadow IT and risks)', value: 'security', checked: true },
        { name: 'Analytics (get spend analytics)', value: 'analytics', checked: true },
        { name: 'Recommendations (get optimization suggestions)', value: 'recommendations', checked: true }
      ]
    }
  ]);

  // Update config
  const enabledToolsets = toolsets.length > 0 ? toolsets.join(',') : 'all';
  
  // Escape backslashes for Windows paths
  const formattedServerPath = serverPath.replace(/\\/g, '\\\\');
  
  // Create server configuration
  config.mcpServers['productiv-saas'] = {
    "command": "node",
    "args": [formattedServerPath],
    "env": {
      "PRODUCTIV_API_KEY": apiKey,
      "MCP_ENABLED_TOOLSETS": enabledToolsets,
      "MCP_DEBUG_MODE": "false"
    }
  };

  // Save config
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));

  console.log(chalk.green('\n✅ Productiv MCP server configured successfully!'));
  console.log(chalk.blue('\nNEXT STEPS:'));
  console.log('1. Restart Claude Desktop');
  console.log('2. Look for the hammer icon in the message input area');
  console.log('3. Ask Claude about your SaaS portfolio');
}

// Main function
async function main() {
  console.log(chalk.bold('\nProductiv MCP Server Setup'));
  console.log(chalk.dim('This script will configure Claude Desktop to use the Productiv MCP server'));
  
  try {
    await updateClaudeConfig();
  } catch (error) {
    console.error(chalk.red('\n❌ Setup failed:'), error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main().catch(console.error);
}
