import EventEmitter from 'events';

export interface ParallelBuildOptions {
  maxConcurrency?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class ParallelBuilder extends EventEmitter {
  private maxConcurrency: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(options: ParallelBuildOptions = {}) {
    super();
    this.maxConcurrency = options.maxConcurrency || 5;
    this.retryAttempts = options.retryAttempts || 2;
    this.retryDelay = options.retryDelay || 1000;
  }

  /**
   * Build components in parallel batches
   */
  async buildInParallel<T>(
    batches: T[][],
    buildFn: (item: T) => Promise<void>
  ): Promise<void> {
    this.emit('parallel:started', {
      totalBatches: batches.length,
      totalComponents: batches.reduce((sum, batch) => sum + batch.length, 0),
    });

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      this.emit('batch:started', {
        batchIndex: i,
        batchSize: batch.length,
        totalBatches: batches.length,
      });

      // Build all items in this batch in parallel (up to max concurrency)
      await this.buildBatchWithConcurrency(batch, buildFn);

      this.emit('batch:completed', {
        batchIndex: i,
        batchSize: batch.length,
      });
    }

    this.emit('parallel:completed', {
      totalBatches: batches.length,
    });
  }

  /**
   * Build a batch with concurrency limit
   */
  private async buildBatchWithConcurrency<T>(
    batch: T[],
    buildFn: (item: T) => Promise<void>
  ): Promise<void> {
    const results: Promise<void>[] = [];

    for (const item of batch) {
      // Limit concurrent builds
      if (results.length >= this.maxConcurrency) {
        await Promise.race(results);
        results.splice(
          results.findIndex(p => p === undefined),
          1
        );
      }

      const promise = this.buildWithRetry(item, buildFn);
      results.push(promise);
    }

    // Wait for remaining builds
    await Promise.all(results);
  }

  /**
   * Build a single item with retry logic
   */
  private async buildWithRetry<T>(
    item: T,
    buildFn: (item: T) => Promise<void>
  ): Promise<void> {
    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        await buildFn(item);
        return; // Success
      } catch (error) {
        const isLastAttempt = attempt === this.retryAttempts;

        this.emit('build:error', {
          item,
          attempt: attempt + 1,
          maxAttempts: this.retryAttempts + 1,
          error,
          willRetry: !isLastAttempt,
        });

        if (isLastAttempt) {
          throw error; // Give up
        }

        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Build with rate limiting (for API calls)
   */
  async buildWithRateLimit<T>(
    items: T[],
    buildFn: (item: T) => Promise<void>,
    rateLimit: { requests: number; perMs: number }
  ): Promise<void> {
    const { requests, perMs } = rateLimit;
    const chunks: T[][] = [];

    // Split into chunks based on rate limit
    for (let i = 0; i < items.length; i += requests) {
      chunks.push(items.slice(i, i + requests));
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const startTime = Date.now();

      // Build chunk in parallel
      await Promise.all(chunk.map(item => this.buildWithRetry(item, buildFn)));

      // Rate limit delay
      if (i < chunks.length - 1) {
        const elapsed = Date.now() - startTime;
        const waitTime = Math.max(0, perMs - elapsed);
        if (waitTime > 0) {
          await this.sleep(waitTime);
        }
      }
    }
  }
}
