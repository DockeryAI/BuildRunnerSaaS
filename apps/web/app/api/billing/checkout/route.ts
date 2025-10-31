import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import BillingManager from '../../../../lib/billing/billing';
import plans from '../../../../../billing/plans.json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mock Stripe integration - in production this would use actual Stripe SDK
const mockStripe = {
  checkout: {
    sessions: {
      create: async (params: any) => ({
        id: `cs_mock_${Date.now()}`,
        url: `https://checkout.stripe.com/pay/mock_session_${Date.now()}`,
        customer: params.customer || `cus_mock_${Date.now()}`,
        subscription: `sub_mock_${Date.now()}`,
      }),
    },
  },
  customers: {
    create: async (params: any) => ({
      id: `cus_mock_${Date.now()}`,
      email: params.email,
    }),
  },
  billingPortal: {
    sessions: {
      create: async (params: any) => ({
        url: `https://billing.stripe.com/p/session_mock_${Date.now()}`,
      }),
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_id, plan, billing_cycle = 'monthly', success_url, cancel_url } = body;

    if (!org_id || !plan) {
      return NextResponse.json({
        error: 'Organization ID and plan are required',
      }, { status: 400 });
    }

    // Validate plan
    const planConfig = plans.plans[plan as keyof typeof plans.plans];
    if (!planConfig) {
      return NextResponse.json({
        error: 'Invalid plan selected',
      }, { status: 400 });
    }

    // Get or create billing account
    let billingAccount = await BillingManager.getBillingAccount(org_id);
    if (!billingAccount) {
      billingAccount = await BillingManager.createBillingAccount(org_id, 'free');
    }

    // Create or get Stripe customer
    let stripeCustomerId = billingAccount.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await mockStripe.customers.create({
        email: billingAccount.billingEmail,
        metadata: {
          org_id,
          billing_account_id: billingAccount.id,
        },
      });
      
      stripeCustomerId = customer.id;
      
      // Update billing account with Stripe customer ID
      await BillingManager.updateBillingAccount(billingAccount.id, {
        stripeCustomerId,
      });
    }

    // Get price ID for the plan and billing cycle
    const priceId = planConfig.stripe_price_ids[billing_cycle as keyof typeof planConfig.stripe_price_ids];
    if (!priceId) {
      return NextResponse.json({
        error: 'Price not available for selected billing cycle',
      }, { status: 400 });
    }

    // Create Stripe Checkout session
    const session = await mockStripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url || `${request.nextUrl.origin}/settings/billing?success=true`,
      cancel_url: cancel_url || `${request.nextUrl.origin}/settings/billing?cancelled=true`,
      metadata: {
        org_id,
        billing_account_id: billingAccount.id,
        plan,
        billing_cycle,
      },
    });

    // Log audit event
    await supabase
      .from('runner_events')
      .insert([{
        actor: 'system',
        action: 'checkout_session_created',
        payload: {
          org_id,
          billing_account_id: billingAccount.id,
          plan,
          billing_cycle,
          session_id: session.id,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          stripe_customer_id: stripeCustomerId,
        },
      }]);

    return NextResponse.json({
      session_id: session.id,
      checkout_url: session.url,
    });

  } catch (error) {
    console.error('[BILLING_CHECKOUT] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');

    if (!orgId) {
      return NextResponse.json({
        error: 'Organization ID is required',
      }, { status: 400 });
    }

    // Get billing account
    const billingAccount = await BillingManager.getBillingAccount(orgId);
    if (!billingAccount) {
      return NextResponse.json({
        error: 'Billing account not found',
      }, { status: 404 });
    }

    // Get current subscription
    const subscription = await BillingManager.getCurrentSubscription(billingAccount.id);

    // Get usage summary
    const usageSummary = await BillingManager.getUsageSummary(
      billingAccount.id,
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    );

    return NextResponse.json({
      billing_account: billingAccount,
      subscription,
      usage_summary: usageSummary,
      available_plans: plans.plans,
    });

  } catch (error) {
    console.error('[BILLING_CHECKOUT_GET] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to get billing information',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
