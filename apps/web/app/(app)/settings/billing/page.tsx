'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Download, AlertTriangle, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import plans from '../../../../../billing/plans.json';

interface BillingAccount {
  id: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  status: string;
  seatsIncluded: number;
  seatsUsed: number;
  renewalDate?: string;
  trialEndsAt?: string;
}

interface UsageSummary {
  tokens: { quantity: number; cost: number; limit: number };
  api_calls: { quantity: number; cost: number; limit: number };
  storage: { quantity: number; cost: number; limit: number };
  integrations: { quantity: number; cost: number; limit: number };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalUsd: number;
  status: string;
  paid: boolean;
  dueDate: string;
  hostedInvoiceUrl?: string;
}

export default function BillingPage() {
  const [billingAccount, setBillingAccount] = useState<BillingAccount | null>(null);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demo - in production this would call the API
      const mockBillingAccount: BillingAccount = {
        id: '1',
        plan: 'pro',
        status: 'active',
        seatsIncluded: 5,
        seatsUsed: 3,
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockUsageSummary: UsageSummary = {
        tokens: { quantity: 750000, cost: 15.50, limit: 1000000 },
        api_calls: { quantity: 7500, cost: 7.50, limit: 10000 },
        storage: { quantity: 6, cost: 3.00, limit: 10 },
        integrations: { quantity: 5, cost: 0, limit: 10 },
      };

      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          totalUsd: 29.00,
          status: 'paid',
          paid: true,
          dueDate: new Date().toISOString(),
          hostedInvoiceUrl: 'https://invoice.stripe.com/example',
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          totalUsd: 29.00,
          status: 'open',
          paid: false,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          hostedInvoiceUrl: 'https://invoice.stripe.com/example2',
        },
      ];

      setBillingAccount(mockBillingAccount);
      setUsageSummary(mockUsageSummary);
      setInvoices(mockInvoices);
      setSelectedPlan(mockBillingAccount.plan);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanChange = async (newPlan: string) => {
    try {
      // Mock plan change - in production this would call Stripe Checkout
      console.log(`Upgrading to ${newPlan} plan`);
      alert(`Plan change to ${newPlan} initiated. You would be redirected to Stripe Checkout.`);
    } catch (error) {
      console.error('Failed to change plan:', error);
      alert('Failed to change plan. Please try again.');
    }
  };

  const handleManageBilling = () => {
    // Mock customer portal - in production this would redirect to Stripe
    alert('You would be redirected to Stripe Customer Portal to manage billing.');
  };

  const getUsagePercentage = (used: number, limit: number): number => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getPlanColor = (plan: string): string => {
    switch (plan) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      case 'team':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Billing...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Usage</h1>
        <p className="text-gray-600">
          Manage your subscription, view usage, and download invoices
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan */}
        <div className="lg:col-span-2 space-y-6">
          {billingAccount && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                </div>
                <Badge className={getPlanColor(billingAccount.plan)}>
                  {billingAccount.plan.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {billingAccount.seatsUsed}/{billingAccount.seatsIncluded}
                  </div>
                  <div className="text-sm text-gray-600">Seats Used</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    ${plans.plans[billingAccount.plan].price.monthly}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Cost</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {billingAccount.renewalDate 
                      ? new Date(billingAccount.renewalDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Next Billing</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleManageBilling}>
                  Manage Billing
                </Button>
                <Button variant="outline" onClick={() => setSelectedPlan('')}>
                  Change Plan
                </Button>
              </div>
            </div>
          )}

          {/* Usage Summary */}
          {usageSummary && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Usage This Month</h2>
              </div>

              <div className="space-y-4">
                {Object.entries(usageSummary).map(([key, usage]) => {
                  const percentage = getUsagePercentage(usage.quantity, usage.limit);
                  const colorClass = getUsageColor(percentage);

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-600">
                          {usage.quantity.toLocaleString()} / {usage.limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${colorClass.split(' ')[1]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${colorClass}`}>
                          {percentage.toFixed(1)}% used
                        </span>
                        {usage.cost > 0 && (
                          <span className="text-gray-600">
                            ${usage.cost.toFixed(2)} this month
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plan Selector */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h3>
            <div className="space-y-3">
              {Object.entries(plans.plans).map(([planId, plan]) => (
                <div
                  key={planId}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlan === planId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(planId)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{plan.name}</h4>
                    {plan.popular && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Popular</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                  <div className="text-lg font-bold text-gray-900">
                    ${plan.price.monthly}
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </div>
                  {selectedPlan === planId && planId !== billingAccount?.plan && (
                    <Button
                      className="w-full mt-3"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanChange(planId);
                      }}
                    >
                      Upgrade to {plan.name}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>

            {invoices.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 3).map(invoice => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-600">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${invoice.totalUsd}</div>
                      <div className="flex items-center gap-1">
                        {invoice.paid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className={`text-xs ${invoice.paid ? 'text-green-600' : 'text-yellow-600'}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                    {invoice.hostedInvoiceUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(invoice.hostedInvoiceUrl, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Alerts */}
      {usageSummary && (
        <div className="mt-8">
          {Object.entries(usageSummary).some(([_, usage]) => getUsagePercentage(usage.quantity, usage.limit) >= 90) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-medium text-red-900">Usage Alert</h3>
              </div>
              <p className="text-red-700">
                You're approaching your usage limits. Consider upgrading your plan to avoid service interruptions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
