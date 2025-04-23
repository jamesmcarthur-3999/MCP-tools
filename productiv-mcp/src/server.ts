import { FastMCP } from '@modelcontextprotocol/sdk-ts';
import { productivAPI } from './services/api';
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

// Create an MCP server
const mcp = new FastMCP('Productiv SaaS Management');

/**
 * Get all applications in the SaaS portfolio
 */
async function listApplications(): Promise<Application[]> {
  try {
    return await productivAPI.getApplications();
  } catch (error) {
    console.error('Error listing applications:', error);
    throw new Error(`Failed to list applications: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get application details by ID or name
 */
async function getApplicationDetails(idOrName: string): Promise<Application> {
  try {
    // First try to fetch by ID
    try {
      return await productivAPI.getApplication(idOrName);
    } catch (error) {
      // If not found by ID, try to find by name
      const applications = await productivAPI.getApplications();
      const app = applications.find(app => app.name.toLowerCase() === idOrName.toLowerCase());
      
      if (!app) {
        throw new Error(`Application not found with ID or name: ${idOrName}`);
      }
      
      return await productivAPI.getApplication(app.id);
    }
  } catch (error) {
    console.error(`Error getting application details for ${idOrName}:`, error);
    throw new Error(`Failed to get application details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get usage data for an application
 */
async function getApplicationUsage(idOrName: string, period: string = 'last30days'): Promise<ApplicationUsage> {
  try {
    let appId = idOrName;
    
    // If not an ID, try to find by name
    if (!/^[a-f0-9-]+$/i.test(idOrName)) {
      const applications = await productivAPI.getApplications();
      const app = applications.find(app => app.name.toLowerCase() === idOrName.toLowerCase());
      
      if (!app) {
        throw new Error(`Application not found with name: ${idOrName}`);
      }
      
      appId = app.id;
    }
    
    return await productivAPI.getApplicationUsage(appId, period);
  } catch (error) {
    console.error(`Error getting usage for application ${idOrName}:`, error);
    throw new Error(`Failed to get application usage: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get contracts for an application
 */
async function getApplicationContracts(idOrName: string): Promise<Contract[]> {
  try {
    let appId = idOrName;
    
    // If not an ID, try to find by name
    if (!/^[a-f0-9-]+$/i.test(idOrName)) {
      const applications = await productivAPI.getApplications();
      const app = applications.find(app => app.name.toLowerCase() === idOrName.toLowerCase());
      
      if (!app) {
        throw new Error(`Application not found with name: ${idOrName}`);
      }
      
      appId = app.id;
    }
    
    return await productivAPI.getApplicationContracts(appId);
  } catch (error) {
    console.error(`Error getting contracts for application ${idOrName}:`, error);
    throw new Error(`Failed to get application contracts: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get licenses for an application
 */
async function getApplicationLicenses(idOrName: string): Promise<License[]> {
  try {
    let appId = idOrName;
    
    // If not an ID, try to find by name
    if (!/^[a-f0-9-]+$/i.test(idOrName)) {
      const applications = await productivAPI.getApplications();
      const app = applications.find(app => app.name.toLowerCase() === idOrName.toLowerCase());
      
      if (!app) {
        throw new Error(`Application not found with name: ${idOrName}`);
      }
      
      appId = app.id;
    }
    
    return await productivAPI.getApplicationLicenses(appId);
  } catch (error) {
    console.error(`Error getting licenses for application ${idOrName}:`, error);
    throw new Error(`Failed to get application licenses: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get shadow IT applications
 */
async function getShadowIT(): Promise<ShadowIT[]> {
  try {
    return await productivAPI.getShadowIT();
  } catch (error) {
    console.error('Error getting shadow IT:', error);
    throw new Error(`Failed to get shadow IT: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get spend analytics
 */
async function getSpendAnalytics(period: string = 'last12months'): Promise<SpendAnalytics> {
  try {
    return await productivAPI.getSpendAnalytics(period);
  } catch (error) {
    console.error('Error getting spend analytics:', error);
    throw new Error(`Failed to get spend analytics: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get license optimization recommendations
 */
async function getLicenseRecommendations(): Promise<LicenseRecommendation[]> {
  try {
    return await productivAPI.getLicenseRecommendations();
  } catch (error) {
    console.error('Error getting license recommendations:', error);
    throw new Error(`Failed to get license recommendations: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get upcoming renewal alerts
 */
async function getRenewalAlerts(daysAhead: number = 90): Promise<RenewalAlert[]> {
  try {
    return await productivAPI.getRenewalAlerts(daysAhead);
  } catch (error) {
    console.error('Error getting renewal alerts:', error);
    throw new Error(`Failed to get renewal alerts: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Find underutilized applications
 */
async function findUnderutilizedApplications(thresholdPercent: number = 50): Promise<{
  applicationName: string;
  activeUsersPercent: number;
  totalLicenses: number;
  unusedLicenses: number;
  annualCost: number | null;
  potentialSavings: number | null;
}[]> {
  try {
    const applications = await productivAPI.getApplications();
    const results = [];
    
    for (const app of applications) {
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
    }
    
    // Sort by potential savings (highest first)
    return results.sort((a, b) => {
      if (a.potentialSavings === null && b.potentialSavings === null) return 0;
      if (a.potentialSavings === null) return 1;
      if (b.potentialSavings === null) return -1;
      return b.potentialSavings - a.potentialSavings;
    });
  } catch (error) {
    console.error('Error finding underutilized applications:', error);
    throw new Error(`Failed to find underutilized applications: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Register tools with the MCP server
mcp.tool('list_applications', listApplications);
mcp.tool('get_application_details', getApplicationDetails);
mcp.tool('get_application_usage', getApplicationUsage);
mcp.tool('get_application_contracts', getApplicationContracts);
mcp.tool('get_application_licenses', getApplicationLicenses);
mcp.tool('get_shadow_it', getShadowIT);
mcp.tool('get_spend_analytics', getSpendAnalytics);
mcp.tool('get_license_recommendations', getLicenseRecommendations);
mcp.tool('get_renewal_alerts', getRenewalAlerts);
mcp.tool('find_underutilized_applications', findUnderutilizedApplications);

// Start the MCP server
if (require.main === module) {
  mcp.run();
}

export default mcp;
