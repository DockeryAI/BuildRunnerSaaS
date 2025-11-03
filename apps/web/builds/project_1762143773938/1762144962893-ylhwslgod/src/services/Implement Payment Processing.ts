```typescript
/**
 * @fileoverview Payment processing service to handle payment transactions
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a payment transaction
 */
export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING', 
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

/**
 * Payment processing options
 */
export interface PaymentOptions {
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

/**
 * Custom error class for payment errors
 */
export class PaymentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PaymentError';
  }
}

/**
 * Payment processing service
 */
export class PaymentService {
  private transactions: Map<string, PaymentTransaction>;

  constructor() {
    this.transactions = new Map();
  }

  /**
   * Process a payment
   * @param options Payment processing options
   * @returns Promise resolving to the payment transaction
   * @throws {PaymentError} If payment processing fails
   */
  public async processPayment(options: PaymentOptions): Promise<PaymentTransaction> {
    try {
      this.validatePaymentOptions(options);

      const transaction: PaymentTransaction = {
        id: uuidv4(),
        amount: options.amount,
        currency: options.currency.toUpperCase(),
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: options.metadata
      };

      // Simulate payment processing
      await this.simulatePaymentProcessing(transaction);

      transaction.status = PaymentStatus.COMPLETED;
      transaction.updatedAt = new Date();

      this.transactions.set(transaction.id, transaction);

      return transaction;
    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }
      throw new PaymentError('Payment processing failed', 'PAYMENT_FAILED');
    }
  }

  /**
   * Get transaction by ID
   * @param id Transaction ID
   * @returns Payment transaction or null if not found
   */
  public getTransaction(id: string): PaymentTransaction | null {
    return this.transactions.get(id) || null;
  }

  /**
   * Refund a payment transaction
   * @param id Transaction ID
   * @returns Promise resolving to the refunded transaction
   * @throws {PaymentError} If refund fails
   */
  public async refundPayment(id: string): Promise<PaymentTransaction> {
    const transaction = this.getTransaction(id);

    if (!transaction) {
      throw new PaymentError('Transaction not found', 'TRANSACTION_NOT_FOUND');
    }

    if (transaction.status !== PaymentStatus.COMPLETED) {
      throw new PaymentError('Transaction cannot be refunded', 'INVALID_REFUND');
    }

    try {
      await this.simulateRefundProcessing(transaction);

      transaction.status = PaymentStatus.REFUNDED;
      transaction.updatedAt = new Date();

      this.transactions.set(transaction.id, transaction);

      return transaction;
    } catch (error) {
      throw new PaymentError('Refund processing failed', 'REFUND_FAILED');
    }
  }

  /**
   * Validate payment options
   * @param options Payment options to validate
   * @throws {PaymentError} If validation fails
   */
  private validatePaymentOptions(options: PaymentOptions): void {
    if (!options.amount || options.amount <= 0) {
      throw new PaymentError('Invalid payment amount', 'INVALID_AMOUNT');
    }

    if (!options.currency || options.currency.length !== 3) {
      throw new PaymentError('Invalid currency code', 'INVALID_CURRENCY');
    }
  }

  /**
   * Simulate payment processing delay
   * @param transaction Payment transaction
   * @returns Promise that resolves when processing is complete
   */
  private async simulatePaymentProcessing(transaction: PaymentTransaction): Promise<void> {
    transaction.status = PaymentStatus.PROCESSING;
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random failures
        if (Math.random() < 0.1) {
          reject(new PaymentError('Payment provider error', 'PROVIDER_ERROR'));
        }
        resolve();
      }, 1000);
    });
  }

  /**
   * Simulate refund processing delay
   * @param transaction Payment transaction
   * @returns Promise that resolves when refund is complete
   */
  private async simulateRefundProcessing(transaction: PaymentTransaction): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }
}

export default PaymentService;
```