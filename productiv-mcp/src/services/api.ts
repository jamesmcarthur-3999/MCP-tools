import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import * as dotenv from 'dotenv';
import {
  Application,
  ApplicationUsage,
  Contract,
  License,
  User,
  ShadowIT,
  SpendAnalytics,
  LicenseRecommendation,
  RenewalAlert
} from '../models/types';
import { cacheService, DEFAULT_CACHE_TTL } from './cache';
import { McpError, ErrorCode, Errors } from '../utils/errors';

dotenv.config();

/**
 * Service for interacting with the Productiv API
 */
export class ProductivAPI {
  private client: AxiosInstance;

  constructor() {
    const apiKey = process.env.PRODUCTIV_API_KEY;
    const apiUrl = process.env.PRODUCTIV_API_URL || 'https://api.productiv.com';

    if (!apiKey) {
      console.error('[Config] Missing PRODUCTIV_API_KEY environment variable');
      throw new Error('Productiv API key is required');
    }

    // Log API configuration
    console.error('[Setup] Initializing Productiv API client');
    console.error(`[Setup] API URL: ${apiUrl}`);
    console.error('[Setup] API Key: ********' + (apiKey.length > 8 ? apiKey.slice(-4) : '****'));

    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      response => {
        console.error(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      error => {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          console.error(
            `[API Error] ${axiosError.config?.method?.toUpperCase()} ${axiosError.config?.url} - ${axiosError.response?.status} ${axiosError.response?.statusText}`
          );
          
          // Handle rate limiting
          if (axiosError.response?.status === 429) {
            const resetHeader = axiosError.response.headers['x-rate-limit-reset'];
            const resetTime = resetHeader ? parseInt(resetHeader, 10) : undefined;
            throw Errors.rateLimitExceeded(60, resetTime);
          }
          
          // Handle authentication errors
          if (axiosError.response?.status === 401) {
            throw Errors.unauthorized('Invalid API key or unauthorized access');
          }
          
          // Handle not found
          if (axiosError.response?.status === 404) {
            throw Errors.notFound('Resource', axiosError.config?.url || 'unknown');
          }
        }
        
        throw error;
      }
    );

    // Cache-enable API methods
    this.getApplications = cacheService.cacheify(
      this._getApplications.bind(this),
      'applications',
      DEFAULT_CACHE_TTL.APPLICATIONS
    );
    
    this.getApplication = cacheService.cacheify(
      this._getApplication.bind(this),
      'application',
      DEFAULT_CACHE_TTL.APPLICATION_DETAILS
    );
    
    this.getApplicationUsage = cacheService.cacheify(
      this._getApplicationUsage.bind(this),
      'applicationUsage',
      DEFAULT_CACHE_TTL.APPLICATION_USAGE
    );
    
    this.getContracts = cacheService.cacheify(
      this._getContracts.bind(this),
      'contracts',
      DEFAULT_CACHE_TTL.CONTRACTS
    );
    
    this.getApplicationContracts = cacheService.cacheify(
      this._getApplicationContracts.bind(this),
      'applicationContracts',
      DEFAULT_CACHE_TTL.CONTRACTS
    );
    
    this.getApplicationLicenses = cacheService.cacheify(
      this._getApplicationLicenses.bind(this),
      'applicationLicenses',
      DEFAULT_CACHE_TTL.LICENSES
    );
    
    this.getUsers = cacheService.cacheify(
      this._getUsers.bind(this),
      'users',
      DEFAULT_CACHE_TTL.USERS
    );
    
    this.getShadowIT = cacheService.cacheify(
      this._getShadowIT.bind(this),
      'shadowIT',
      DEFAULT_CACHE_TTL.SHADOW_IT
    );
    
    this.getSpendAnalytics = cacheService.cacheify(
      this._getSpendAnalytics.bind(this),
      'spendAnalytics',
      DEFAULT_CACHE_TTL.SPEND_ANALYTICS
    );
    
    this.getLicenseRecommendations = cacheService.cacheify(
      this._getLicenseRecommendations.bind(this),
      'licenseRecommendations',
      DEFAULT_CACHE_TTL.LICENSE_RECOMMENDATIONS
    );
    
    this.getRenewalAlerts = cacheService.cacheify(
      this._getRenewalAlerts.bind(this),
      'renewalAlerts',
      DEFAULT_CACHE_TTL.RENEWAL_ALERTS
    );
  }

