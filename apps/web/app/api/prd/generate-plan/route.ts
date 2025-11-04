import { NextRequest, NextResponse } from 'next/server';
import { injectLearnedRules } from '../../../../lib/consensus-learning';
import { PlanValidator } from '../../../../lib/plan-validator';

// Helper function to get setup guide URLs
function getSetupGuideUrl(techName: string): string | undefined {
  const guides: Record<string, string> = {
    'Twilio': 'https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account',
    'SendGrid': 'https://docs.sendgrid.com/for-developers/sending-email/api-getting-started',
    'Resend': 'https://resend.com/docs/send-with-nextjs',
    'Supabase': '/settings/api-keys',
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

// Helper function to create a simple hash from PRD content
function createPRDHash(productIdea: string, prdSections: any): string {
  const content = JSON.stringify({ productIdea, prdSections });
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

// Helper function to infer criticality level from component metadata
// Uses same pattern matching as build-orchestrator.ts for consistency
function inferCriticality(component: any): 'ULTRA_CRITICAL' | 'CRITICAL' | 'IMPORTANT' | 'STANDARD' {
  const text = `${component.name || ''} ${component.description || ''}`.toLowerCase();

  // ULTRA_CRITICAL (7 models): Passwords, payments, admin access
  const ultraCriticalPatterns = [
    /\b(password|encrypt|decrypt|hash|private.?key|secret|credential)\b/i,
    /\b(stripe|payment|credit.?card|billing|transaction|charge)\b/i,
    /\b(admin|superuser|root|privilege.?escalation|sudo)\b/i,
    /\b(oauth|saml|sso|authentication.?provider)\b/i
  ];
  if (ultraCriticalPatterns.some(p => p.test(text))) {
    return 'ULTRA_CRITICAL';
  }

  // CRITICAL (5 models): Auth, database, file operations, PII
  const criticalPatterns = [
    /\b(auth|login|signup|jwt|session|token|cookie)\b/i,
    /\b(sql|database|query|injection|migration)\b/i,
    /\b(upload|download|file.?system|s3|storage)\b/i,
    /\b(PII|GDPR|personal.?data|privacy|consent)\b/i,
    /\b(permission|authorization|access.?control|role)\b/i
  ];
  if (criticalPatterns.some(p => p.test(text))) {
    return 'CRITICAL';
  }

  // IMPORTANT (3 models): API endpoints, validation, business logic
  const importantPatterns = [
    /\b(api|endpoint|route|controller|handler)\b/i,
    /\b(validation|sanitize|verify|check)\b/i,
    /\b(service|business.?logic|workflow)\b/i
  ];
  if (importantPatterns.some(p => p.test(text))) {
    return 'IMPORTANT';
  }

  // STANDARD (1 model): UI components, utilities, config
  return 'STANDARD';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIdea, productName, prdSections, cachedPlanHash } = body;

    // Check if we should use cached plan
    if (cachedPlanHash && productIdea && prdSections) {
      const currentHash = createPRDHash(productIdea, prdSections);
      if (currentHash === cachedPlanHash) {
        return NextResponse.json({ useCache: true });
      }
    }

    // Get API keys
    let openrouterApiKey = '';
    const apiKeysHeader = request.headers.get('x-api-keys');
    const apiKeys = apiKeysHeader ? JSON.parse(apiKeysHeader) : {};

    if (apiKeys.openrouter) {
      openrouterApiKey = apiKeys.openrouter;
      console.log('Using client-provided OpenRouter key from UI');
    }

    if (!openrouterApiKey) {
      openrouterApiKey = process.env.OPENROUTER_API_KEY || '';
      if (openrouterApiKey) {
        console.log('Using environment OpenRouter key');
      }
    }

    if (!openrouterApiKey) {
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

    // Enhanced prompt that generates build-ready component plans
    // Base system prompt (before learning injection)
    const baseSystemPrompt = `You are a software architect generating BUILD PLANS (structure + metadata only).

Quality enforcement happens LATER during code generation. Your job: define WHAT to build and HOW to classify it.

=== OUTPUT FORMAT ===

{
  "appType": "web",
  "framework": "nextjs",
  "architecture": {
    "recommendedStack": "Next.js 14 + React 18 + TypeScript + Tailwind CSS + Supabase",
    "technologies": [
      {"name": "Next.js", "category": "frontend", "reasoning": "Modern React framework", "difficulty": "medium", "setupRequired": false},
      {"name": "React", "category": "frontend", "reasoning": "UI library", "difficulty": "medium", "setupRequired": false},
      {"name": "TypeScript", "category": "frontend", "reasoning": "Type safety", "difficulty": "medium", "setupRequired": false},
      {"name": "Tailwind CSS", "category": "frontend", "reasoning": "Utility-first CSS", "difficulty": "easy", "setupRequired": false},
      {"name": "Supabase", "category": "database", "reasoning": "PostgreSQL database + Auth", "difficulty": "easy", "setupRequired": true},
      {"name": "Resend", "category": "service", "reasoning": "Transactional emails", "difficulty": "easy", "setupRequired": true}
    ]
  },
  "milestones": [
    {
      "id": "milestone-1",
      "name": "Design System & Infrastructure",
      "components": [
        {
          "id": "design-system",
          "name": "DesignSystem",
          "type": "design-system",
          "description": "Generate design system (include security keywords for classification)",
          "filePath": "lib/design-system/index.ts",
          "dependencies": [],
          "criticality": "CRITICAL",
          "estimatedHours": 2
        }
      ]
    }
  ]
}

=== RULE 1: MILESTONE 1 = DESIGN SYSTEM ===

First milestone MUST be "Design System & Infrastructure" with:
1. design-system (type: design-system, path: lib/design-system/index.ts)
2. shadcn-setup (type: component, path: components/ui/button.tsx, deps: design-system)
3. app-layout (type: layout, path: app/(app)/layout.tsx, deps: shadcn-setup)

=== RULE 2: CRITICALITY CLASSIFICATION ===

**ULTRA_CRITICAL** (7 models): passwords, encryption, payments, admin, OAuth
**CRITICAL** (5 models): auth, database, file operations, PII, permissions
**IMPORTANT** (3 models): API endpoints, validation, business logic
**STANDARD** (1 model): UI components, utilities, static pages

Include keywords in descriptions for auto-detection:
- "authentication" → CRITICAL
- "payment" → ULTRA_CRITICAL
- "validation" → IMPORTANT
- "button" → STANDARD

=== RULE 3: NEXT.JS 14 FILE PATHS (STRICT) ===

✅ Pages: app/(app)/[route]/page.tsx
✅ Layouts: app/(app)/[route]/layout.tsx
✅ API: app/api/[resource]/route.ts
✅ Components: components/[name].tsx or components/ui/[name].tsx
✅ Modular libs: lib/[module]/index.ts (NOT lib/[module].ts)
✅ Middleware: middleware.ts (root only, NOT in app/ or lib/)
✅ Manifest: app/manifest.ts (NOT public/manifest.json)
✅ DB Schema: lib/db/schema.ts (TypeScript, NOT .sql)

❌ NEVER: *.sql, *.json as components
❌ NEVER: react-router-dom (use next/navigation)
❌ NEVER: middleware.ts in subdirectories

=== RULE 4: DEPENDENCIES ===

⚠️ CRITICAL: Dependencies MUST reference EXACT component IDs from the same plan

- Order components by dependencies (no circular refs)
- Dependencies array uses FULL component IDs (e.g., "m1-design-system", NOT "design-system")
- ONLY reference components that exist in the current milestone or earlier milestones
- Design system FIRST, then shadcn, then layouts, then pages
- API routes typically have no dependencies

❌ INVALID: dependencies: ["design-system", "auth-system"]
✅ VALID: dependencies: ["m1-design-system", "m1-auth-system"]

=== RULE 5: EASY TECH STACK ===

✅ Prefer: Resend, Supabase Auth, Supabase DB, shadcn/ui, Tailwind, React Hook Form
❌ Avoid: Complex solutions when easier alternatives exist

=== RULE 6: COMPREHENSIVE ARCHITECTURE ===

**CRITICAL**: The "architecture.technologies" array must include ALL major technologies needed:

1. **Frontend** (category: "frontend"):
   - Always include: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
   - Add any project-specific UI libraries

2. **Database** (category: "database"):
   - Include: Supabase (or other database)
   - Add any caching layers (Redis, etc)

3. **Services** (category: "service"):
   - Include ANY external APIs/services the project needs:
     - Email: Resend, SendGrid, etc
     - Payments: Stripe, etc
     - Auth providers: if using OAuth
     - Any third-party integrations

4. **Backend** (category: "backend"):
   - Include: Any backend frameworks or API layers

Each technology must have:
- "name": Technology name
- "category": frontend | backend | database | service
- "reasoning": Why this technology was chosen
- "difficulty": easy | medium | advanced
- "setupRequired": true if needs API keys/setup, false otherwise

=== VALIDATION ===

Before returning, CRITICALLY verify:
✅ Architecture has "recommendedStack" string
✅ Architecture.technologies has AT LEAST 5-8 technologies (frontend, database, services)
✅ Each technology has name, category, reasoning, difficulty, setupRequired
✅ Milestone 1 has design-system first
✅ All file paths follow Next.js 14 conventions
✅ No circular dependencies
✅ All components have criticality
✅ ALL dependencies reference EXACT component IDs from this plan
   - Build complete list of all component IDs first
   - Check EVERY dependency against this list
   - If dependency doesn't exist, it's INVALID - fix it!
✅ No component references non-existent dependencies

⚠️ CRITICAL: If ANY dependency is invalid, FIX IT before returning!

Return ONLY the JSON. No markdown fences, no extra text.`;

    // Inject learned rules from consensus history
    const { enhancedPrompt, appliedPatternIds } = await injectLearnedRules(baseSystemPrompt, 'plan_verification');
    console.log(`🧠 Injected ${appliedPatternIds.length} learned patterns into plan generator prompt`);

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    let content: string;
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://buildrunner.cloud',
          'X-Title': 'BuildRunner SaaS - Build Plan Generator',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'anthropic/claude-4-sonnet-20250522',
          messages: [
            {
              role: 'system',
              content: enhancedPrompt // Use enhanced prompt with learned rules
            },
            {
              role: 'user',
              content: `Product: ${productName || 'Product'}

Product Idea: ${productIdea}

PRD Content:
${prdContext}

Generate a comprehensive BUILD PLAN with properly scoped, independently buildable components. Each component must be ready for direct code generation by AI models. Focus on creating a clear dependency graph that can be built sequentially without issues.

Return ONLY the JSON object.`
          }
          ],
          temperature: 0.2, // Low temp for consistent, structured output
          max_tokens: 8000, // Reduced to prevent timeout issues
        }),
      });

      clearTimeout(timeoutId); // Clear timeout on successful response

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', errorText);
        return NextResponse.json(
          { error: 'Failed to generate project plan' },
          { status: response.status }
        );
      }

      // Parse response with better error handling
      let data;
      try {
        const responseText = await response.text();
        console.log(`📊 Response size: ${responseText.length} characters`);
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('❌ Failed to parse OpenRouter response:', jsonError);
        throw new Error('Invalid response from AI provider - response may be incomplete');
      }

      content = data.choices[0]?.message?.content;

      if (!content) {
        console.error('❌ No content in API response. Full response:', JSON.stringify(data).substring(0, 500));
        throw new Error('No content in API response');
      }

      console.log(`✅ Received AI response: ${content.length} characters`);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        console.error('❌ Request timeout: OpenRouter took longer than 2 minutes');
        return NextResponse.json(
          { error: 'Request timeout - plan generation took too long. Try with a simpler product description.' },
          { status: 504 }
        );
      }

      console.error('❌ Fetch error:', fetchError);
      throw fetchError;
    }

    // Extract JSON from response
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse JSON with error handling
    let plan;
    try {
      plan = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Attempted to parse:', jsonStr.substring(0, 500) + '...');

      // Try to fix common JSON issues
      try {
        const fixedJson = jsonStr
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/[\u0000-\u001F]+/g, '');

        plan = JSON.parse(fixedJson);
        console.log('Successfully parsed JSON after fixing common issues');
      } catch (secondError) {
        throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }

    // ========================================
    // PLAN VALIDATION - Prevent tech stack confusion
    // ========================================
    console.log('🔍 Validating plan for quality issues...');
    const validator = new PlanValidator();
    const validationResult = await validator.validatePlan(plan);

    if (!validationResult.valid) {
      console.warn('⚠️  Plan validation failed!');
      console.warn(validator.getValidationReport(validationResult));

      if (validationResult.shouldRegenerate) {
        console.log('🔄 Regenerating plan with fixes...');

        // Regenerate plan with validation feedback
        const regenerationPrompt = `${productPrompt}\n\n${validationResult.regenerationPrompt}`;

        const regenerateResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://buildrunner.cloud',
            'X-Title': 'BuildRunner - Plan Generator (Regeneration)',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
              {
                role: 'system',
                content: enhancedPrompt
              },
              {
                role: 'user',
                content: regenerationPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 16000,
          }),
        });

        if (!regenerateResponse.ok) {
          throw new Error(`Failed to regenerate plan: ${regenerateResponse.statusText}`);
        }

        const regenerateData = await regenerateResponse.json();
        let regeneratedContent = regenerateData.choices[0]?.message?.content || '';

        // Extract JSON from regenerated response
        let regeneratedJsonStr = regeneratedContent.trim();
        if (regeneratedJsonStr.startsWith('```json')) {
          regeneratedJsonStr = regeneratedJsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (regeneratedJsonStr.startsWith('```')) {
          regeneratedJsonStr = regeneratedJsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        try {
          plan = JSON.parse(regeneratedJsonStr);
          console.log('✅ Successfully regenerated plan');

          // Validate again
          const revalidation = await validator.validatePlan(plan);
          if (!revalidation.valid) {
            console.warn('⚠️  Regenerated plan still has issues, but proceeding...');
            console.warn(validator.getValidationReport(revalidation));
          }
        } catch (regenerateError) {
          console.error('❌ Failed to parse regenerated plan, using original');
          // Keep the original plan if regeneration fails
        }
      }
    } else {
      console.log('✅ Plan validation passed!');
    }

    // Validate plan structure
    if (!plan.milestones) {
      throw new Error('Invalid plan structure: missing milestones');
    }

    // Ensure all components have proper IDs and structure
    plan.milestones.forEach((milestone: any, mIndex: number) => {
      if (!milestone.id) milestone.id = `milestone-${mIndex + 1}`;
      if (!milestone.components) milestone.components = [];
      if (!milestone.priority) milestone.priority = 'medium';
      if (!milestone.estimatedHours) {
        milestone.estimatedHours = milestone.components.reduce((sum: number, c: any) =>
          sum + (c.estimatedHours || 4), 0
        );
      }

      milestone.components.forEach((component: any, cIndex: number) => {
        if (!component.id) component.id = `${milestone.id}-comp-${cIndex + 1}`;
        if (!component.dependencies) component.dependencies = [];
        if (!component.interfaces) component.interfaces = { props: [], exports: [], apiEndpoints: [] };
        if (!component.testStrategy) component.testStrategy = 'Unit tests for core functionality';
        if (!component.estimatedHours) component.estimatedHours = 4;

        // Add criticality classification (auto-detect if not provided)
        if (!component.criticality) {
          component.criticality = inferCriticality(component);
        }

        // Add quality requirements if missing
        if (!component.qualityRequirements) {
          component.qualityRequirements = {
            typescript: 'strict',
            accessibility: true,
            responsive: true,
            errorHandling: true,
            loadingStates: component.type === 'page' || component.type === 'component',
            maxLines: 200
          };
        }

        // Add PRD features array if missing
        if (!component.prdFeatures) {
          component.prdFeatures = [];
        }
      });
    });

    if (!plan.generatedAt) {
      plan.generatedAt = new Date().toISOString();
    }

    // Set defaults
    if (!plan.appType) plan.appType = 'web';
    if (!plan.framework) plan.framework = 'nextjs';

    // Detect existing services and enrich technology data
    if (plan.architecture && plan.architecture.technologies) {
      const existingServices = new Set();

      if (apiKeys.supabase || apiKeys.supabase_url) {
        existingServices.add('Supabase');
        existingServices.add('PostgreSQL');
      }
      if (apiKeys.openrouter) existingServices.add('OpenRouter');
      if (apiKeys.anthropic) existingServices.add('Anthropic');
      if (apiKeys.openai) existingServices.add('OpenAI');
      if (apiKeys.resend) existingServices.add('Resend');
      if (apiKeys.sendgrid) existingServices.add('SendGrid');
      if (apiKeys.vercel) existingServices.add('Vercel');
      if (apiKeys.railway) existingServices.add('Railway');

      const inAppIntegrations = new Set(['Supabase', 'PostgreSQL']);

      plan.architecture.technologies = plan.architecture.technologies.map((tech: any) => {
        const techName = tech.name || '';
        let status = 'needs_account';
        let canIntegrateInApp = inAppIntegrations.has(techName);

        if (existingServices.has(techName)) {
          status = 'already_setup';
          tech.statusNote = canIntegrateInApp
            ? 'Integrated with your account'
            : 'Already configured in your account';
        } else if (['Node.js', 'npm', 'React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'].includes(techName)) {
          status = 'standard_tool';
          tech.statusNote = 'Already included';
          canIntegrateInApp = false;
        } else if (['VS Code', 'Git', 'Docker'].includes(techName)) {
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

    // Generate hash for caching
    const prdHash = createPRDHash(productIdea, prdSections);

    return NextResponse.json({ plan, prdHash });
  } catch (error) {
    console.error('Error generating project plan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate project plan' },
      { status: 500 }
    );
  }
}
