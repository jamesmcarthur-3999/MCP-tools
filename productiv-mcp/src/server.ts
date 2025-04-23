import { McpServer } from '@modelcontextprotocol/sdk-ts/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk-ts/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk-ts/server/streamableHttp.js';
import { z } from 'zod';
import { productivAPI } from './services/api';
import { ErrorCode, McpError, handleApiError } from './utils/error';
import {
  Application,
  ApplicationUsage,
  Contract,
  License,
  ShadowIT,
  SpendAnalytics,
  LicenseRecommendation,
  RenewalAlert
} from './models/types';

// Server configuration
const SERVER_NAME = 'Productiv SaaS Management';
const SERVER_VERSION = '1.0.0';
const DEFAULT_PORT = 3000;

// Environment variables
const enableHttpTransport = process.env.MCP_ENABLE_HTTP_TRANSPORT === 'true';
const httpPort = parseInt(process.env.MCP_HTTP_PORT || DEFAULT_PORT.toString(), 10);
const debugMode = process.env.MCP_DEBUG_MODE === 'true';

// Get enabled toolsets from environment variable
const enabledToolsets = process.env.MCP_ENABLED_TOOLSETS 
  ? process.env.MCP_ENABLED_TOOLSETS.split(',').map(t => t.trim())
  : ['all']; // Default to all toolsets

