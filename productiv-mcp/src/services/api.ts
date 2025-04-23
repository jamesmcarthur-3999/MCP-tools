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
      throw new Error('Productiv API key is required');
    }

    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get all applications in the SaaS portfolio
   */
  async getApplications(): Promise<Application[]> {
    try {
      const response: AxiosResponse<{ applications: Application[] }> = await this.client.get('/v1/applications');
      return response.data.applications;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  /**
   * Get a specific application by ID
   */
  async getApplication(id: string): Promise<Application> {
    try {
      const response: AxiosResponse<{ application: Application }> = await this.client.get(`/v1/applications/${id}`);
      return response.data.application;
    } catch (error) {
      console.error(`Error fetching application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get usage data for an application
   */
  async getApplicationUsage(id: string, period: string = 'last30days'): Promise<ApplicationUsage> {
    try {
      const response: AxiosResponse<{ usage: ApplicationUsage }> = await this.client.get(`/v1/applications/${id}/usage`, {
        params: { period }
      });
      return response.data.usage;
    } catch (error) {
      console.error(`Error fetching usage for application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all contracts
   */
  async getContracts(): Promise<Contract[]> {
    try {
      const response: AxiosResponse<{ contracts: Contract[] }> = await this.client.get('/v1/contracts');
      return response.data.contracts;
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  /**
   * Get contracts for a specific application
   */
  async getApplicationContracts(applicationId: string): Promise<Contract[]> {
    try {
      const response: AxiosResponse<{ contracts: Contract[] }> = await this.client.get(`/v1/applications/${applicationId}/contracts`);
      return response.data.contracts;
    } catch (error) {
      console.error(`Error fetching contracts for application ${applicationId}:`, error);
      throw error;
    }
  }

  /**
   * Get licenses for an application
   */
  async getApplicationLicenses(applicationId: string): Promise<License[]> {
    try {
      const response: AxiosResponse<{ licenses: License[] }> = await this.client.get(`/v1/applications/${applicationId}/licenses`);
      return response.data.licenses;
    } catch (error) {
      console.error(`Error fetching licenses for application ${applicationId}:`, error);
      throw error;
    }
  }

  /**
   * Get users
   */
  async getUsers(): Promise<User[]> {
    try {
      const response: AxiosResponse<{ users: User[] }> = await this.client.get('/v1/users');
      return response.data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get shadow IT applications
   */
  async getShadowIT(): Promise<ShadowIT[]> {
    try {
      const response: AxiosResponse<{ applications: ShadowIT[] }> = await this.client.get('/v1/shadow-it');
      return response.data.applications;
    } catch (error) {
      console.error('Error fetching shadow IT:', error);
      throw error;
    }
  }

  /**
   * Get spend analytics
   */
  async getSpendAnalytics(period: string = 'last12months'): Promise<SpendAnalytics> {
    try {
      const response: AxiosResponse<{ spend: SpendAnalytics }> = await this.client.get('/v1/analytics/spend', {
        params: { period }
      });
      return response.data.spend;
    } catch (error) {
      console.error('Error fetching spend analytics:', error);
      throw error;
    }
  }

  /**
   * Get license optimization recommendations
   */
  async getLicenseRecommendations(): Promise<LicenseRecommendation[]> {
    try {
      const response: AxiosResponse<{ recommendations: LicenseRecommendation[] }> = await this.client.get('/v1/recommendations/licenses');
      return response.data.recommendations;
    } catch (error) {
      console.error('Error fetching license recommendations:', error);
      throw error;
    }
  }

  /**
   * Get upcoming renewal alerts
   */
  async getRenewalAlerts(daysAhead: number = 90): Promise<RenewalAlert[]> {
    try {
      const response: AxiosResponse<{ alerts: RenewalAlert[] }> = await this.client.get('/v1/alerts/renewals', {
        params: { daysAhead }
      });
      return response.data.alerts;
    } catch (error) {
      console.error('Error fetching renewal alerts:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const productivAPI = new ProductivAPI();
