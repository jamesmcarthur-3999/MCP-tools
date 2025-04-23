import NodeCache from 'node-cache';

// Default cache TTL in seconds
export const DEFAULT_CACHE_TTL = {
  APPLICATIONS: 60 * 10, // 10 minutes
  APPLICATION_DETAILS: 60 * 10, // 10 minutes
  APPLICATION_USAGE: 60 * 5, // 5 minutes
  CONTRACTS: 60 * 30, // 30 minutes
  LICENSES: 60 * 15, // 15 minutes
  USERS: 60 * 30, // 30 minutes
  SHADOW_IT: 60 * 60, // 1 hour
  SPEND_ANALYTICS: 60 * 60, // 1 hour
  LICENSE_RECOMMENDATIONS: 60 * 30, // 30 minutes
  RENEWAL_ALERTS: 60 * 30, // 30 minutes
};

/**
 * Cache service for the Productiv API
 */
export class CacheService {
  private cache: NodeCache;

  constructor(ttlSeconds = 3600) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: Math.floor(ttlSeconds / 2),
      useClones: false,
    });
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value) {
      console.error(`[Cache] Cache hit for key: ${key}`);
    } else {
      console.error(`[Cache] Cache miss for key: ${key}`);
    }
    return value;
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    console.error(`[Cache] Setting cache for key: ${key}`);
    return this.cache.set(key, value, ttl);
  }

  /**
   * Delete a value from the cache
   */
  del(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.flushAll();
  }

  /**
   * Get a cached function that will cache the result of the wrapped function
   * 
   * @param fn The function to cache
   * @param keyPrefix A prefix for the cache key
   * @param ttl Time-to-live in seconds
   * @returns A function that will cache its result
   */
  cacheify<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    keyPrefix: string,
    ttl: number
  ): (...args: Args) => Promise<T> {
    return async (...args: Args): Promise<T> => {
      const key = `${keyPrefix}:${JSON.stringify(args)}`;
      const cached = this.get<T>(key);
      
      if (cached !== undefined) {
        return cached;
      }
      
      const result = await fn(...args);
      this.set(key, result, ttl);
      return result;
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();
