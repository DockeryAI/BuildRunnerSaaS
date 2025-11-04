/**
 * Cache Manager - Multi-Layer Caching for Build Components
 *
 * Provides:
 * - Memory cache (instant access)
 * - Redis cache (fast, persistent)
 * - Deterministic cache keys
 * - TTL management
 * - Cache statistics
 */

import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import type { BuildComponent } from './build-orchestrator';

// ============================================================================
// Types
// ============================================================================

export interface CacheConfig {
  memoryEnabled: boolean;
  redisEnabled: boolean;
  defaultTTL: number; // seconds
  maxMemoryItems: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number; // 0.0 - 1.0
  memoryHits: number;
  redisHits: number;
  totalKeys: number;
}

export interface CachedComponent {
  component: BuildComponent;
  cachedAt: string;
  ttl: number;
  source: 'memory' | 'redis' | 'pattern';
}

// ============================================================================
// Cache Manager Class
// ============================================================================

export class CacheManager {
  private redis: Redis | null = null;
  private memoryCache: Map<string, CachedComponent>;
  private config: CacheConfig;
  private stats: CacheStats;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      memoryEnabled: true,
      redisEnabled: !!process.env.UPSTASH_REDIS_REST_URL,
      defaultTTL: 604800, // 1 week
      maxMemoryItems: 100,
      ...config,
    };

    this.memoryCache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      memoryHits: 0,
      redisHits: 0,
      totalKeys: 0,
    };

    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  private initializeRedis(): void {
    if (!this.config.redisEnabled) {
      console.log('📦 Cache: Memory-only mode (Redis disabled)');
      return;
    }

    try {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      console.log('📦 Cache: Redis initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      this.config.redisEnabled = false;
    }
  }

  /**
   * Get cached component
   */
  async getCachedComponent(component: BuildComponent): Promise<CachedComponent | null> {
    const key = this.generateCacheKey(component);

    // Check memory first (fastest)
    if (this.config.memoryEnabled && this.memoryCache.has(key)) {
      const cached = this.memoryCache.get(key)!;

      // Check if expired
      if (!this.isExpired(cached)) {
        this.stats.hits++;
        this.stats.memoryHits++;
        this.updateHitRate();
        console.log(`✅ Cache HIT (memory): ${component.name}`);
        return cached;
      } else {
        // Remove expired entry
        this.memoryCache.delete(key);
      }
    }

    // Check Redis (fast)
    if (this.config.redisEnabled && this.redis) {
      try {
        const cached = await this.redis.get<CachedComponent>(key);

        if (cached && !this.isExpired(cached)) {
          // Store in memory for future hits
          if (this.config.memoryEnabled) {
            this.addToMemoryCache(key, cached);
          }

          this.stats.hits++;
          this.stats.redisHits++;
          this.updateHitRate();
          console.log(`✅ Cache HIT (redis): ${component.name}`);
          return cached;
        }
      } catch (error) {
        console.error('❌ Redis get error:', error);
      }
    }

    // Cache miss
    this.stats.misses++;
    this.updateHitRate();
    console.log(`❌ Cache MISS: ${component.name}`);
    return null;
  }

  /**
   * Cache a component
   */
  async cacheComponent(
    component: BuildComponent,
    ttl?: number
  ): Promise<void> {
    const key = this.generateCacheKey(component);
    const cached: CachedComponent = {
      component,
      cachedAt: new Date().toISOString(),
      ttl: ttl || this.config.defaultTTL,
      source: 'pattern',
    };

    // Save to memory
    if (this.config.memoryEnabled) {
      this.addToMemoryCache(key, cached);
    }

    // Save to Redis
    if (this.config.redisEnabled && this.redis) {
      try {
        await this.redis.set(key, cached, {
          ex: cached.ttl,
        });
        console.log(`💾 Cached: ${component.name} (TTL: ${cached.ttl}s)`);
      } catch (error) {
        console.error('❌ Redis set error:', error);
      }
    }

    this.stats.totalKeys++;
  }

  /**
   * Add to memory cache with LRU eviction
   */
  private addToMemoryCache(key: string, cached: CachedComponent): void {
    // If at capacity, remove oldest entry
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    this.memoryCache.set(key, cached);
  }

  /**
   * Generate deterministic cache key
   */
  private generateCacheKey(component: BuildComponent): string {
    // Create key from component definition
    const keyData = {
      type: component.type,
      name: component.name,
      description: component.description || '',
      dependencies: component.dependencies?.sort() || [],
      // Include version to bust cache when needed
      version: process.env.CACHE_VERSION || '1.0',
    };

    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(keyData))
      .digest('hex');

    return `buildrunner:component:${hash}`;
  }

  /**
   * Check if cached item is expired
   */
  private isExpired(cached: CachedComponent): boolean {
    const cachedTime = new Date(cached.cachedAt).getTime();
    const now = Date.now();
    const ageSeconds = (now - cachedTime) / 1000;

    return ageSeconds > cached.ttl;
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & {
    memorySize: number;
    memoryLimit: number;
    redisEnabled: boolean;
  } {
    return {
      ...this.stats,
      memorySize: this.memoryCache.size,
      memoryLimit: this.config.maxMemoryItems,
      redisEnabled: this.config.redisEnabled,
    };
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    // Clear memory
    this.memoryCache.clear();

    // Clear Redis (only our keys)
    if (this.config.redisEnabled && this.redis) {
      try {
        // Get all our keys
        const keys = await this.redis.keys('buildrunner:component:*');

        // Delete in batches
        if (keys.length > 0) {
          await Promise.all(
            keys.map(key => this.redis!.del(key))
          );
        }

        console.log(`🗑️  Cleared ${keys.length} keys from cache`);
      } catch (error) {
        console.error('❌ Redis clear error:', error);
      }
    }

    // Reset stats
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      memoryHits: 0,
      redisHits: 0,
      totalKeys: 0,
    };
  }

  /**
   * Clear expired entries
   */
  async clearExpired(): Promise<number> {
    let clearedCount = 0;

    // Clear expired from memory
    for (const [key, cached] of this.memoryCache.entries()) {
      if (this.isExpired(cached)) {
        this.memoryCache.delete(key);
        clearedCount++;
      }
    }

    console.log(`🗑️  Cleared ${clearedCount} expired entries from memory`);
    return clearedCount;
  }

  /**
   * Warm up cache with common components
   */
  async warmup(components: BuildComponent[]): Promise<void> {
    console.log(`🔥 Warming up cache with ${components.length} components...`);

    await Promise.all(
      components.map(comp => this.cacheComponent(comp))
    );

    console.log(`✅ Cache warmed up`);
  }

  /**
   * Get cache key for inspection
   */
  getCacheKey(component: BuildComponent): string {
    return this.generateCacheKey(component);
  }

  /**
   * Check if component is cached (without retrieving)
   */
  async isCached(component: BuildComponent): Promise<boolean> {
    const key = this.generateCacheKey(component);

    // Check memory
    if (this.config.memoryEnabled && this.memoryCache.has(key)) {
      const cached = this.memoryCache.get(key)!;
      if (!this.isExpired(cached)) {
        return true;
      }
    }

    // Check Redis
    if (this.config.redisEnabled && this.redis) {
      try {
        const exists = await this.redis.exists(key);
        return exists === 1;
      } catch (error) {
        console.error('❌ Redis exists error:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * Get multiple cached components at once
   */
  async getCachedComponents(
    components: BuildComponent[]
  ): Promise<Map<string, CachedComponent | null>> {
    const results = new Map<string, CachedComponent | null>();

    await Promise.all(
      components.map(async (comp) => {
        const cached = await this.getCachedComponent(comp);
        results.set(comp.id, cached);
      })
    );

    return results;
  }

  /**
   * Invalidate specific component cache
   */
  async invalidate(component: BuildComponent): Promise<void> {
    const key = this.generateCacheKey(component);

    // Remove from memory
    this.memoryCache.delete(key);

    // Remove from Redis
    if (this.config.redisEnabled && this.redis) {
      try {
        await this.redis.del(key);
        console.log(`🗑️  Invalidated cache: ${component.name}`);
      } catch (error) {
        console.error('❌ Redis del error:', error);
      }
    }
  }

  /**
   * Set custom TTL for specific component types
   */
  async cacheWithCustomTTL(
    component: BuildComponent,
    customTTL: number
  ): Promise<void> {
    await this.cacheComponent(component, customTTL);
  }

  /**
   * Get cache health status
   */
  getHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
      memory: boolean;
      redis: boolean;
      hitRate: number;
    };
  } {
    const memoryOk = this.config.memoryEnabled && this.memoryCache.size < this.config.maxMemoryItems;
    const redisOk = !this.config.redisEnabled || (this.redis !== null);
    const hitRateOk = this.stats.hitRate > 0.3; // 30% threshold

    const allOk = memoryOk && redisOk && (this.stats.hits + this.stats.misses < 10 || hitRateOk);

    return {
      status: allOk ? 'healthy' : (memoryOk && redisOk ? 'degraded' : 'unhealthy'),
      checks: {
        memory: memoryOk,
        redis: redisOk,
        hitRate: this.stats.hitRate,
      },
    };
  }

  /**
   * Export cache for backup
   */
  async exportCache(): Promise<CachedComponent[]> {
    const exported: CachedComponent[] = [];

    // Export from memory
    for (const cached of this.memoryCache.values()) {
      if (!this.isExpired(cached)) {
        exported.push(cached);
      }
    }

    console.log(`📤 Exported ${exported.length} cached components`);
    return exported;
  }

  /**
   * Import cache from backup
   */
  async importCache(components: CachedComponent[]): Promise<void> {
    console.log(`📥 Importing ${components.length} cached components...`);

    for (const cached of components) {
      if (!this.isExpired(cached)) {
        const key = this.generateCacheKey(cached.component);

        // Import to memory
        if (this.config.memoryEnabled) {
          this.addToMemoryCache(key, cached);
        }

        // Import to Redis
        if (this.config.redisEnabled && this.redis) {
          try {
            const remainingTTL = cached.ttl - Math.floor(
              (Date.now() - new Date(cached.cachedAt).getTime()) / 1000
            );

            if (remainingTTL > 0) {
              await this.redis.set(key, cached, { ex: remainingTTL });
            }
          } catch (error) {
            console.error('❌ Redis import error:', error);
          }
        }
      }
    }

    console.log(`✅ Cache imported`);
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getCacheSize(): { memory: number; redis: string } {
    let memoryBytes = 0;

    for (const cached of this.memoryCache.values()) {
      memoryBytes += JSON.stringify(cached).length;
    }

    return {
      memory: memoryBytes,
      redis: this.config.redisEnabled ? 'Check Redis dashboard' : 'Disabled',
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let cacheInstance: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!cacheInstance) {
    cacheInstance = new CacheManager();
  }
  return cacheInstance;
}

export function resetCacheManager(): void {
  cacheInstance = null;
}
