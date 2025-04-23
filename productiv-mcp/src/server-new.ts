import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema, 
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { productivAPI } from './services/api';
import { handleApiError } from './utils/error';

// Server configuration
const SERVER_NAME = 'Productiv SaaS Management';
const SERVER_VERSION = '1.0.0';
const DEFAULT_PORT = 3000;

// Protocol version handling
const SUPPORTED_PROTOCOL_VERSIONS = ['1.0', '1.1', '1.2'];
const DEFAULT_PROTOCOL_VERSION = '1.0';

// Environment variables
const enableHttpTransport = process.env.MCP_ENABLE_HTTP_TRANSPORT === 'true';
const httpPort = parseInt(process.env.MCP_HTTP_PORT || DEFAULT_PORT.toString(), 10);
const debugMode = process.env.MCP_DEBUG_MODE === 'true';
const protocolVersion = process.env.MCP_PROTOCOL_VERSION || DEFAULT_PROTOCOL_VERSION;

// Validate protocol version
if (!SUPPORTED_PROTOCOL_VERSIONS.includes(protocolVersion)) {
  console.error(`Unsupported protocol version: ${protocolVersion}. Supported versions: ${SUPPORTED_PROTOCOL_VERSIONS.join(', ')}`);
  process.exit(1);
}

// Get enabled toolsets from environment variable
const enabledToolsets = process.env.MCP_ENABLED_TOOLSETS 
  ? process.env.MCP_ENABLED_TOOLSETS.split(',').map(t => t.trim())
  : ['all']; // Default to all toolsets

// Create MCP server instance
const server = new Server({ 
  name: SERVER_NAME, 
  version: SERVER_VERSION 
}, {
  capabilities: {
    tools: {}
  }
});