  /**
   * Get all applications in the SaaS portfolio
   * This will be wrapped by the cacheify method
   */
  private async _getApplications(): Promise<Application[]> {
    try {
      console.error('[API] Fetching all applications');
      const response: AxiosResponse<{ applications: Application[] }> = await this.client.get('/v1/applications');
      return response.data.applications;
    } catch (error) {
      console.error('[API] Error fetching applications:', error);
      throw Errors.serverError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get a specific application by ID
   * This will be wrapped by the cacheify method
   */
  private async _getApplication(id: string): Promise<Application> {
    try {
      console.error(`[API] Fetching application with ID: ${id}`);
      const response: AxiosResponse<{ application: Application }> = await this.client.get(`/v1/applications/${id}`);
      return response.data.application;
    } catch (error) {
      console.error(`[API] Error fetching application ${id}:`, error);
      
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw Errors.notFound('Application', id);
      }
      
      throw Errors.serverError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get usage data for an application
   * This will be wrapped by the cacheify method
   */
  private async _getApplicationUsage(id: string, period: string = 'last30days'): Promise<ApplicationUsage> {
    try {
      console.error(`[API] Fetching usage for application ${id} (period: ${period})`);
      const response: AxiosResponse<{ usage: ApplicationUsage }> = await this.client.get(`/v1/applications/${id}/usage`, {
        params: { period }
      });
      return response.data.usage;
    } catch (error) {
      console.error(`[API] Error fetching usage for application ${id}:`, error);
      
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw Errors.notFound('Application', id);
      }
      
      throw Errors.serverError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get all contracts
   * This will be wrapped by the cacheify method
   */
  private async _getContracts(): Promise<Contract[]> {
    try {
      console.error('[API] Fetching all contracts');
      const response: AxiosResponse<{ contracts: Contract[] }> = await this.client.get('/v1/contracts');
      return response.data.contracts;
    } catch (error) {
      console.error('[API] Error fetching contracts:', error);
      throw Errors.serverError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get contracts for a specific application
   * This will be wrapped by the cacheify method
   */
  private async _getApplicationContracts(applicationId: string): Promise<Contract[]> {
    try {
      console.error(`[API] Fetching contracts for application ${applicationId}`);
      const response: AxiosResponse<{ contracts: Contract[] }> = await this.client.get(`/v1/applications/${applicationId}/contracts`);
      return response.data.contracts;
    } catch (error) {
      console.error(`[API] Error fetching contracts for application ${applicationId}:`, error);
      
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw Errors.notFound('Application', applicationId);
      }
      
      throw Errors.serverError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get licenses for an application
   * This will be wrapped by the cacheify method
   */
  private async _getApplicationLicenses(applicationId: string): Promise<License[]> {
    try {
      console.error(`[API] Fetching licenses for application ${applicationId}`);
      const response: AxiosResponse<{ licenses: License[] }> = await this.client.get(`/v1/applications/${applicationId}/licenses`);
      return response.data.licenses;
    } catch (error) {
      console.error(`[API] Error fetching licenses for application ${applicationId}:`, error);
      
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw Errors.notFound('Application', applicationId);
      }
      
      throw Errors.serverError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get users
   * This will be wrapped by the cacheify method
   */
  private async _getUsers(): Promise<User[]> {
    try {
      console.error('[API] Fetching all users');
      const response: AxiosResponse<{ users: User[] }> = await this.client.get('/v1/users');
      return response.data.users;
    } catch (error) {
      console.error('[API] Error fetching users:', error);
      throw Errors.serverError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get shadow IT applications
   * This will be wrapped by the cacheify method
   */
  private async _getShadowIT(): Promise<ShadowIT[]> {
    try {
      console.error('[API] Fetching shadow IT applications');
      const response: AxiosResponse<{ applications: ShadowIT[] }> = await this.client.get('/v1/shadow-it');
      return response.data.applications;
    } catch (error) {
      console.error('[API] Error fetching shadow IT:', error);
      throw Errors.serverError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get spend analytics
   * This will be wrapped by the cacheify method
   */
  private async _getSpendAnalytics(period: string = 'last12months'): Promise<SpendAnalytics> {
    try {
      console.error(`[API] Fetching spend analytics (period: ${period})`);
      const response: AxiosResponse<{ spend: SpendAnalytics }> = await this.client.get('/v1/analytics/spend', {
        params: { period }
      });
      return response.data.spend;
    } catch (error) {
      console.error('[API] Error fetching spend analytics:', error);
      throw Errors.serverError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get license optimization recommendations
   * This will be wrapped by the cacheify method
   */
  private async _getLicenseRecommendations(): Promise<LicenseRecommendation[]> {
    try {
      console.error('[API] Fetching license recommendations');
      const response: AxiosResponse<{ recommendations: LicenseRecommendation[] }> = await this.client.get('/v1/recommendations/licenses');
      return response.data.recommendations;
    } catch (error) {
      console.error('[API] Error fetching license recommendations:', error);
      throw Errors.serverError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get upcoming renewal alerts
   * This will be wrapped by the cacheify method
   */
  private async _getRenewalAlerts(daysAhead: number = 90): Promise<RenewalAlert[]> {
    try {
      console.error(`[API] Fetching renewal alerts (days ahead: ${daysAhead})`);
      const response: AxiosResponse<{ alerts: RenewalAlert[] }> = await this.client.get('/v1/alerts/renewals', {
        params: { daysAhead }
      });
      return response.data.alerts;
    } catch (error) {
      console.error('[API] Error fetching renewal alerts:', error);
      throw Errors.serverError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Public API methods are automatically cached through cacheify wrapper
  getApplications!: () => Promise<Application[]>;
  getApplication!: (id: string) => Promise<Application>;
  getApplicationUsage!: (id: string, period?: string) => Promise<ApplicationUsage>;
  getContracts!: () => Promise<Contract[]>;
  getApplicationContracts!: (applicationId: string) => Promise<Contract[]>;
  getApplicationLicenses!: (applicationId: string) => Promise<License[]>;
  getUsers!: () => Promise<User[]>;
  getShadowIT!: () => Promise<ShadowIT[]>;
  getSpendAnalytics!: (period?: string) => Promise<SpendAnalytics>;
  getLicenseRecommendations!: () => Promise<LicenseRecommendation[]>;
  getRenewalAlerts!: (daysAhead?: number) => Promise<RenewalAlert[]>;

  /**
   * Clear the API cache
   */
  clearCache(): void {
    console.error('[Cache] Clearing all cached API responses');
    cacheService.clear();
  }
}

// Export singleton instance
export const productivAPI = new ProductivAPI();
