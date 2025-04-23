import axios, { AxiosInstance, AxiosResponse } from 'axios';
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
import { cache, DEFAULT_CACHE_TTL } from '../utils/cache';

dotenv.config();

/**
 * Service for interacting with the Productiv API
 */
export class ProductivAPI {
  private client: AxiosInstance;
  private readonly logger: Console;

  constructor() {
    const apiKey = process.env.PRODUCTIV_API_KEY;
    const apiUrl = process.env.PRODUCTIV_API_URL || 'https://api.productiv.com';

    if (!apiKey) {
      console.error('[Config] Missing PRODUCTIV_API_KEY environment variable');
      throw new Error('Productiv API key is required');
    }

    this.logger = console;
    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Set up request interceptor for logging
    this.client.interceptors.request.use(config => {
      this.logger.info(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Set up response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          this.logger.error(
            `[API] Error ${error.response.status}: ${error.response.statusText}`,
            error.response.data
          );
        } else if (error.request) {
          this.logger.error('[API] No response received', error.request);
        } else {
          this.logger.error('[API] Request error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get all applications in the SaaS portfolio
   */
  async getApplications(): Promise<Application[]> {
    const cacheKey = 'applications';
    const cachedData = cache.get<Application[]>(cacheKey);
    
    if (cachedData) {
      this.logger.info('[Cache] Using cached applications data');
      return cachedData;
    }

    try {
      this.logger.info('[API] Fetching applications');
      const response: AxiosResponse<{ applications: Application[] }> = await this.client.get('/v1/applications');
      
      // Cache the response
      cache.set(cacheKey, response.data.applications, DEFAULT_CACHE_TTL.APPLICATIONS);
      
      return response.data.applications;
    } catch (error) {
      this.logger.error('[API] Error fetching applications:', error);
      throw error;
    }
  }

  /**
   * Get a specific application by ID
   */
  async getApplication(id: string): Promise<Application> {
    const cacheKey = `application:${id}`;
    const cachedData = cache.get<Application>(cacheKey);
    
    if (cachedData) {
      this.logger.info(`[Cache] Using cached data for application ${id}`);
      return cachedData;
    }

    try {
      this.logger.info(`[API] Fetching application ${id}`);
      const response: AxiosResponse<{ application: Application }> = await this.client.get(`/v1/applications/${id}`);
      
      // Cache the response
      cache.set(cacheKey, response.data.application, DEFAULT_CACHE_TTL.APPLICATION_DETAILS);
      
      return response.data.application;
    } catch (error) {
      this.logger.error(`[API] Error fetching application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get usage data for an application
   */
  async getApplicationUsage(id: string, period: string = 'last30days'): Promise<ApplicationUsage> {
    const cacheKey = `application:${id}:usage:${period}`;
    const cachedData = cache.get<ApplicationUsage>(cacheKey);
    
    if (cachedData) {
      this.logger.info(`[Cache] Using cached usage data for application ${id}`);
      return cachedData;
    }

    try {
      this.logger.info(`[API] Fetching usage for application ${id}`);
      const response: AxiosResponse<{ usage: ApplicationUsage }> = await this.client.get(
        `/v1/applications/${id}/usage`, 
        { params: { period } }
      );
      
      // Cache the response
      cache.set(cacheKey, response.data.usage, DEFAULT_CACHE_TTL.APPLICATION_USAGE);
      
      return response.data.usage;
    } catch (error) {
      this.logger.error(`[API] Error fetching usage for application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all contracts
   */
  async getContracts(): Promise<Contract[]> {
    const cacheKey = 'contracts';
    const cachedData = cache.get<Contract[]>(cacheKey);
    
    if (cachedData) {
      this.logger.info('[Cache] Using cached contracts data');
      return cachedData;
    }

    try {
      this.logger.info('[API] Fetching contracts');
      const response: AxiosResponse<{ contracts: Contract[] }> = await this.client.get('/v1/contracts');
      
      // Cache the response
      cache.set(cacheKey, response.data.contracts, DEFAULT_CACHE_TTL.CONTRACTS);
      
      return response.data.contracts;
    } catch (error) {
      this.logger.error('[API] Error fetching contracts:', error);
      throw error;
    }
  }

  /**
   * Get contracts for a specific application
   */
  async getApplicationContracts(applicationId: string): Promise<Contract[]> {
    const cacheKey = `application:${applicationId}:contracts`;
    const cachedData = cache.get<Contract[]>(cacheKey);
    
    if (cachedData) {
      this.logger.info(`[Cache] Using cached contracts data for application ${applicationId}`);
      return cachedData;
    }

    try {
      this.logger.info(`[API] Fetching contracts for application ${applicationId}`);
      const response: AxiosResponse<{ contracts: Contract[] }> = await this.client.get(
        `/v1/applications/${applicationId}/contracts`
      );
      
      // Cache the response
      cache.set(cacheKey, response.data.contracts, DEFAULT_CACHE_TTL.CONTRACTS);
      
      return response.data.contracts;
    } catch (error) {
      this.logger.error(`[API] Error fetching contracts for application ${applicationId}:`, error);
      throw error;
    }
  }

  /**
   * Get licenses for an application
   */
  async getApplicationLicenses(applicationId: string): Promise<License[]> {
    const cacheKey = `application:${applicationId}:licenses`;
    const cachedData = cache.get<License[]>(cacheKey);
    
    if (cachedData) {
      this.logger.info(`[Cache] Using cached licenses data for application ${applicationId}`);
      return cachedData;
    }

    try {
      this.logger.info(`[API] Fetching licenses for application ${applicationId}`);
      const response: AxiosResponse<{ licenses: License[] }> = await this.client.get(
        `/v1/applications/${applicationId}/licenses`
      );
      
      // Cache the response
      cache.set(cacheKey, response.data.licenses, DEFAULT_CACHE_TTL.LICENSES);
      
      return response.data.licenses;
    } catch (error) {
      this.logger.error(`[API] Error fetching licenses for application ${applicationId}:`, error);
      throw error;
    }
  }

  /**
   * Get users
   */
  async getUsers(): Promise<User[]> {
    const cacheKey = 'users';
    const cachedData = cache.get<User[]>(cacheKey);
    
    if (cachedData) {
      this.logger.info('[Cache] Using cached users data');
      return cachedData;
    }

    try {
      this.logger.info('[API] Fetching users');
      const response: AxiosResponse<{ users: User[] }> = await this.client.get('/v1/users');
      
      // Cache the response
      cache.set(cacheKey, response.data.users, DEFAULT_CACHE_TTL.APPLICATIONS);
      
      return response.data.users;
    } catch (error) {
      this.logger.error('[API] Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get shadow IT applications
   */
  async getShadowIT(): Promise<ShadowIT[]> {
    const cacheKey = 'shadow-it';
    const cachedData = cache.get<ShadowIT[]>(cacheKey);
    
    if (cachedData) {
      this.logger.info('[Cache] Using cached shadow IT data');
      return cachedData;
    }

    try {
      this.logger.info('[API] Fetching shadow IT');
      const response: AxiosResponse<{ applications: ShadowIT[] }> = await this.client.get('/v1/shadow-it');
      
      // Cache the response
      cache.set(cacheKey, response.data.applications, DEFAULT_CACHE_TTL.SHADOW_IT);
      
      return response.data.applications;
    } catch (error) {
      this.logger.error('[API] Error fetching shadow IT:', error);
      throw error;
    }
  }

  /**
   * Get spend analytics
   */
  async getSpendAnalytics(period: string = 'last12months'): Promise<SpendAnalytics> {
    const cacheKey = `spend-analytics:${period}`;
    const cachedData = cache.get<SpendAnalytics>(cacheKey);
    
    if (cachedData) {
      this.logger.info('[Cache] Using cached spend analytics data');
      return cachedData;
    }

    try {
      this.logger.info('[API] Fetching spend analytics');
      const response: AxiosResponse<{ spend: SpendAnalytics }> = await this.client.get(
        '/v1/analytics/spend',
        { params: { period } }
      );
      
      // Cache the response
      cache.set(cacheKey, response.data.spend, DEFAULT_CACHE_TTL.SPEND_ANALYTICS);
      
      return response.data.spend;
    } catch (error) {
      this.logger.error('[API] Error fetching spend analytics:', error);
      throw error;
    }
  }

  /**
   * Get license optimization recommendations
   */
  async getLicenseRecommendations(): Promise<LicenseRecommendation[]> {
    const cacheKey = 'license-recommendations';
    const cachedData = cache.get<LicenseRecommendation[]>(cacheKey);
    
    if (cachedData) {
      this.logger.info('[Cache] Using cached license recommendations data');
      return cachedData;
    }

    try {
      this.logger.info('[API] Fetching license recommendations');
      const response: AxiosResponse<{ recommendations: LicenseRecommendation[] }> = await this.client.get(
        '/v1/recommendations/licenses'
      );
      
      // Cache the response
      cache.set(cacheKey, response.data.recommendations, DEFAULT_CACHE_TTL.RECOMMENDATIONS);
      
      return response.data.recommendations;
    } catch (error) {
      this.logger.error('[API] Error fetching license recommendations:', error);
      throw error;
    }
  }

  /**
   * Get upcoming renewal alerts
   */
  async getRenewalAlerts(daysAhead: number = 90): Promise<RenewalAlert[]> {
    const cacheKey = `renewal-alerts:${daysAhead}`;
    const cachedData = cache.get<RenewalAlert[]>(cacheKey);
    
    if (cachedData) {
      this.logger.info('[Cache] Using cached renewal alerts data');
      return cachedData;
    }

    try {
      this.logger.info('[API] Fetching renewal alerts');
      const response: AxiosResponse<{ alerts: RenewalAlert[] }> = await this.client.get(
        '/v1/alerts/renewals',
        { params: { daysAhead } }
      );
      
      // Cache the response
      cache.set(cacheKey, response.data.alerts, DEFAULT_CACHE_TTL.RENEWAL_ALERTS);
      
      return response.data.alerts;
    } catch (error) {
      this.logger.error('[API] Error fetching renewal alerts:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const productivAPI = new ProductivAPI();