// Logger setup
const logger = {
  info: (message: string, ...args: any[]) => {
    if (debugMode) {
      console.error(`[INFO] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.error(`[WARN] ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (debugMode) {
      console.error(`[DEBUG] ${message}`, ...args);
    }
  }
};

// Helper function to check if a toolset is enabled
function isToolsetEnabled(toolset: string): boolean {
  if (enabledToolsets.includes('all')) {
    return true;
  }
  return enabledToolsets.includes(toolset);
}

// Define all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.info('Listing available tools');
  
  const tools = [];
  
  // Applications Toolset
  if (isToolsetEnabled('applications')) {
    tools.push({
      name: 'list_applications',
      description: 'Get a list of all applications in the SaaS portfolio',
      category: 'applications',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    });
    
    tools.push({
      name: 'get_application_details',
      description: 'Get detailed information about a specific application by ID or name',
      category: 'applications',
      inputSchema: {
        type: 'object',
        properties: {
          idOrName: {
            type: 'string',
            description: 'Application ID or name'
          }
        },
        required: ['idOrName']
      }
    });
    
    tools.push({
      name: 'get_application_usage',
      description: 'Get usage analytics for an application, including active users and feature usage',
      category: 'applications',
      inputSchema: {
        type: 'object',
        properties: {
          idOrName: {
            type: 'string',
            description: 'Application ID or name'
          },
          period: {
            type: 'string',
            description: 'Time period for usage data (e.g., last30days, last90days)'
          }
        },
        required: ['idOrName']
      }
    });
  }
  
  // Contracts Toolset
  if (isToolsetEnabled('contracts')) {
    tools.push({
      name: 'get_contracts',
      description: 'Get a list of all contracts',
      category: 'contracts',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    });
    
    tools.push({
      name: 'get_application_contracts',
      description: 'Get contracts for a specific application',
      category: 'contracts',
      inputSchema: {
        type: 'object',
        properties: {
          idOrName: {
            type: 'string',
            description: 'Application ID or name'
          }
        },
        required: ['idOrName']
      }
    });
  }
  
  // Licenses Toolset
  if (isToolsetEnabled('licenses')) {
    tools.push({
      name: 'get_application_licenses',
      description: 'Get licenses for a specific application',
      category: 'licenses',
      inputSchema: {
        type: 'object',
        properties: {
          idOrName: {
            type: 'string',
            description: 'Application ID or name'
          }
        },
        required: ['idOrName']
      }
    });
  }
  
  // Security Toolset
  if (isToolsetEnabled('security')) {
    tools.push({
      name: 'get_shadow_it',
      description: 'Get shadow IT applications that have been detected',
      category: 'security',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    });
  }
  
  // Analytics Toolset
  if (isToolsetEnabled('analytics')) {
    tools.push({
      name: 'get_spend_analytics',
      description: 'Get spend analytics data',
      category: 'analytics',
      inputSchema: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            description: 'Time period for analytics (e.g., last12months)'
          }
        },
        required: []
      }
    });
  }
  
  // Recommendations Toolset
  if (isToolsetEnabled('recommendations')) {
    tools.push({
      name: 'get_license_recommendations',
      description: 'Get license optimization recommendations',
      category: 'recommendations',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    });
    
    tools.push({
      name: 'get_renewal_alerts',
      description: 'Get upcoming contract renewal alerts',
      category: 'recommendations',
      inputSchema: {
        type: 'object',
        properties: {
          daysAhead: {
            type: 'number',
            description: 'Number of days ahead to look for renewals'
          }
        },
        required: []
      }
    });
    
    tools.push({
      name: 'find_underutilized_applications',
      description: 'Find applications with low usage rates and calculate potential savings',
      category: 'recommendations',
      inputSchema: {
        type: 'object',
        properties: {
          thresholdPercent: {
            type: 'number',
            description: 'Usage threshold percentage (e.g., 50 for 50%)'
          }
        },
        required: []
      }
    });
  }
  
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  logger.info(`Tool call: ${request.params.name}`);
  logger.debug(`Arguments: ${JSON.stringify(request.params.arguments)}`);
  
  try {
    switch (request.params.name) {
      case 'list_applications': {
        const applications = await productivAPI.getApplications();
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(applications, null, 2) 
          }]
        };
      }
      
      case 'get_application_details': {
        const args = request.params.arguments as Record<string, unknown>;
        const idOrName = args.idOrName as string;
        
        if (!idOrName) {
          throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: idOrName");
        }
        
        // First try to fetch by ID
        try {
          const app = await productivAPI.getApplication(idOrName);
          return {
            content: [{ 
              type: 'text', 
              text: JSON.stringify(app, null, 2) 
            }]
          };
        } catch (error) {
          // If not found by ID, try to find by name
          const applications = await productivAPI.getApplications();
          const app = applications.find(a => 
            a.name.toLowerCase() === idOrName.toLowerCase()
          );
          
          if (!app) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Application not found with ID or name: ${idOrName}`
            );
          }
          
          const appDetails = await productivAPI.getApplication(app.id);
          return {
            content: [{ 
              type: 'text', 
              text: JSON.stringify(appDetails, null, 2) 
            }]
          };
        }
      }
      
      case 'get_application_usage': {
        const args = request.params.arguments as Record<string, unknown>;
        const idOrName = args.idOrName as string;
        const period = (args.period as string) || 'last30days';
        
        if (!idOrName) {
          throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: idOrName");
        }
        
        let appId = idOrName;
        
        // If not an ID, try to find by name
        if (!/^[a-f0-9-]+$/i.test(idOrName)) {
          const applications = await productivAPI.getApplications();
          const app = applications.find(a => 
            a.name.toLowerCase() === idOrName.toLowerCase()
          );
          
          if (!app) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Application not found with name: ${idOrName}`
            );
          }
          
          appId = app.id;
        }
        
        const usage = await productivAPI.getApplicationUsage(appId, period);
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(usage, null, 2) 
          }]
        };
      }
      
      case 'get_contracts': {
        const contracts = await productivAPI.getContracts();
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(contracts, null, 2) 
          }]
        };
      }
      
      case 'get_application_contracts': {
        const args = request.params.arguments as Record<string, unknown>;
        const idOrName = args.idOrName as string;
        
        if (!idOrName) {
          throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: idOrName");
        }
        
        let appId = idOrName;
        
        // If not an ID, try to find by name
        if (!/^[a-f0-9-]+$/i.test(idOrName)) {
          const applications = await productivAPI.getApplications();
          const app = applications.find(a => 
            a.name.toLowerCase() === idOrName.toLowerCase()
          );
          
          if (!app) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Application not found with name: ${idOrName}`
            );
          }
          
          appId = app.id;
        }
        
        const contracts = await productivAPI.getApplicationContracts(appId);
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(contracts, null, 2) 
          }]
        };
      }
      
      case 'get_application_licenses': {
        const args = request.params.arguments as Record<string, unknown>;
        const idOrName = args.idOrName as string;
        
        if (!idOrName) {
          throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: idOrName");
        }
        
        let appId = idOrName;
        
        // If not an ID, try to find by name
        if (!/^[a-f0-9-]+$/i.test(idOrName)) {
          const applications = await productivAPI.getApplications();
          const app = applications.find(a => 
            a.name.toLowerCase() === idOrName.toLowerCase()
          );
          
          if (!app) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Application not found with name: ${idOrName}`
            );
          }
          
          appId = app.id;
        }
        
        const licenses = await productivAPI.getApplicationLicenses(appId);
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(licenses, null, 2) 
          }]
        };
      }
      
      case 'get_shadow_it': {
        const shadowIT = await productivAPI.getShadowIT();
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(shadowIT, null, 2) 
          }]
        };
      }
      
      case 'get_spend_analytics': {
        const args = request.params.arguments as Record<string, unknown>;
        const period = (args.period as string) || 'last12months';
        
        const spendAnalytics = await productivAPI.getSpendAnalytics(period);
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(spendAnalytics, null, 2) 
          }]
        };
      }
      
      case 'get_license_recommendations': {
        const recommendations = await productivAPI.getLicenseRecommendations();
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(recommendations, null, 2) 
          }]
        };
      }
      
      case 'get_renewal_alerts': {
        const args = request.params.arguments as Record<string, unknown>;
        const daysAhead = (args.daysAhead as number) || 90;
        
        const alerts = await productivAPI.getRenewalAlerts(daysAhead);
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(alerts, null, 2) 
          }]
        };
      }
      
      case 'find_underutilized_applications': {
        const args = request.params.arguments as Record<string, unknown>;
        const thresholdPercent = (args.thresholdPercent as number) || 50;
        
        const applications = await productivAPI.getApplications();
        const results = [];
        
        for (const app of applications) {
          try {
            const usage = await productivAPI.getApplicationUsage(app.id);
            const contracts = await productivAPI.getApplicationContracts(app.id);
            
            if (usage.activePercent < thresholdPercent) {
              // Calculate annual cost if contract data is available
              let annualCost = null;
              if (contracts.length > 0) {
                // Find the active contract
                const activeContract = contracts.find(c => c.status === 'active');
                if (activeContract) {
                  // Normalize cost to annual based on payment frequency
                  switch (activeContract.paymentFrequency) {
                    case 'monthly':
                      annualCost = activeContract.amount * 12;
                      break;
                    case 'quarterly':
                      annualCost = activeContract.amount * 4;
                      break;
                    case 'annually':
                      annualCost = activeContract.amount;
                      break;
                    case 'one-time':
                      annualCost = activeContract.amount;
                      break;
                  }
                }
              }
              
              const unusedLicenses = Math.round(app.totalLicenses || 0) - Math.round(usage.activeUsers);
              const potentialSavings = annualCost ? (annualCost / (app.totalLicenses || 1)) * unusedLicenses : null;
              
              results.push({
                applicationName: app.name,
                activeUsersPercent: usage.activePercent,
                totalLicenses: app.totalLicenses || 0,
                unusedLicenses: unusedLicenses > 0 ? unusedLicenses : 0,
                annualCost,
                potentialSavings: potentialSavings && potentialSavings > 0 ? potentialSavings : null
              });
            }
          } catch (error) {
            logger.error(`Error processing application ${app.id}:`, error);
            // Continue with next application
          }
        }
        
        // Sort by potential savings (highest first)
        const sortedResults = results.sort((a, b) => {
          if (a.potentialSavings === null && b.potentialSavings === null) return 0;
          if (a.potentialSavings === null) return 1;
          if (b.potentialSavings === null) return -1;
          return b.potentialSavings - a.potentialSavings;
        });
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(sortedResults, null, 2) 
          }]
        };
      }
      
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${request.params.name}`);
    }
  } catch (error) {
    logger.error(`Tool execution error:`, error);
    if (error instanceof McpError) {
      throw error;
    }
    throw handleApiError(error, `Failed to execute tool: ${request.params.name}`);
  }
});

/**
 * Start the MCP server with the appropriate transport
 */
async function main() {
  logger.info(`Starting ${SERVER_NAME} v${SERVER_VERSION}...`);
  logger.info(`Protocol version: ${protocolVersion}`);
  logger.info(`Enabled toolsets: ${enabledToolsets.join(', ')}`);
  
  try {
    if (enableHttpTransport) {
      logger.info(`Starting HTTP transport on port ${httpPort}`);
      const httpTransport = new StreamableHTTPServerTransport({
        listenOptions: { port: httpPort } // Use the listenOptions key instead of port
      });
      await server.connect(httpTransport);
      logger.info(`HTTP transport started on port ${httpPort}`);
    } else {
      logger.info('Starting stdio transport');
      const stdioTransport = new StdioServerTransport();
      await server.connect(stdioTransport);
      logger.info('Stdio transport started');
    }
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if running directly
if (require.main === module) {
  main().catch(error => {
    logger.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Export for testing and importing
export default server;