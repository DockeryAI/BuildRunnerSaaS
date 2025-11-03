```typescript
/**
 * @fileoverview Stripe service for handling payments and payment methods
 */

import Stripe from 'stripe';
import { StripeError } from 'stripe';

/**
 * Configuration interface for Stripe service
 */
interface StripeConfig {
  secretKey: string;
  apiVersion?: string;
}

/**
 * Payment intent creation parameters
 */
interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  customerId?: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, string>;
}

/**
 * Service class for interacting with Stripe API
 */
export class StripeService {
  private stripe: Stripe;

  /**
   * Creates an instance of StripeService
   * @param config - Stripe configuration options
   */
  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: config.apiVersion || '2023-10-16',
    });
  }

  /**
   * Creates a new customer in Stripe
   * @param email - Customer email
   * @param metadata - Additional customer metadata
   * @returns Stripe customer object
   * @throws {StripeError}
   */
  public async createCustomer(email: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email,
        metadata
      });
    } catch (error) {
      if (error instanceof StripeError) {
        throw new Error(`Failed to create customer: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Creates a payment intent
   * @param params - Payment intent parameters
   * @returns Stripe payment intent object
   * @throws {StripeError}
   */
  public async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency,
        customer: params.customerId,
        payment_method: params.paymentMethodId,
        description: params.description,
        metadata: params.metadata,
        confirmation_method: 'manual',
        confirm: false
      });
    } catch (error) {
      if (error instanceof StripeError) {
        throw new Error(`Failed to create payment intent: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Confirms a payment intent
   * @param paymentIntentId - ID of the payment intent to confirm
   * @returns Confirmed payment intent
   * @throws {StripeError}
   */
  public async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      if (error instanceof StripeError) {
        throw new Error(`Failed to confirm payment intent: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Attaches a payment method to a customer
   * @param paymentMethodId - ID of the payment method
   * @param customerId - ID of the customer
   * @returns Attached payment method
   * @throws {StripeError}
   */
  public async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      if (error instanceof StripeError) {
        throw new Error(`Failed to attach payment method: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Lists payment methods for a customer
   * @param customerId - ID of the customer
   * @param type - Type of payment method
   * @returns Array of payment methods
   * @throws {StripeError}
   */
  public async listPaymentMethods(customerId: string, type: Stripe.PaymentMethod.Type): Promise<Stripe.PaymentMethod[]> {
    try {
      const result = await this.stripe.paymentMethods.list({
        customer: customerId,
        type
      });
      return result.data;
    } catch (error) {
      if (error instanceof StripeError) {
        throw new Error(`Failed to list payment methods: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Retrieves a payment intent by ID
   * @param paymentIntentId - ID of the payment intent
   * @returns Payment intent object
   * @throws {StripeError}
   */
  public async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      if (error instanceof StripeError) {
        throw new Error(`Failed to retrieve payment intent: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Creates a refund for a payment intent
   * @param paymentIntentId - ID of the payment intent to refund
   * @param amount - Amount to refund (in cents)
   * @returns Refund object
   * @throws {StripeError}
   */
  public async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    try {
      return await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount
      });
    } catch (error) {
      if (error instanceof StripeError) {
        throw new Error(`Failed to create refund: ${error.message}`);
      }
      throw error;
    }
  }
}
```