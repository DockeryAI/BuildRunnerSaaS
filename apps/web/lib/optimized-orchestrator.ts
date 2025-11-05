/**
 * Optimized Build Orchestrator - Phase 1 Integration
 *
 * Wraps the existing BuildOrchestrator with speed optimizations:
 * - Pattern matching for instant builds
 * - Multi-layer caching (Memory + Redis)
 * - Smart model selection
 * - Async consensus review
 *
 * This is a non-breaking wrapper that enhances the existing orchestrator.
 */

import { PatternMatcher } from './pattern-matcher';
import { CacheManager, getCacheManager } from './cache-manager';
import { SmartConsensus, getSmartConsensus } from './smart-consensus';
import type { BuildComponent } from './build-orchestrator';

// ============================================================================
// Types
// ============================================================================

export interface OptimizedBuildConfig {
  enablePatternMatching: boolean;
  enableCaching: boolean;
  enableSmartConsensus: boolean;
  enableAsyncReview: boolean;
  maxParallelBuilds: number;
}

export interface BuildMetrics {
  totalComponents: number;
  patternMatches: number;
  cacheHits: number;
  generatedComponents: number;
  totalBuildTime: number;
  averageComponentTime: number;
  timeSaved: number; // seconds saved by patterns + cache
}

export interface OptimizedBuildResult {
  components: BuildComponent[];
  metrics: BuildMetrics;
  reviewResults?: any[]; // From async consensus
}

// ============================================================================
// Optimized Orchestrator Class
// ============================================================================

export class OptimizedOrchestrator {
  private patternMatcher: PatternMatcher;
  private cacheManager: CacheManager;
  private smartConsensus: SmartConsensus;
  private config: OptimizedBuildConfig;

  constructor(config?: Partial<OptimizedBuildConfig>) {
    this.config = {
      enablePatternMatching: process.env.PATTERN_MATCHING_ENABLED !== 'false',
      enableCaching: process.env.CACHE_ENABLED !== 'false',
      enableSmartConsensus: process.env.CONSENSUS_ENABLED !== 'false',
      enableAsyncReview: process.env.CONSENSUS_ASYNC !== 'false',
      maxParallelBuilds: parseInt(process.env.MAX_PARALLEL_BUILDS || '3'),
      ...config,
    };

    this.patternMatcher = new PatternMatcher();
    this.cacheManager = getCacheManager();
    this.smartConsensus = getSmartConsensus();

    console.log('⚡ Optimized Orchestrator initialized:');
    console.log(`   Pattern Matching: ${this.config.enablePatternMatching ? '✅' : '❌'}`);
    console.log(`   Caching: ${this.config.enableCaching ? '✅' : '❌'}`);
    console.log(`   Smart Consensus: ${this.config.enableSmartConsensus ? '✅' : '❌'}`);
    console.log(`   Async Review: ${this.config.enableAsyncReview ? '✅' : '❌'}`);
  }