// Create MCP server instance
const server = new McpServer({ 
  name: SERVER_NAME, 
  version: SERVER_VERSION 
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

// --- TOOL DEFINITIONS ---

// Applications Toolset
if (isToolsetEnabled('applications')) {
  // List all applications
  server.tool('list_applications', {}, async () => {
    try {
      const applications = await productivAPI.getApplications();
      return {
        content: [{ 
          type: 'text', 
          text: JSON.stringify(applications, null, 2) 
        }]
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to list applications');
    }
  }, {
    description: 'Get a list of all applications in the SaaS portfolio',
    category: 'applications'
  });

  // Get application details
  server.tool('get_application_details', {
    idOrName: z.string().describe('Application ID or name')
  }, async ({ idOrName }) => {
    try {
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
            ErrorCode.InvalidInputError,
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
    } catch (error) {
      throw handleApiError(error, `Failed to get application details for ${idOrName}`);
    }
  }, {
    description: 'Get detailed information about a specific application by ID or name',
    category: 'applications'
  });

  // Get application usage
  server.tool('get_application_usage', {
    idOrName: z.string().describe('Application ID or name'),
    period: z.string().optional().describe('Time period for usage data (e.g., last30days, last90days)')
  }, async ({ idOrName, period = 'last30days' }) => {
    try {
      let appId = idOrName;
      
      // If not an ID, try to find by name
      if (!/^[a-f0-9-]+$/i.test(idOrName)) {
        const applications = await productivAPI.getApplications();
        const app = applications.find(a => 
          a.name.toLowerCase() === idOrName.toLowerCase()
        );
        
        if (!app) {
          throw new McpError(
            ErrorCode.InvalidInputError,
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
    } catch (error) {
      throw handleApiError(error, `Failed to get application usage for ${idOrName}`);
    }
  }, {
    description: 'Get usage analytics for an application, including active users and feature usage',
    category: 'applications'
  });
}

// Contracts Toolset
if (isToolsetEnabled('contracts')) {
  // Get all contracts
  server.tool('get_contracts', {}, async () => {
    try {
      const contracts = await productivAPI.getContracts();
      return {
        content: [{ 
          type: 'text', 
          text: JSON.stringify(contracts, null, 2) 
        }]
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to get contracts');
    }
  }, {
    description: 'Get a list of all contracts',
    category: 'contracts'
  });

  // Get contracts for an application
  server.tool('get_application_contracts', {
    idOrName: z.string().describe('Application ID or name')
  }, async ({ idOrName }) => {
    try {
      let appId = idOrName;
      
      // If not an ID, try to find by name
      if (!/^[a-f0-9-]+$/i.test(idOrName)) {
        const applications = await productivAPI.getApplications();
        const app = applications.find(a => 
          a.name.toLowerCase() === idOrName.toLowerCase()
        );
        
        if (!app) {
          throw new McpError(
            ErrorCode.InvalidInputError,
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
    } catch (error) {
      throw handleApiError(error, `Failed to get contracts for application ${idOrName}`);
    }
  }, {
    description: 'Get contracts for a specific application',
    category: 'contracts'
  });
}

// Licenses Toolset
if (isToolsetEnabled('licenses')) {
  // Get licenses for an application
  server.tool('get_application_licenses', {
    idOrName: z.string().describe('Application ID or name')
  }, async ({ idOrName }) => {
    try {
      let appId = idOrName;
      
      // If not an ID, try to find by name
      if (!/^[a-f0-9-]+$/i.test(idOrName)) {
        const applications = await productivAPI.getApplications();
        const app = applications.find(a => 
          a.name.toLowerCase() === idOrName.toLowerCase()
        );
        
        if (!app) {
          throw new McpError(
            ErrorCode.InvalidInputError,
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
    } catch (error) {
      throw handleApiError(error, `Failed to get licenses for application ${idOrName}`);
    }
  }, {
    description: 'Get licenses for a specific application',
    category: 'licenses'
  });
}

// Security Toolset
if (isToolsetEnabled('security')) {
  // Get shadow IT applications
  server.tool('get_shadow_it', {}, async () => {
    try {
      const shadowIT = await productivAPI.getShadowIT();
      return {
        content: [{ 
          type: 'text', 
          text: JSON.stringify(shadowIT, null, 2) 
        }]
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to get shadow IT');
    }
  }, {
    description: 'Get shadow IT applications that have been detected',
    category: 'security'
  });
}

// Analytics Toolset
if (isToolsetEnabled('analytics')) {
  // Get spend analytics
  server.tool('get_spend_analytics', {
    period: z.string().optional().describe('Time period for analytics (e.g., last12months)')
  }, async ({ period = 'last12months' }) => {
    try {
      const spendAnalytics = await productivAPI.getSpendAnalytics(period);
      return {
        content: [{ 
          type: 'text', 
          text: JSON.stringify(spendAnalytics, null, 2) 
        }]
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to get spend analytics');
    }
  }, {
    description: 'Get spend analytics data',
    category: 'analytics'
  });
}

// Recommendations Toolset
if (isToolsetEnabled('recommendations')) {
  // Get license optimization recommendations
  server.tool('get_license_recommendations', {}, async () => {
    try {
      const recommendations = await productivAPI.getLicenseRecommendations();
      return {
        content: [{ 
          type: 'text', 
          text: JSON.stringify(recommendations, null, 2) 
        }]
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to get license recommendations');
    }
  }, {
    description: 'Get license optimization recommendations',
    category: 'recommendations'
  });

  // Get upcoming renewal alerts
  server.tool('get_renewal_alerts', {
    daysAhead: z.number().optional().describe('Number of days ahead to look for renewals')
  }, async ({ daysAhead = 90 }) => {
    try {
      const alerts = await productivAPI.getRenewalAlerts(daysAhead);
      return {
        content: [{ 
          type: 'text', 
          text: JSON.stringify(alerts, null, 2) 
        }]
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to get renewal alerts');
    }
  }, {
    description: 'Get upcoming contract renewal alerts',
    category: 'recommendations'
  });

  // Find underutilized applications
  server.tool('find_underutilized_applications', {
    thresholdPercent: z.number().optional().describe('Usage threshold percentage (e.g., 50 for 50%)')
  }, async ({ thresholdPercent = 50 }) => {
    try {
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
    } catch (error) {
      throw handleApiError(error, 'Failed to find underutilized applications');
    }
  }, {
    description: 'Find applications with low usage rates and calculate potential savings',
    category: 'recommendations'
  });
}

/**
 * Start the MCP server with the appropriate transport
 */
async function main() {
  logger.info(`Starting ${SERVER_NAME} v${SERVER_VERSION}...`);
  logger.info(`Enabled toolsets: ${enabledToolsets.join(', ')}`);
  
  try {
    if (enableHttpTransport) {
      logger.info(`Starting HTTP transport on port ${httpPort}`);
      const httpTransport = new StreamableHTTPServerTransport({
        port: httpPort
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
