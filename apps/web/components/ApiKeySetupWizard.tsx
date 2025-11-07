'use client';

import React, { useState } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface Technology {
  name: string;
  category: string;
  reasoning: string;
  difficulty: string;
  setupRequired: boolean;
  signupUrl?: string;
  setupGuideUrl?: string;
}

interface ApiKeySetupWizardProps {
  technology: Technology;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (apiKey: string) => void;
}

interface SetupStep {
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
}

// Service-specific setup instructions
const setupInstructions: Record<string, SetupStep[]> = {
  'Twilio': [
    {
      title: 'Create a Twilio Account',
      description: 'Sign up for a free Twilio account to get started with SMS messaging.',
      action: 'Go to Twilio Signup',
      actionUrl: 'https://www.twilio.com/try-twilio',
    },
    {
      title: 'Get Your Account SID and Auth Token',
      description: 'After signing in, go to your Twilio Console Dashboard. You\'ll find your Account SID and Auth Token in the Account Info section.',
      action: 'Open Twilio Console',
      actionUrl: 'https://console.twilio.com/',
    },
    {
      title: 'Get a Phone Number',
      description: 'Navigate to Phone Numbers → Buy a Number to get a phone number for sending SMS.',
      action: 'Buy Phone Number',
      actionUrl: 'https://console.twilio.com/us1/develop/phone-numbers/manage/search',
    },
    {
      title: 'Copy Your Credentials',
      description: 'Copy your Account SID, Auth Token, and Phone Number. You\'ll need all three to send messages.',
    },
  ],
  'SendGrid': [
    {
      title: 'Create a SendGrid Account',
      description: 'Sign up for a free SendGrid account to send up to 100 emails per day.',
      action: 'Go to SendGrid Signup',
      actionUrl: 'https://signup.sendgrid.com/',
    },
    {
      title: 'Verify Your Email',
      description: 'Check your email and verify your account to activate it.',
    },
    {
      title: 'Create an API Key',
      description: 'Go to Settings → API Keys → Create API Key. Give it Full Access permissions.',
      action: 'Create API Key',
      actionUrl: 'https://app.sendgrid.com/settings/api_keys',
    },
    {
      title: 'Copy Your API Key',
      description: 'Copy the API key immediately - you won\'t be able to see it again!',
    },
  ],
  'Resend': [
    {
      title: 'Create a Resend Account',
      description: 'Sign up for Resend - modern email API with generous free tier.',
      action: 'Go to Resend Signup',
      actionUrl: 'https://resend.com/signup',
    },
    {
      title: 'Add Your Domain (Optional)',
      description: 'Add and verify your domain for professional emails, or use their test domain.',
      action: 'Add Domain',
      actionUrl: 'https://resend.com/domains',
    },
    {
      title: 'Create an API Key',
      description: 'Go to API Keys section and create a new API key with sending permissions.',
      action: 'Create API Key',
      actionUrl: 'https://resend.com/api-keys',
    },
    {
      title: 'Copy Your API Key',
      description: 'Copy the API key and save it securely.',
    },
  ],
  'Calendly': [
    {
      title: 'Create a Calendly Account',
      description: 'Sign up for Calendly to enable appointment scheduling.',
      action: 'Go to Calendly Signup',
      actionUrl: 'https://calendly.com/signup',
    },
    {
      title: 'Set Up Your Availability',
      description: 'Configure your calendar availability and meeting types.',
      action: 'Set Availability',
      actionUrl: 'https://calendly.com/event_types/user/me',
    },
    {
      title: 'Generate API Key',
      description: 'Go to Integrations → API & Webhooks → Personal Access Token.',
      action: 'Get Access Token',
      actionUrl: 'https://calendly.com/integrations/api_webhooks',
    },
    {
      title: 'Copy Your Token',
      description: 'Copy your personal access token for API integration.',
    },
  ],
  'OpenAI': [
    {
      title: 'Create an OpenAI Account',
      description: 'Sign up for OpenAI to access GPT models for AI features.',
      action: 'Go to OpenAI Signup',
      actionUrl: 'https://platform.openai.com/signup',
    },
    {
      title: 'Add Payment Method',
      description: 'Add a payment method to enable API access (pay-as-you-go pricing).',
      action: 'Add Billing',
      actionUrl: 'https://platform.openai.com/account/billing',
    },
    {
      title: 'Create API Key',
      description: 'Go to API Keys section and create a new secret key.',
      action: 'Create API Key',
      actionUrl: 'https://platform.openai.com/api-keys',
    },
    {
      title: 'Copy Your API Key',
      description: 'Copy the API key immediately and store it securely.',
    },
  ],
  'Anthropic': [
    {
      title: 'Create an Anthropic Account',
      description: 'Sign up for Anthropic to access Claude AI models.',
      action: 'Go to Anthropic Signup',
      actionUrl: 'https://console.anthropic.com/signup',
    },
    {
      title: 'Add Payment Method',
      description: 'Add billing information to enable API access.',
      action: 'Add Billing',
      actionUrl: 'https://console.anthropic.com/settings/billing',
    },
    {
      title: 'Create API Key',
      description: 'Go to API Keys section and generate a new key.',
      action: 'Create API Key',
      actionUrl: 'https://console.anthropic.com/settings/keys',
    },
    {
      title: 'Copy Your API Key',
      description: 'Copy the API key and save it securely.',
    },
  ],
  'Stripe': [
    {
      title: 'Create a Stripe Account',
      description: 'Sign up for Stripe to accept payments.',
      action: 'Go to Stripe Signup',
      actionUrl: 'https://dashboard.stripe.com/register',
    },
    {
      title: 'Activate Your Account',
      description: 'Complete the account activation process and verify your business details.',
    },
    {
      title: 'Get Your API Keys',
      description: 'Go to Developers → API Keys to find your publishable and secret keys.',
      action: 'Get API Keys',
      actionUrl: 'https://dashboard.stripe.com/apikeys',
    },
    {
      title: 'Copy Your Keys',
      description: 'Copy both your publishable key (starts with pk_) and secret key (starts with sk_).',
    },
  ],
  'Supabase': [
    {
      title: 'Create a Supabase Account',
      description: 'Sign up for Supabase to get a free PostgreSQL database with built-in auth and real-time features.',
      action: 'Go to Supabase Signup',
      actionUrl: 'https://supabase.com/dashboard/sign-up',
    },
    {
      title: 'Create a New Project',
      description: 'Click "New Project", choose a name, set a strong database password, and select a region close to your users.',
      action: 'Create Project',
      actionUrl: 'https://supabase.com/dashboard/projects',
    },
    {
      title: 'Get Your Project URL',
      description: 'Go to Settings → API. Copy your "Project URL" - this is your SUPABASE_URL.',
      action: 'View API Settings',
      actionUrl: 'https://supabase.com/dashboard/project/_/settings/api',
    },
    {
      title: 'Get Your API Keys',
      description: 'On the same API page, copy your "anon public" key (safe for client-side use) and optionally the "service_role" key (for server-side operations).',
    },
    {
      title: 'Copy Your Connection String',
      description: 'Go to Settings → Database and copy the Connection String (in "URI" format). You\'ll need this as DATABASE_URL.',
      action: 'View Database Settings',
      actionUrl: 'https://supabase.com/dashboard/project/_/settings/database',
    },
  ],
  'PostgreSQL': [
    {
      title: 'Recommended: Use Supabase',
      description: 'For easiest setup, we recommend using Supabase which provides managed PostgreSQL with a generous free tier.',
      action: 'Switch to Supabase',
      actionUrl: 'https://supabase.com/dashboard/sign-up',
    },
    {
      title: 'Alternative: Local PostgreSQL',
      description: 'Install PostgreSQL locally using Homebrew (Mac), apt (Linux), or download from postgresql.org (Windows).',
      action: 'Download PostgreSQL',
      actionUrl: 'https://www.postgresql.org/download/',
    },
    {
      title: 'Create a Database',
      description: 'After installation, create a new database: `createdb your_database_name`',
    },
    {
      title: 'Get Connection String',
      description: 'Format: postgresql://username:password@localhost:5432/database_name',
    },
  ],
  'Prisma': [
    {
      title: 'Database Required',
      description: 'Prisma needs a database connection. We recommend setting up Supabase first (see Supabase setup guide).',
      action: 'Setup Supabase',
      actionUrl: 'https://supabase.com/dashboard/sign-up',
    },
    {
      title: 'Connection String',
      description: 'After setting up your database, you\'ll add the connection string to your .env file as DATABASE_URL.',
    },
    {
      title: 'Prisma Setup',
      description: 'Prisma will be configured automatically in your generated project. Just make sure DATABASE_URL is set.',
    },
  ],
};

