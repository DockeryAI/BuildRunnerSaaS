import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Validation functions for different services
async function validateTwilioKey(apiKey: string): Promise<{ valid: boolean; message?: string }> {
  // Twilio uses Account SID and Auth Token
  // For now, just check format
  if (apiKey.startsWith('AC') && apiKey.length === 34) {
    return { valid: true, message: 'Twilio Account SID format looks good!' };
  }
  return { valid: false, message: 'Invalid Twilio Account SID format. Should start with AC and be 34 characters.' };
}

async function validateSendGridKey(apiKey: string): Promise<{ valid: boolean; message?: string }> {
  // SendGrid keys start with 'SG.'
  if (!apiKey.startsWith('SG.')) {
    return { valid: false, message: 'Invalid SendGrid API key format. Should start with SG.' };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/scopes', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true, message: 'SendGrid API key validated successfully!' };
    }
    return { valid: false, message: 'SendGrid API key is invalid or lacks permissions.' };
  } catch (error) {
    return { valid: false, message: 'Failed to validate SendGrid API key.' };
  }
}

async function validateResendKey(apiKey: string): Promise<{ valid: boolean; message?: string }> {
  // Resend keys start with 're_'
  if (!apiKey.startsWith('re_')) {
    return { valid: false, message: 'Invalid Resend API key format. Should start with re_' };
  }

  try {
    const response = await fetch('https://api.resend.com/api-keys', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true, message: 'Resend API key validated successfully!' };
    }
    return { valid: false, message: 'Resend API key is invalid.' };
  } catch (error) {
    return { valid: false, message: 'Failed to validate Resend API key.' };
  }
}

async function validateOpenAIKey(apiKey: string): Promise<{ valid: boolean; message?: string }> {
  // OpenAI keys start with 'sk-'
  if (!apiKey.startsWith('sk-')) {
    return { valid: false, message: 'Invalid OpenAI API key format. Should start with sk-' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true, message: 'OpenAI API key validated successfully!' };
    }
    return { valid: false, message: 'OpenAI API key is invalid.' };
  } catch (error) {
    return { valid: false, message: 'Failed to validate OpenAI API key.' };
  }
}

async function validateAnthropicKey(apiKey: string): Promise<{ valid: boolean; message?: string }> {
  // Anthropic keys start with 'sk-ant-'
  if (!apiKey.startsWith('sk-ant-')) {
    return { valid: false, message: 'Invalid Anthropic API key format. Should start with sk-ant-' };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      }),
    });

    if (response.ok || response.status === 400) {
      // 400 is ok, means API key works but request was malformed
      return { valid: true, message: 'Anthropic API key validated successfully!' };
    }
    return { valid: false, message: 'Anthropic API key is invalid.' };
  } catch (error) {
    return { valid: false, message: 'Failed to validate Anthropic API key.' };
  }
}

async function validateStripeKey(apiKey: string): Promise<{ valid: boolean; message?: string }> {
  // Stripe keys start with 'sk_' or 'pk_'
  if (!apiKey.startsWith('sk_') && !apiKey.startsWith('pk_')) {
    return { valid: false, message: 'Invalid Stripe API key format. Should start with sk_ or pk_' };
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/charges?limit=1', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true, message: 'Stripe API key validated successfully!' };
    }
    return { valid: false, message: 'Stripe API key is invalid.' };
  } catch (error) {
    return { valid: false, message: 'Failed to validate Stripe API key.' };
  }
}

async function validateCalendlyKey(apiKey: string): Promise<{ valid: boolean; message?: string }> {
  // Basic format check
  if (apiKey.length < 20) {
    return { valid: false, message: 'Invalid Calendly token format.' };
  }

  try {
    const response = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true, message: 'Calendly API token validated successfully!' };
    }
    return { valid: false, message: 'Calendly API token is invalid.' };
  } catch (error) {
    return { valid: false, message: 'Failed to validate Calendly API token.' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { service, apiKey } = await request.json();

    if (!service || !apiKey) {
      return NextResponse.json(
        { error: 'Service and API key are required', valid: false },
        { status: 400 }
      );
    }

    // Validate the API key based on the service
    let result: { valid: boolean; message?: string };

    switch (service) {
      case 'twilio':
        result = await validateTwilioKey(apiKey);
        break;
      case 'sendgrid':
        result = await validateSendGridKey(apiKey);
        break;
      case 'resend':
        result = await validateResendKey(apiKey);
        break;
      case 'openai':
        result = await validateOpenAIKey(apiKey);
        break;
      case 'anthropic':
        result = await validateAnthropicKey(apiKey);
        break;
      case 'stripe':
        result = await validateStripeKey(apiKey);
        break;
      case 'calendly':
        result = await validateCalendlyKey(apiKey);
        break;
      default:
        // For unknown services, just accept the key (basic validation)
        result = { valid: true, message: 'API key saved (validation not implemented for this service).' };
    }

    // If valid, save to API keys file
    if (result.valid) {
      try {
        const apiKeysPath = path.join(process.cwd(), '.api-keys.json');
        let existingKeys: Record<string, string> = {};

        if (fs.existsSync(apiKeysPath)) {
          const fileContent = fs.readFileSync(apiKeysPath, 'utf-8');
          existingKeys = JSON.parse(fileContent);
        }

        // Save the key
        existingKeys[service] = apiKey;

        fs.writeFileSync(apiKeysPath, JSON.stringify(existingKeys, null, 2));
      } catch (saveError) {
        console.error('Error saving API key:', saveError);
        return NextResponse.json(
          { error: 'API key validated but failed to save', valid: false },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      valid: result.valid,
      message: result.message,
    });
  } catch (error) {
    console.error('Error validating API key:', error);
    return NextResponse.json(
      { error: 'Failed to validate API key', valid: false },
      { status: 500 }
    );
  }
}
