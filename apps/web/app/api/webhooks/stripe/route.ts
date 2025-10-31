import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';
import BillingManager from '../../../../lib/billing/billing';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    // Validate webhook signature
    if (!validateSignature(body, signature)) {
      return NextResponse.json({
        error: 'Invalid signature',
      }, { status: 401 });
    }

    const event = JSON.parse(body);
    
    console.log(`Processing Stripe webhook: ${event.type}`);

    // Process different webhook events
    switch (event.type) {
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object);
        break;
      case 'subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.created':
        await handleInvoiceCreated(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      default:
        console.log(`Unhandled Stripe webhook event: ${event.type}`);
    }

    // Log webhook event
    await supabase
      .from('runner_events')
      .insert([{
        actor: 'stripe-webhook',
        action: 'stripe_webhook_received',
        payload: {
          event_type: event.type,
          event_id: event.id,
          object_id: event.data.object.id,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          stripe_event_created: event.created,
        },
      }]);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[STRIPE_WEBHOOK] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Handle customer created event
 */
async function handleCustomerCreated(customer: any) {
  try {
    const { org_id, billing_account_id } = customer.metadata || {};
    
    if (billing_account_id) {
      await BillingManager.updateBillingAccount(billing_account_id, {
        stripeCustomerId: customer.id,
        billingEmail: customer.email,
      });
    }

    console.log(`Customer created: ${customer.id}`);
  } catch (error) {
    console.error('Failed to handle customer created:', error);
  }
}

/**
 * Handle customer updated event
 */
async function handleCustomerUpdated(customer: any) {
  try {
    // Find billing account by Stripe customer ID
    const { data: billingAccount } = await supabase
      .from('billing_accounts')
      .select('*')
      .eq('stripe_customer_id', customer.id)
      .single();

    if (billingAccount) {
      await BillingManager.updateBillingAccount(billingAccount.id, {
        billingEmail: customer.email,
      });
    }

    console.log(`Customer updated: ${customer.id}`);
  } catch (error) {
    console.error('Failed to handle customer updated:', error);
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription: any) {
  try {
    // Find billing account by Stripe customer ID
    const { data: billingAccount } = await supabase
      .from('billing_accounts')
      .select('*')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (billingAccount) {
      // Determine plan from price ID
      const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
      
      // Create subscription record
      await BillingManager.createSubscription(
        billingAccount.id,
        plan,
        subscription.id,
        subscription.items.data[0].price.id
      );

      // Update billing account
      await BillingManager.updateBillingAccount(billingAccount.id, {
        plan,
        status: 'active',
        renewalDate: new Date(subscription.current_period_end * 1000).toISOString(),
      });

      // Log billing event
      await supabase
        .from('billing_events')
        .insert([{
          billing_account_id: billingAccount.id,
          event_type: 'subscription_created',
          stripe_event_id: subscription.id,
          actor: 'stripe',
          description: `Subscription created for ${plan} plan`,
          new_values: { plan, subscription_id: subscription.id },
        }]);
    }

    console.log(`Subscription created: ${subscription.id}`);
  } catch (error) {
    console.error('Failed to handle subscription created:', error);
  }
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: any) {
  try {
    // Find subscription by Stripe subscription ID
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*, billing_accounts(*)')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (existingSubscription) {
      const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
      
      // Update subscription
      await supabase
        .from('subscriptions')
        .update({
          plan,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          cancelled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        })
        .eq('id', existingSubscription.id);

      // Update billing account
      await BillingManager.updateBillingAccount(existingSubscription.billing_account_id, {
        plan,
        renewalDate: new Date(subscription.current_period_end * 1000).toISOString(),
      });

      // Log billing event
      await supabase
        .from('billing_events')
        .insert([{
          billing_account_id: existingSubscription.billing_account_id,
          event_type: 'subscription_updated',
          stripe_event_id: subscription.id,
          actor: 'stripe',
          description: `Subscription updated to ${plan} plan`,
          old_values: { plan: existingSubscription.plan },
          new_values: { plan },
        }]);
    }

    console.log(`Subscription updated: ${subscription.id}`);
  } catch (error) {
    console.error('Failed to handle subscription updated:', error);
  }
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: any) {
  try {
    // Find subscription by Stripe subscription ID
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (existingSubscription) {
      // Deactivate subscription
      await supabase
        .from('subscriptions')
        .update({
          active: false,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id);

      // Update billing account to free plan
      await BillingManager.updateBillingAccount(existingSubscription.billing_account_id, {
        plan: 'free',
        status: 'active',
      });

      // Log billing event
      await supabase
        .from('billing_events')
        .insert([{
          billing_account_id: existingSubscription.billing_account_id,
          event_type: 'subscription_cancelled',
          stripe_event_id: subscription.id,
          actor: 'stripe',
          description: 'Subscription cancelled, reverted to free plan',
          old_values: { plan: existingSubscription.plan },
          new_values: { plan: 'free' },
        }]);
    }

    console.log(`Subscription deleted: ${subscription.id}`);
  } catch (error) {
    console.error('Failed to handle subscription deleted:', error);
  }
}

/**
 * Handle invoice created event
 */
async function handleInvoiceCreated(invoice: any) {
  try {
    // Find billing account by Stripe customer ID
    const { data: billingAccount } = await supabase
      .from('billing_accounts')
      .select('*')
      .eq('stripe_customer_id', invoice.customer)
      .single();

    if (billingAccount) {
      // Create invoice record
      await supabase
        .from('invoices')
        .insert([{
          billing_account_id: billingAccount.id,
          stripe_invoice_id: invoice.id,
          invoice_number: invoice.number,
          total_usd: invoice.total / 100, // Convert from cents
          subtotal_usd: invoice.subtotal / 100,
          tax_usd: (invoice.tax || 0) / 100,
          currency: invoice.currency,
          status: invoice.status,
          paid: invoice.paid,
          hosted_invoice_url: invoice.hosted_invoice_url,
          invoice_pdf: invoice.invoice_pdf,
          due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
          period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
          period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
        }]);
    }

    console.log(`Invoice created: ${invoice.id}`);
  } catch (error) {
    console.error('Failed to handle invoice created:', error);
  }
}

/**
 * Handle invoice paid event
 */
async function handleInvoicePaid(invoice: any) {
  try {
    // Update invoice as paid
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid: true,
        paid_at: new Date().toISOString(),
      })
      .eq('stripe_invoice_id', invoice.id);

    console.log(`Invoice paid: ${invoice.id}`);
  } catch (error) {
    console.error('Failed to handle invoice paid:', error);
  }
}