export default function ApiKeySetupWizard({
  technology,
  isOpen,
  onClose,
  onComplete,
}: ApiKeySetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationMessage, setValidationMessage] = useState('');

  const steps = setupInstructions[technology.name] || [];
  const isLastStep = currentStep === steps.length;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setValidationStatus('idle');
    }
  };

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) {
      setValidationStatus('error');
      setValidationMessage('Please enter an API key');
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');

    try {
      // Call API to validate and save the key
      const response = await fetch('/api/settings/validate-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: technology.name.toLowerCase(),
          apiKey: apiKey.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setValidationStatus('success');
        setValidationMessage(data.message || 'API key validated and saved successfully!');

        // Wait a moment to show success message, then close
        setTimeout(() => {
          onComplete(apiKey.trim());
          onClose();
        }, 1500);
      } else {
        setValidationStatus('error');
        setValidationMessage(data.error || 'Invalid API key. Please check and try again.');
      }
    } catch (error) {
      setValidationStatus('error');
      setValidationMessage('Failed to validate API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <SparklesIcon className="h-6 w-6 text-blue-600 mr-2" />
              Set Up {technology.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{technology.reasoning}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length + 1}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / (steps.length + 1)) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / (steps.length + 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isLastStep ? (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  {currentStep + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {steps[currentStep]?.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {steps[currentStep]?.description}
                  </p>

                  {steps[currentStep]?.actionUrl && (
                    <a
                      href={steps[currentStep].actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {steps[currentStep].action}
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </a>
                  )}
                </div>
              </div>

              {/* Show what's coming next */}
              {currentStep < steps.length - 1 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Next Step:</p>
                  <p className="text-sm text-gray-600">{steps[currentStep + 1]?.title}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Almost Done! Enter Your API Key
                </h3>
              </div>

              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                  {technology.name} API Key
                </label>
                <input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setValidationStatus('idle');
                  }}
                  placeholder="Paste your API key here"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {validationStatus === 'success' && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800">{validationMessage}</p>
                </div>
              )}

              {validationStatus === 'error' && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{validationMessage}</p>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Your API key will be securely stored and used only for {technology.name} integration.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>

          {!isLastStep ? (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleValidateAndSave}
              disabled={isValidating || !apiKey.trim()}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Validate & Save
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
