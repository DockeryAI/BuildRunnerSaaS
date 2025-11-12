/**
 * Circuit Breaker Pattern Implementation
 *
 * Protects against cascading failures by monitoring persistent session health.
 * Automatically degrades to per-task sessions when failure rate exceeds threshold.
 *
 * States:
 * - CLOSED: Normal operation, persistent sessions enabled
 * - OPEN: Too many failures, persistent sessions disabled
 * - HALF_OPEN: Testing if system recovered, trying one persistent session
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening circuit
  successThreshold: number;       // Number of successes to close circuit from half-open
  timeout: number;                // Time (ms) before attempting half-open from open
  windowSize: number;             // Size of sliding window for failure rate calculation
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  totalAttempts: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  circuitOpenedAt?: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private successCount: number = 0;
  private consecutiveFailures: number = 0;
  private consecutiveSuccesses: number = 0;
  private totalAttempts: number = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private circuitOpenedAt?: number;
  private config: CircuitBreakerConfig;

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = {
      failureThreshold: 3,          // Open circuit after 3 consecutive failures
      successThreshold: 2,           // Close circuit after 2 consecutive successes in half-open
      timeout: 30000,                // Wait 30s before trying half-open
      windowSize: 10,                // Track last 10 attempts
      ...config
    };
  }

  /**
   * Check if circuit allows operation
   */
  canAttempt(): boolean {
    if (this.state === 'CLOSED') {
      return true;
    }

    if (this.state === 'OPEN') {
      // Check if timeout has passed to move to half-open
      if (this.circuitOpenedAt && Date.now() - this.circuitOpenedAt >= this.config.timeout) {
        this.setState('HALF_OPEN');
        return true;
      }
      return false; // Still open, reject attempt
    }

    if (this.state === 'HALF_OPEN') {
      // Allow one attempt in half-open state
      return true;
    }

    return false;
  }

  /**
   * Record successful operation
   */
  recordSuccess(): void {
    this.totalAttempts++;
    this.successCount++;
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;
    this.lastSuccessTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Check if we've had enough successes to close circuit
      if (this.consecutiveSuccesses >= this.config.successThreshold) {
        this.setState('CLOSED');
        this.reset();
      }
    } else if (this.state === 'CLOSED') {
      // Normal operation - reset failure count on success
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  /**
   * Record failed operation
   */
  recordFailure(error?: Error): void {
    this.totalAttempts++;
    this.failureCount++;
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = Date.now();

    if (this.state === 'CLOSED') {
      // Check if we've exceeded failure threshold
      if (this.consecutiveFailures >= this.config.failureThreshold) {
        this.setState('OPEN');
        this.circuitOpenedAt = Date.now();
      }
    } else if (this.state === 'HALF_OPEN') {
      // Failed in half-open, go back to open
      this.setState('OPEN');
      this.circuitOpenedAt = Date.now();
    }
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    // Keep totalAttempts for metrics
  }

  /**
   * Manually open circuit (disable feature)
   */
  open(): void {
    this.setState('OPEN');
    this.circuitOpenedAt = Date.now();
  }

  /**
   * Manually close circuit (enable feature)
   */
  close(): void {
    this.setState('CLOSED');
    this.reset();
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Check if circuit is healthy (closed or recovering)
   */
  isHealthy(): boolean {
    return this.state === 'CLOSED' || this.state === 'HALF_OPEN';
  }

  /**
   * Get circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      totalAttempts: this.totalAttempts,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      circuitOpenedAt: this.circuitOpenedAt
    };
  }

  /**
   * Get failure rate (percentage)
   */
  getFailureRate(): number {
    if (this.totalAttempts === 0) return 0;
    return (this.failureCount / this.totalAttempts) * 100;
  }

  /**
   * Internal: Update state and notify
   */
  private setState(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    // Log state change for monitoring
    if (oldState !== newState) {
      console.log(`[CircuitBreaker] State transition: ${oldState} → ${newState}`);
    }
  }
}