/**
 * Handle invoice payment failed event
 */
async function handleInvoicePaymentFailed(invoice: any) {
  try {
    // Update invoice status
    await supabase
      .from('invoices')
      .update({
        status: 'uncollectible',
        paid: false,
      })
      .eq('stripe_invoice_id', invoice.id);

    // Find billing account and potentially suspend
    const { data: billingAccount } = await supabase
      .from('billing_accounts')
      .select('*')
      .eq('stripe_customer_id', invoice.customer)
      .single();

    if (billingAccount) {
      await BillingManager.updateBillingAccount(billingAccount.id, {
        status: 'suspended',
      });

      // Log billing event
      await supabase
        .from('billing_events')
        .insert([{
          billing_account_id: billingAccount.id,
          event_type: 'invoice_failed',
          stripe_event_id: invoice.id,
          actor: 'stripe',
          description: 'Invoice payment failed, account suspended',
          new_values: { status: 'suspended' },
        }]);
    }

    console.log(`Invoice payment failed: ${invoice.id}`);
  } catch (error) {
    console.error('Failed to handle invoice payment failed:', error);
  }
}

/**
 * Handle checkout session completed event
 */
async function handleCheckoutCompleted(session: any) {
  try {
    const { org_id, billing_account_id, plan } = session.metadata || {};
    
    if (billing_account_id && plan) {
      // Update billing account with successful checkout
      await BillingManager.updateBillingAccount(billing_account_id, {
        plan,
        status: 'active',
      });

      // Log billing event
      await supabase
        .from('billing_events')
        .insert([{
          billing_account_id,
          event_type: 'plan_upgraded',
          stripe_event_id: session.id,
          actor: 'stripe',
          description: `Checkout completed for ${plan} plan`,
          new_values: { plan },
        }]);
    }

    console.log(`Checkout completed: ${session.id}`);
  } catch (error) {
    console.error('Failed to handle checkout completed:', error);
  }
}

/**
 * Get plan from Stripe price ID
 */
function getPlanFromPriceId(priceId: string): string {
  // Mock mapping - in production this would be a proper lookup
  if (priceId.includes('pro')) return 'pro';
  if (priceId.includes('team')) return 'team';
  if (priceId.includes('enterprise')) return 'enterprise';
  return 'free';
}

/**
 * Validate webhook signature
 */
function validateSignature(body: string, signature: string | null): boolean {
  if (!signature) {
    return false;
  }

  // In production, this would use the actual webhook secret
  const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_default_secret';
  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return signature.includes(expectedSignature);
}
