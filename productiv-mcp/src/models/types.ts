/**
 * Types for Productiv API responses
 */

export interface Application {
  id: string;
  name: string;
  description?: string;
  category?: string;
  vendor?: string;
  website?: string;
  status: 'active' | 'inactive' | 'pending';
  spendStatus?: 'paid' | 'free' | 'trial';
  totalLicenses?: number;
  usedLicenses?: number;
  contactEmail?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationUsage {
  id: string;
  applicationId: string;
  totalUsers: number;
  activeUsers: number;
  activePercent: number;
  inactiveUsers: number;
  period: string;
  features?: FeatureUsage[];
}

export interface FeatureUsage {
  name: string;
  description?: string;
  usageCount: number;
  activeUsers: number;
}

export interface Contract {
  id: string;
  applicationId: string;
  name: string;
  status: 'active' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  renewalDate?: string;
  autoRenewal: boolean;
  cancellationNoticeDays?: number;
  amount: number;
  currency: string;
  paymentFrequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  licensesIncluded?: number;
  contactEmail?: string;
  notes?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface License {
  id: string;
  applicationId: string;
  userId: string;
  email: string;
  licenseType: string;
  status: 'active' | 'inactive' | 'pending';
  assignedAt: string;
  lastUsedAt?: string;
  usageFrequency?: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  title?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ShadowIT {
  id: string;
  name: string;
  discoverySource: 'expense' | 'auth_logs' | 'browser_extension' | 'network_scan';
  discoveredAt: string;
  users: number;
  riskLevel: 'low' | 'medium' | 'high';
  category?: string;
  similarApps?: string[];
}

export interface SpendAnalytics {
  totalSpend: number;
  currency: string;
  period: string;
  breakdown: {
    byCategory: Record<string, number>;
    byDepartment: Record<string, number>;
    byVendor: Record<string, number>;
  };
  trending: {
    previousPeriod: number;
    percentChange: number;
  };
}

export interface LicenseRecommendation {
  applicationId: string;
  applicationName: string;
  currentLicenses: number;
  recommendedLicenses: number;
  potentialSavings: number;
  currency: string;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface RenewalAlert {
  id: string;
  applicationId: string;
  applicationName: string;
  contractId: string;
  renewalDate: string;
  daysUntilRenewal: number;
  annualAmount: number;
  currency: string;
  recommendations?: string[];
}
