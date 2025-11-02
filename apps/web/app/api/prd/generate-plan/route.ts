import { NextRequest, NextResponse } from 'next/server';

// Helper function to get setup guide URLs
function getSetupGuideUrl(techName: string): string | undefined {
  const guides: Record<string, string> = {
    'Twilio': 'https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account',
    'SendGrid': 'https://docs.sendgrid.com/for-developers/sending-email/api-getting-started',
    'Resend': 'https://resend.com/docs/send-with-nextjs',
    'Supabase': '/settings/api-keys', // Internal setup
    'Vercel': 'https://vercel.com/docs/getting-started-with-vercel',
    'Railway': 'https://docs.railway.app/getting-started',
    'Stripe': 'https://stripe.com/docs/development/quickstart',
    'Calendly': 'https://developer.calendly.com/getting-started'
  };
  return guides[techName];
}

// Helper function to get signup URLs
function getSignupUrl(techName: string): string | undefined {
  const signups: Record<string, string> = {
    'Twilio': 'https://www.twilio.com/try-twilio',
    'SendGrid': 'https://signup.sendgrid.com/',
    'Resend': 'https://resend.com/signup',
    'Supabase': 'https://supabase.com/dashboard/sign-up',
    'Vercel': 'https://vercel.com/signup',
    'Railway': 'https://railway.app/signup',
    'Stripe': 'https://dashboard.stripe.com/register',
    'Calendly': 'https://calendly.com/signup',
    'OpenAI': 'https://platform.openai.com/signup',
    'Anthropic': 'https://console.anthropic.com/signup'
  };
  return signups[techName];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIdea, productName, prdSections } = body;

    // Get API keys from headers
    const apiKeysHeader = request.headers.get('x-api-keys');
    const apiKeys = apiKeysHeader ? JSON.parse(apiKeysHeader) : {};

    if (!apiKeys.openrouter) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 400 }
      );
    }

    // Build context from PRD sections
    let prdContext = '';
    if (prdSections) {
      Object.entries(prdSections).forEach(([phase, sections]: [string, any]) => {
        sections.forEach((section: any) => {
          if (section.items && section.items.length > 0) {
            prdContext += `\n\n${section.name}:\n`;
            section.items.forEach((item: any) => {
              prdContext += `- ${item.title}: ${item.shortDescription}\n`;
            });
          }
        });
      });
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeys.openrouter}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner SaaS - Project Plan Generator',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-4-sonnet-20250522',
        messages: [
          {
            role: 'system',
            content: `You are a project planning expert and software architect. Generate a detailed project implementation plan with Milestones, Steps, and Microsteps based on a PRD.

Return a JSON object with this exact schema:
{
  "architecture": {
    "recommendedStack": "Brief summary of recommended technology stack",
    "technologies": [
      {
        "name": "Technology name",
        "category": "frontend|backend|database|infrastructure|service",
        "reasoning": "Why this technology is recommended for this project",
        "difficulty": "easy|medium|advanced",
        "setupRequired": true,
        "easierAlternative": {
          "name": "Alternative technology name (ONLY if original is medium/advanced difficulty)",
          "reasoning": "Why this is easier and achieves same goal",
          "difficulty": "easy",
          "tradeoffs": "What you give up by using the easier option"
        }
      }
    ]
  },
  "milestones": [
    {
      "id": "unique_id",
      "title": "Milestone title",
      "description": "What this milestone achieves",
      "estimatedWeeks": 2,
      "dependencies": [],
      "status": "pending",
      "steps": [
        {
          "id": "unique_id",
          "title": "Step title",
          "description": "What this step involves",
          "estimatedDays": 3,
          "dependencies": [],
          "status": "pending",
          "microsteps": [
            {
              "id": "unique_id",
              "title": "Microstep title",
              "description": "Specific action to take",
              "estimatedHours": 4,
              "dependencies": [],
              "status": "pending"
            }
          ]
        }
      ]
    }
  ],
  "totalEstimatedWeeks": 8,
  "generatedAt": "2025-11-01T08:00:00Z"
}

CRITICAL JSON FORMATTING RULES:
- Use simple, short descriptions (max 200 characters each)
- Do NOT use special characters, quotes, or apostrophes in descriptions
- Keep descriptions factual and technical
- ALL string values must be properly escaped
- Ensure valid JSON syntax throughout

PROJECT PLANNING RULES:
- Create 3-5 milestones for a complete project
- Each milestone should have 2-3 steps
- Each step should have 2-3 microsteps
- Keep milestone/step/microstep titles concise (max 60 characters)
- Include realistic time estimates
- Focus on technical implementation based on the PRD features
- First milestone should always be Architecture & Setup
- Include recommended technology stack and architecture decisions

TECHNOLOGY RECOMMENDATIONS:
- For each technology, explain WHY it is recommended for THIS specific project
- RESPECT THE PRD: If the PRD mentions specific technologies (e.g., "Outlook integration"), include those technologies
- Consider difficulty level for non-technical users
- Mark setupRequired=true if user needs to create account or install
- Mark setupRequired=false if its a standard development tool
- Reasoning should be specific to the project requirements (max 150 chars)

EASIER ALTERNATIVES SYSTEM:
- If a technology has difficulty="medium" or "advanced", MUST include an easierAlternative
- The easierAlternative should achieve the same goal with less complexity
- Include name, reasoning (why its easier), difficulty (always "easy"), and tradeoffs
- Example: Microsoft Graph (advanced) → easierAlternative: Gmail API (easy)
- Example: AWS S3 (medium) → easierAlternative: Supabase Storage (easy)
- Example: Auth0 (medium) → easierAlternative: Supabase Auth (easy)
- Example: OpenAI API (medium) → easierAlternative: OpenRouter (easy)
- DO NOT replace requested technologies - show BOTH the requested tech AND the easier alternative
- User can choose to accept the alternative or proceed with the original
- Tradeoffs should be honest (e.g., "Less enterprise features, but sufficient for most use cases")

SPECIFIC ALTERNATIVE MAPPINGS:
- Microsoft Graph/Outlook → Gmail API or Resend
- AWS S3 → Supabase Storage
- Auth0 → Supabase Auth
- OpenAI/Anthropic direct → OpenRouter
- SendGrid → Resend
- Twilio → Avoid recommending (too complex)
- Custom PostgreSQL → Supabase (includes auth, storage, API)

Prioritize services with easy=difficulty and setupRequired=true only for cloud services`
          },
          {
            role: 'user',
            content: `Product: ${productName || 'Product'}

Product Idea: ${productIdea}

PRD Content:
${prdContext}

Generate a comprehensive project implementation plan with milestones, steps, and microsteps. Include realistic time estimates and dependencies. Return ONLY the JSON object.`
          }
        ],
        temperature: 0.2,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate project plan' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in API response');
    }

    // Extract JSON from response (might be wrapped in markdown)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Try to parse JSON with better error handling
    let plan;
    try {
      plan = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Attempted to parse:', jsonStr.substring(0, 500) + '...');

      // Try to fix common JSON issues
      try {
        // Remove any trailing commas before closing braces/brackets
        const fixedJson = jsonStr
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/[\u0000-\u001F]+/g, ''); // Remove control characters

        plan = JSON.parse(fixedJson);
        console.log('Successfully parsed JSON after fixing common issues');
      } catch (secondError) {
        throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }

    // Ensure all items have IDs
    if (!plan.milestones) {
      throw new Error('Invalid plan structure: missing milestones');
    }

    plan.milestones.forEach((milestone: any, mIndex: number) => {
      if (!milestone.id) milestone.id = `milestone-${mIndex}`;
      if (!milestone.steps) milestone.steps = [];

      milestone.steps.forEach((step: any, sIndex: number) => {
        if (!step.id) step.id = `step-${mIndex}-${sIndex}`;
        if (!step.microsteps) step.microsteps = [];

        step.microsteps.forEach((microstep: any, msIndex: number) => {
          if (!microstep.id) microstep.id = `microstep-${mIndex}-${sIndex}-${msIndex}`;
          if (!microstep.dependencies) microstep.dependencies = [];
          if (!microstep.status) microstep.status = 'pending';
        });

        if (!step.dependencies) step.dependencies = [];
        if (!step.status) step.status = 'pending';
      });

      if (!milestone.dependencies) milestone.dependencies = [];
      if (!milestone.status) milestone.status = 'pending';
    });

    if (!plan.generatedAt) {
      plan.generatedAt = new Date().toISOString();
    }

    // Detect existing services and enrich technology data
    if (plan.architecture && plan.architecture.technologies) {
      const existingServices = new Set();

      // Check if Supabase is setup (from API keys)
      if (apiKeys.supabase || apiKeys.supabase_url) {
        existingServices.add('Supabase');
        existingServices.add('PostgreSQL');
      }

      // Check other API keys
      if (apiKeys.openrouter) existingServices.add('OpenRouter');
      if (apiKeys.anthropic) existingServices.add('Anthropic');
      if (apiKeys.openai) existingServices.add('OpenAI');
      if (apiKeys.resend) existingServices.add('Resend');
      if (apiKeys.sendgrid) existingServices.add('SendGrid');
      if (apiKeys.vercel) existingServices.add('Vercel');
      if (apiKeys.railway) existingServices.add('Railway');

      // Services that can be fully integrated in-app (account/project creation via API)
      // Currently only Supabase supports full programmatic setup
      const inAppIntegrations = new Set(['Supabase', 'PostgreSQL']);

      // Services that could potentially support OAuth (future enhancement)
      const oauthCapable = new Set(['Vercel', 'Railway', 'Stripe']);

      // Enrich each technology with status
      plan.architecture.technologies = plan.architecture.technologies.map((tech: any) => {
        const techName = tech.name || '';
        let status = 'needs_account'; // Default status
        let canIntegrateInApp = inAppIntegrations.has(techName);

        // Check if already setup
        if (existingServices.has(techName)) {
          status = 'already_setup';
          tech.statusNote = canIntegrateInApp
            ? 'Integrated with your account'
            : 'Already configured in your account';
        }
        // Check if it's a standard dev tool (no account needed)
        else if (['Node.js', 'npm', 'React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'].includes(techName)) {
          status = 'standard_tool';
          tech.statusNote = 'Already included';
          canIntegrateInApp = false;
        }
        // Check if it's already installed locally
        else if (['VS Code', 'Git', 'Docker'].includes(techName)) {
          status = 'likely_installed';
          tech.statusNote = 'Commonly pre-installed';
          canIntegrateInApp = false;
        }

        return {
          ...tech,
          status,
          canIntegrateInApp,
          setupGuideUrl: getSetupGuideUrl(techName),
          signupUrl: getSignupUrl(techName)
        };
      });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error generating project plan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate project plan' },
      { status: 500 }
    );
  }
}