  /**
   * Build components with optimizations
   */
  async buildComponents(
    components: BuildComponent[],
    buildFunction: (component: BuildComponent) => Promise<BuildComponent>
  ): Promise<OptimizedBuildResult> {
    const startTime = Date.now();
    const metrics: BuildMetrics = {
      totalComponents: components.length,
      patternMatches: 0,
      cacheHits: 0,
      generatedComponents: 0,
      totalBuildTime: 0,
      averageComponentTime: 0,
      timeSaved: 0,
    };

    console.log(`\n🚀 Building ${components.length} components with optimizations...`);

    const builtComponents: BuildComponent[] = [];

    // Process each component with optimization layers
    for (const component of components) {
      const componentStartTime = Date.now();
      let builtComponent: BuildComponent;
      let source: 'pattern' | 'cache' | 'generated';

      // Layer 1: Try pattern matching (instant!)
      if (this.config.enablePatternMatching) {
        const patternResult = this.patternMatcher.findPattern(component);

        if (patternResult.matched && patternResult.pattern) {
          console.log(`⚡ Pattern match: ${component.name} (instant!)`);
          builtComponent = this.patternMatcher.instantiatePattern(
            patternResult.pattern,
            component
          );
          metrics.patternMatches++;
          metrics.timeSaved += 5; // ~5 seconds saved per pattern
          source = 'pattern';
          builtComponents.push(builtComponent);
          continue;
        }
      }

      // Layer 2: Try cache (fast!)
      if (this.config.enableCaching) {
        const cached = await this.cacheManager.getCachedComponent(component);

        if (cached) {
          console.log(`💾 Cache hit: ${component.name}`);
          builtComponent = cached.component;
          metrics.cacheHits++;
          metrics.timeSaved += 3; // ~3 seconds saved per cache hit
          source = 'cache';
          builtComponents.push(builtComponent);
          continue;
        }
      }

      // Layer 3: Generate with smart model selection
      console.log(`🔨 Generating: ${component.name}`);

      try {
        // Select best model for this component
        const recommendedModel = this.config.enableSmartConsensus
          ? this.smartConsensus.getRecommendedModel(component)
          : undefined;

        // Call the original build function
        builtComponent = await buildFunction(component);
        metrics.generatedComponents++;
        source = 'generated';

        // Cache the result
        if (this.config.enableCaching && builtComponent.status === 'completed') {
          await this.cacheManager.cacheComponent(builtComponent);
        }

        // Learn from successful builds
        if (builtComponent.status === 'completed' && this.config.enablePatternMatching) {
          await this.patternMatcher.saveAsPattern(builtComponent, {});
        }

        builtComponents.push(builtComponent);
      } catch (error) {
        console.error(`❌ Failed to build ${component.name}:`, error);
        builtComponents.push({
          ...component,
          status: 'failed',
          code: undefined,
        });
      }

      const componentTime = Date.now() - componentStartTime;
      console.log(`   ✓ ${component.name} built in ${componentTime}ms (${source})`);
    }

    // Calculate final metrics
    const totalTime = Date.now() - startTime;
    metrics.totalBuildTime = totalTime;
    metrics.averageComponentTime = totalTime / components.length;

    console.log(`\n📊 Build Complete!`);
    console.log(`   Total time: ${(totalTime / 1000).toFixed(1)}s`);
    console.log(`   Pattern matches: ${metrics.patternMatches}/${metrics.totalComponents} (${Math.round((metrics.patternMatches / metrics.totalComponents) * 100)}%)`);
    console.log(`   Cache hits: ${metrics.cacheHits}/${metrics.totalComponents} (${Math.round((metrics.cacheHits / metrics.totalComponents) * 100)}%)`);
    console.log(`   Generated: ${metrics.generatedComponents}/${metrics.totalComponents}`);
    console.log(`   Time saved: ${metrics.timeSaved}s`);
    console.log(`   Avg per component: ${(metrics.averageComponentTime / 1000).toFixed(1)}s`);

    // Async consensus review (doesn't block return)
    let reviewResults: any[] | undefined;
    if (this.config.enableSmartConsensus) {
      if (this.config.enableAsyncReview) {
        // Fire and forget
        this.smartConsensus.postBuildReview(builtComponents, { async: true });
      } else {
        // Wait for review
        reviewResults = await this.smartConsensus.postBuildReview(builtComponents, { async: false });
      }
    }

    return {
      components: builtComponents,
      metrics,
      reviewResults,
    };
  }

  /**
   * Build single component with optimizations
   */
  async buildComponent(
    component: BuildComponent,
    buildFunction: (component: BuildComponent) => Promise<BuildComponent>
  ): Promise<BuildComponent> {
    const result = await this.buildComponents([component], buildFunction);
    return result.components[0];
  }

  /**
   * Get optimization statistics
   */
  getStats(): {
    patterns: ReturnType<PatternMatcher['getStats']>;
    cache: ReturnType<CacheManager['getStats']>;
    consensus: ReturnType<SmartConsensus['getConfig']>;
  } {
    return {
      patterns: this.patternMatcher.getStats(),
      cache: this.cacheManager.getStats(),
      consensus: this.smartConsensus.getConfig(),
    };
  }

  /**
   * Clear all caches and reset
   */
  async reset(): Promise<void> {
    await this.cacheManager.clearAll();
    console.log('🔄 Optimized orchestrator reset');
  }

  /**
   * Warmup caches with common patterns
   */
  async warmup(components: BuildComponent[]): Promise<void> {
    if (this.config.enableCaching) {
      await this.cacheManager.warmup(components);
    }
  }

