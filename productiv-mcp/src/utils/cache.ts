/**
 * Simple in-memory cache implementation with TTL support
 */
export class Cache {
  private cache: Map<string, { data: any; expires: number }> = new Map();

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }

    // Check if item has expired
    if (item.expires < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return item.data as T;
  }

  /**
   * Set a value in the cache with expiration
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in seconds
   */
  set(key: string, data: any, ttl: number): void {
    const expires = Date.now() + ttl * 1000;
    this.cache.set(key, { data, expires });
  }

  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Remove all expired items from the cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expires < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current cache size
   * @returns The number of items in the cache
   */
  size(): number {
    return this.cache.size;
  }
}

// Export a singleton instance for app-wide use
export const cache = new Cache();

// Default cache TTL values in seconds
export const DEFAULT_CACHE_TTL = {
  APPLICATIONS: 60 * 5, // 5 minutes
  APPLICATION_DETAILS: 60 * 5, // 5 minutes
  APPLICATION_USAGE: 60 * 5, // 5 minutes
  CONTRACTS: 60 * 15, // 15 minutes
  LICENSES: 60 * 15, // 15 minutes
  SHADOW_IT: 60 * 30, // 30 minutes
  SPEND_ANALYTICS: 60 * 60, // 1 hour
  RECOMMENDATIONS: 60 * 60, // 1 hour
  RENEWAL_ALERTS: 60 * 30, // 30 minutes
};