  /**
   * Get recommended model for component
   */
  getRecommendedModel(component: BuildComponent): string {
    if (!this.config.enableSmartConsensus) {
      return 'google/gemini-2.5-flash'; // Default fast model
    }

    return this.smartConsensus.getRecommendedModel(component);
  }

  /**
   * Check if component can use patterns or cache
   */
  async canOptimize(component: BuildComponent): Promise<{
    canUsePattern: boolean;
    canUseCache: boolean;
    estimatedTime: number;
  }> {
    const canUsePattern = this.config.enablePatternMatching
      ? this.patternMatcher.findPattern(component).matched
      : false;

    const canUseCache = this.config.enableCaching
      ? await this.cacheManager.isCached(component)
      : false;

    let estimatedTime = 5000; // Default 5 seconds

    if (canUsePattern) {
      estimatedTime = 0; // Instant
    } else if (canUseCache) {
      estimatedTime = 100; // 100ms cache retrieval
    } else if (this.config.enableSmartConsensus) {
      estimatedTime = this.smartConsensus.estimateConsensusTime(component);
    }

    return {
      canUsePattern,
      canUseCache,
      estimatedTime,
    };
  }

  /**
   * Estimate total build time
   */
  async estimateBuildTime(components: BuildComponent[]): Promise<{
    totalTime: number;
    breakdown: {
      instant: number; // Pattern matches
      fast: number; // Cache hits
      normal: number; // Generated
    };
  }> {
    let instant = 0;
    let fast = 0;
    let normal = 0;

    for (const component of components) {
      const optimization = await this.canOptimize(component);

      if (optimization.canUsePattern) {
        instant++;
      } else if (optimization.canUseCache) {
        fast++;
      } else {
        normal++;
      }
    }

    // Estimate times (assuming parallel execution for normal builds)
    const instantTime = 0;
    const fastTime = fast * 0.1; // 100ms each
    const normalTime = Math.ceil(normal / this.config.maxParallelBuilds) * 5; // 5 seconds per wave

    return {
      totalTime: instantTime + fastTime + normalTime,
      breakdown: {
        instant,
        fast,
        normal,
      },
    };
  }

  /**
   * Enable/disable specific optimizations
   */
  configure(config: Partial<OptimizedBuildConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️  Configuration updated:', config);
  }

  /**
   * Get health status
   */
  getHealth(): {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    components: {
      patternMatcher: boolean;
      cache: ReturnType<CacheManager['getHealth']>;
      consensus: boolean;
    };
  } {
    const cacheHealth = this.cacheManager.getHealth();

    const components = {
      patternMatcher: true, // Always healthy (no external dependencies)
      cache: cacheHealth,
      consensus: this.config.enableSmartConsensus,
    };

    const overall = cacheHealth.status === 'healthy'
      ? 'healthy'
      : cacheHealth.status === 'degraded'
        ? 'degraded'
        : 'unhealthy';

    return {
      overall,
      components,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let optimizedOrchestratorInstance: OptimizedOrchestrator | null = null;

export function getOptimizedOrchestrator(): OptimizedOrchestrator {
  if (!optimizedOrchestratorInstance) {
    optimizedOrchestratorInstance = new OptimizedOrchestrator();
  }
  return optimizedOrchestratorInstance;
}

export function resetOptimizedOrchestrator(): void {
  optimizedOrchestratorInstance = null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Wrap existing build function with optimizations
 */
export async function buildWithOptimizations<T extends BuildComponent>(
  components: T[],
  buildFunction: (component: T) => Promise<T>
): Promise<OptimizedBuildResult> {
  const orchestrator = getOptimizedOrchestrator();
  return await orchestrator.buildComponents(
    components as BuildComponent[],
    buildFunction as (component: BuildComponent) => Promise<BuildComponent>
  ) as any;
}

/**
 * Get build estimate before starting
 */
export async function estimateBuild(
  components: BuildComponent[]
): Promise<{
  estimatedTime: number;
  instant: number;
  fast: number;
  normal: number;
}> {
  const orchestrator = getOptimizedOrchestrator();
  const estimate = await orchestrator.estimateBuildTime(components);

  return {
    estimatedTime: estimate.totalTime,
    instant: estimate.breakdown.instant,
    fast: estimate.breakdown.fast,
    normal: estimate.breakdown.normal,
  };
}
