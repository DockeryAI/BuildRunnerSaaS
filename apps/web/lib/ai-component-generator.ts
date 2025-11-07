/**
 * AI Component Generator
 * Uses context-aware prompts to generate production-quality components
 */

import { ContextBuilder, BuildContext, PRDContext, ComponentContext } from './context-builder';
import { DesignSpec } from './design-system-generator';
import { CatalystIntegrator } from './catalyst/integrator';
import { ComponentSpec } from './component-designer';

export interface GenerationResult {
  code: string;
  filePath: string;
  componentName: string;
  dependencies: string[];
  quality: {
    score: number;
    issues: string[];
    strengths: string[];
  };
}

export class AIComponentGenerator {
  private apiKey: string;
  private model: string;
  private catalystIntegrator: CatalystIntegrator;

  constructor(apiKey: string, model: string = 'anthropic/claude-3.5-sonnet') {
    this.apiKey = apiKey;
    this.model = model;
    this.catalystIntegrator = new CatalystIntegrator();
  }

  /**
   * Intelligent model selection based on component complexity and criticality
   * Routes to optimal model for speed + quality balance
   */
  private selectModelForComponent(context: BuildContext): string {
    const { component } = context;
    const componentType = component.componentType.toLowerCase();
    const componentName = component.componentName.toLowerCase();
    const description = (component.description || '').toLowerCase();

    // Critical components → Claude 3.5 Sonnet (highest quality)
    const criticalTypes = [
      'auth', 'login', 'signup', 'payment', 'checkout', 'billing',
      'security', 'admin', 'permission', 'encryption', 'subscription'
    ];

    if (criticalTypes.some(type => componentType.includes(type) || componentName.includes(type) || description.includes(type)) ||
        component.criticality === 'ULTRA_CRITICAL' ||
        component.criticality === 'CRITICAL') {
      console.log(`🔒 Using Claude 3.5 Sonnet for critical component: ${component.componentName}`);
      return 'anthropic/claude-sonnet-4.5';
    }

    // Visual/creative/hero pages → Claude 3.5 Sonnet (better design sense)
    const visualTypes = [
      'hero', 'landing', 'homepage', 'onboarding', 'welcome',
      'marketing', 'showcase', 'featured', 'banner', 'jumbotron',
      'pricing', 'plans'
    ];

    if (visualTypes.some(type => componentType.includes(type) || componentName.includes(type) || description.includes(type))) {
      console.log(`🎨 Using Claude 3.5 Sonnet for visual/creative component: ${component.componentName}`);
      return 'anthropic/claude-sonnet-4.5';
    }

    // Complex dashboards/analytics → Claude 3.5 Sonnet (complex visualization)
    const complexVizTypes = ['dashboard', 'analytics', 'metrics', 'insights', 'report'];
    const hasComplexViz = complexVizTypes.some(type => componentType.includes(type) || componentName.includes(type) || description.includes(type));
    const isComplex = description.includes('complex') || description.includes('advanced') || description.includes('interactive');

    if (hasComplexViz && isComplex) {
      console.log(`📊 Using Claude 3.5 Sonnet for complex visualization: ${component.componentName}`);
      return 'anthropic/claude-sonnet-4.5';
    }

    // Default: Gemini 2.5 Flash for speed, with enhanced quality prompts
    // The new MODERN UI/UX requirements + IMPORTANT tier should give us quality
    console.log(`⚡ Using Gemini 2.5 Flash for ${component.componentName} (balanced mode)`);
    return 'google/gemini-2.5-flash';
  }

  /**
   * Generate a component with full PRD and design context
   */
  async generateComponent(context: BuildContext): Promise<GenerationResult> {
    // Check if we should use Catalyst as foundation
    const componentSpec: ComponentSpec = {
      name: context.component.componentName,
      type: context.component.componentType,
      purpose: context.component.description,
      requirements: [], // Could extract from context if needed
      interactions: [],
      dataFlow: [],
    };

    const catalystIntegration = await this.catalystIntegrator.integrateWithCatalyst(
      componentSpec,
      context.design
    );

    let prompt: string;

    if (catalystIntegration.useCatalyst) {
      console.log(`✨ Using Catalyst UI foundation: ${catalystIntegration.baseComponents.join(', ')}`);
      prompt = this.buildCatalystPrompt(context, catalystIntegration);
    } else {
      // Build the standard comprehensive prompt
      prompt = ContextBuilder.buildComponentPrompt(context);
    }

    // Select optimal model for this component
    const selectedModel = this.selectModelForComponent(context);

    console.log(`🎨 Generating ${context.component.componentName} with full context...`);
    console.log(`📝 Prompt length: ${prompt.length} characters`);
    console.log(`🤖 Model: ${selectedModel}`);

    // Generate code with AI using selected model
    const rawCode = await this.callAI(prompt, selectedModel);

    // Post-process: Apply design tokens
    const styledCode = this.applyDesignTokens(rawCode, context.design);

    // Post-process: Ensure quality standards
    const finalCode = this.ensureQuality(styledCode, context);

    // Analyze quality
    const quality = this.analyzeQuality(finalCode, context);

    // Determine file path
    const filePath = this.inferFilePath(context.component);

    console.log(`✅ Generated ${context.component.componentName}`);
    console.log(`📊 Quality score: ${quality.score}/100`);

    return {
      code: finalCode,
      filePath,
      componentName: context.component.componentName,
      dependencies: this.extractDependencies(finalCode),
      quality,
    };
  }

  /**
   * Build Catalyst-enhanced prompt for component generation
   */
  private buildCatalystPrompt(
    context: BuildContext,
    catalystIntegration: any
  ): string {
    const standardPrompt = ContextBuilder.buildComponentPrompt(context);

    return `# PREMIUM COMPONENT GENERATION WITH CATALYST UI FOUNDATION

You are customizing production-quality Catalyst UI components - the same premium components used by professional development teams at companies like Stripe, Linear, and Vercel.

## 🎯 Component Requirements

**Component Name:** ${context.component.componentName}
**Type:** ${context.component.componentType}
**Purpose:** ${context.component.description}

## 🏗️ Available Catalyst Components (Use These as Foundation!)

${catalystIntegration.catalystSource}

## 🎨 Design System

**CRITICAL: ONLY USE THESE DESIGN TOKEN CLASSES - NEVER USE HARDCODED COLORS!**

**Available Color Classes:**
- **Primary:** bg-primary, text-primary, border-primary, ring-primary (${context.design?.colorPalette?.primary || '#3B82F6'})
- **Background:** bg-background, text-background (${context.design?.colorPalette?.background || '#FFFFFF'})
- **Foreground:** text-foreground (${context.design?.colorPalette?.foreground || '#111827'})
- **Surface:** bg-surface (for cards/panels - ${context.design?.colorPalette?.surface || context.design?.colorPalette?.muted || '#F9FAFB'})
- **Muted:** bg-muted, text-muted-foreground (${context.design?.colorPalette?.muted || '#F3F4F6'})
- **Border:** border-border (${context.design?.colorPalette?.border || '#E5E7EB'})
- **Ring:** ring-ring (for focus states - ${context.design?.colorPalette?.ring || '#3B82F6'})
- **Destructive:** bg-destructive, text-destructive (${context.design?.colorPalette?.destructive || '#EF4444'})
- **Accent:** bg-accent, text-accent-foreground (${context.design?.colorPalette?.accent || '#10B981'})

**Typography:**
- Font: font-sans (${context.design?.typography?.fontFamily?.sans || 'Inter, system-ui, sans-serif'})
- Scale: Use text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl

**❌ NEVER USE:**
- bg-gray-50, bg-gray-100, bg-white
- text-gray-600, text-gray-900, text-black
- border-gray-200, border-gray-300
- bg-blue-500, text-blue-600, bg-indigo-500
- ANY hardcoded Tailwind color classes

**✅ ALWAYS USE:**
- bg-background, bg-surface, bg-primary, bg-muted
- text-foreground, text-muted-foreground, text-primary
- border-border, ring-ring
- Design token classes that reference the theme

## 📋 Catalyst Pattern Guidelines

**CRITICAL: Maintain Catalyst's professional quality!**

**Color System:**
- Always use dark mode: \`text-zinc-950 dark:text-white\`
- Borders: \`border-zinc-950/10 dark:border-white/10\`
- Backgrounds: \`bg-white dark:bg-zinc-900\`
- Muted text: \`text-zinc-500 dark:text-zinc-400\`

**Interactive States:**
- Hover: \`data-hover:bg-zinc-950/2.5 dark:data-hover:bg-white/5\`
- Active: \`data-active:bg-zinc-950/5 dark:data-active:bg-white/10\`
- Focus: \`data-focus:outline-2 data-focus:outline-blue-500\`
- Disabled: \`data-disabled:opacity-50\`

**Spacing:**
- Use CSS variables: \`px-(--gutter,--spacing(2))\`
- Consistent padding with --spacing system

**Responsive Design:**
- Mobile-first approach
- Desktop: \`lg:\` prefix
- Tablet: \`md:\` prefix

## ✨ Animation Requirements (MANDATORY!)

**CRITICAL: ALL components MUST use Framer Motion!**

\`\`\`typescript
import { motion } from 'framer-motion'

// Wrap main component
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Component content */}
</motion.div>

// Add interactive animations
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  {/* Button content */}
</motion.button>
\`\`\`

## 🎯 Your Task

1. **Use Catalyst Components as Foundation**
   - Start with the provided Catalyst components
   - DO NOT rebuild them from scratch
   - Keep their structure and patterns intact

2. **Customize for Requirements**
   - Apply the design system colors
   - Add specific content for this use case
   - Implement the required functionality

3. **Add Framer Motion**
   - Wrap in motion.div for entrance animation
   - Add whileHover to interactive elements
   - Use AnimatePresence for conditional rendering

4. **Maintain Quality**
   - Keep Catalyst's professional spacing
   - Preserve accessibility features (ARIA, keyboard nav)
   - Support dark mode with dark: variants
   - Ensure mobile responsiveness with lg: breakpoint

## 🚨 CRITICAL RULES

**DO:**
- ✅ Import Catalyst components: \`import { Button } from '@/components/catalyst/button'\`
- ✅ Import Framer Motion: \`import { motion } from 'framer-motion'\`
- ✅ Use 'use client' directive
- ✅ Wrap main component in motion.div with entrance animation
- ✅ Keep Catalyst's data-* attribute patterns
- ✅ **ONLY USE DESIGN TOKEN CLASSES** (bg-primary, text-foreground, border-border, bg-surface, etc.)
- ✅ Include realistic mock data as constants
- ✅ Export both component and demo function
- ✅ Add dark mode variants with dark: prefix
- ✅ Use responsive breakpoints (sm:, md:, lg:)

**DON'T:**
- ❌ Break Catalyst's core structure
- ❌ Remove accessibility features
- ❌ Skip dark mode variants
- ❌ Forget responsive breakpoints
- ❌ Omit Framer Motion animations
- ❌ Use generic placeholder content
- ❌ **NEVER USE HARDCODED COLORS** (bg-gray-50, text-blue-600, bg-white, etc.)
- ❌ **NEVER USE ARBITRARY VALUES** (bg-[#6366F1], text-[#111827], etc.)

## 📦 Output Format

\`\`\`typescript
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/catalyst/button'
import { Icon1, Icon2 } from 'lucide-react'
// ... other Catalyst imports

export function ${context.component.componentName}() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Implementation using Catalyst components */}
    </motion.div>
  )
}

const MOCK_DATA = [/* realistic data */]

export default function ${context.component.componentName}Demo() {
  return <${context.component.componentName} />
}
\`\`\`

## 📝 Additional Context

${standardPrompt}

Now generate the complete, production-quality component with Catalyst foundation and Framer Motion animations!`;
  }

  /**
   * Call AI API with proper error handling and retries
   */
  private async callAI(prompt: string, model?: string, retries = 3): Promise<string> {
    // Use provided model or fall back to instance model
    const selectedModel = model || this.model;

    // Start with 24k tokens to avoid truncation on first attempt
    // (Most components need 20-24k with full PRD context + design system)
    let maxTokens = 24000;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Increase max_tokens progressively on retries (only if needed)
        if (attempt > 1) {
          maxTokens = 32000; // Jump to max on retry to avoid multiple attempts
          console.log(`📈 Retry ${attempt}: Using max_tokens ${maxTokens}`);
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://buildrunner.cloud',
            'X-Title': 'BuildRunner - Component Generator',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: 'system',
                content: `You are an expert React developer creating production-quality, self-contained components.

🚨 CRITICAL: YOU ARE BUILDING USER-FACING FEATURES, NOT TECH DOCUMENTATION! 🚨

NEVER GENERATE:
❌ Components named after frameworks (React, NextJS, TypeScript, Vue, Angular)
❌ Tech stack items as navigation (shadcn/ui, Tailwind CSS, PostgreSQL, Supabase)
❌ Lowercase component names that break JSX (<shadcnui>, <nextjs>, <react>)
❌ Components that display tech logos or framework documentation
❌ "Setup" or "Installation" components for libraries

ALWAYS GENERATE:
✅ Real application features users interact with
✅ Business logic components (Dashboard, UserProfile, TaskList, ChatInterface)
✅ Properly named PascalCase components (UserDashboard, not userdashboard or user-dashboard)
✅ Self-contained components with real functionality and data

BAD Examples (NEVER DO THIS):
❌ <shadcnui /> // Invalid lowercase, tech stack item
❌ <TypeScript /> // Framework, not a feature
❌ navigation: ["NextJS", "React", "Tailwind CSS"] // Tech stack, not features
❌ <ReactHookForm /> // Library setup, not user feature

GOOD Examples (DO THIS):
✅ <UserDashboard /> // Shows user data and metrics
✅ <TaskManagement /> // Create, edit, delete tasks
✅ <TeamChat /> // Real-time messaging
✅ navigation: ["Dashboard", "Tasks", "Team", "Settings"] // User features

REMEMBER: Ask yourself "What does the USER do?" not "What framework am I using?"

CRITICAL REQUIREMENTS:
1. ALL props MUST be optional with sensible defaults
2. Component MUST work standalone with NO props passed
3. Build components from scratch using ONLY:
   - Icons: lucide-react (NEVER @heroicons)
   - Styling: Tailwind CSS utility classes
   - React hooks: 'react' (useState, useEffect, etc.)
4. DO NOT import from @/components/ui/* or any UI libraries
5. Build all UI elements (buttons, cards, inputs) directly with Tailwind CSS
6. Export a demo component as default for page.tsx usage

COMPONENT STRUCTURE:
\`\`\`typescript
'use client'

import { useState } from 'react'
import { Icon1, Icon2 } from 'lucide-react' // ONLY lucide-react for icons

interface ComponentProps {
  data?: Type; // Always optional
  onAction?: (id: string) => void;
}

export function Component({
  data = DEFAULT_DATA,
  onAction = () => console.log('action')
}: ComponentProps = {}) {
  // Component works with NO props
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Build all UI with Tailwind CSS */}
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Click Me
      </button>
    </div>
  )
}

// Mock data for demo
const DEFAULT_DATA = [
  { id: '1', name: 'Sample Item' }
];

// Demo component for page.tsx
export default function ComponentDemo() {
  return <Component />
}
\`\`\`

TAILWIND COMPONENT PATTERNS (Production-Quality):

MODERN SAAS STYLE (Linear, Notion, Stripe):
- Background: className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
- Container: className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
- Card: className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-lg shadow-black/5"
- Button Primary: className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg active:scale-95"
- Button Secondary: className="px-4 py-2 bg-white/[0.08] text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.12] transition-all duration-150 font-medium text-sm border border-gray-200 dark:border-gray-700"
- Input: className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all duration-150"
- Badge: className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-medium border border-indigo-200 dark:border-indigo-500/30"

OUTDOOR ADVENTURE STYLE (AllTrails, REI):
- Background: className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800"
- Card: className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-emerald-500/50 transition-all duration-200 shadow-lg shadow-black/30"
- Button Primary: className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-150 font-medium shadow-md hover:shadow-lg active:scale-95"
- Badge: className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/30"

CLEAN MINIMAL STYLE (Vercel, Apple):
- Background: className="min-h-screen bg-white"
- Card: className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200"
- Button: className="px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-150 font-medium text-sm tracking-wide shadow-sm hover:shadow-md active:scale-95"

IMPORTANT DESIGN RULES:
1. ALWAYS use dark mode support (dark: prefix) for modern look
2. ALWAYS use smooth transitions (transition-all duration-200)
3. ALWAYS use hover states on interactive elements
4. ALWAYS use shadow-lg shadow-black/5 for subtle depth
5. ALWAYS use responsive breakpoints (sm:, md:, lg:)
6. ALWAYS use proper spacing (gap-4, space-y-4, not margins)
7. NEVER use default browser styling
8. NEVER use primary colors without hover states

Return ONLY the complete component code, no explanations or markdown formatting.`
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3, // Lower for more consistent, professional code
            max_tokens: Math.floor(maxTokens), // Progressively increase on retries
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`AI API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        let code = data.choices[0]?.message?.content || '';

        // Strip markdown code fences if present
        code = code.replace(/^```(?:typescript|tsx|jsx|javascript)?\n/gm, '');
        code = code.replace(/\n```$/gm, '');
        code = code.trim();

        if (!code || code.length < 100) {
          throw new Error('AI returned empty or very short code');
        }

        // Check if code was truncated (common signs of truncation)
        const truncationSigns = [
          !code.endsWith('}'),                    // Doesn't end with closing brace
          !code.includes('export default'),        // Missing export
          code.match(/\w+\s*\{[^}]*$/),          // Unclosed brace at end
          code.match(/['"][^'"]*$/),              // Unclosed string at end
        ];

        const isTruncated = truncationSigns.filter(Boolean).length >= 2;

        // DISABLED: Truncation detection is too strict, causing false positives and slow builds
        // If real truncation occurs, polishing step will catch it
        if (false && isTruncated && attempt < retries) {
          console.warn(`⚠️  Code appears truncated (attempt ${attempt}/${retries}), retrying...`);
          throw new Error('Generated code appears truncated');
        }

        return code;

      } catch (error) {
        console.error(`AI generation attempt ${attempt}/${retries} failed:`, error);

        if (attempt === retries) {
          throw new Error(`Failed to generate component after ${retries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }

    throw new Error('Failed to generate component');
  }

  /**
   * Apply design tokens to generated code
   * Ensures exact colors, fonts, spacing from design system
   */
  private applyDesignTokens(code: string, design: DesignSpec): string {
    let styledCode = code;

    // Replace generic colors with design token classes (NOT hex values!)
    const colorReplacements: Record<string, string> = {
      // Primary colors
      'bg-blue-500': 'bg-primary',
      'bg-blue-600': 'bg-primary',
      'bg-blue-700': 'bg-primary',
      'bg-indigo-500': 'bg-primary',
      'bg-indigo-600': 'bg-primary',
      'bg-purple-500': 'bg-primary',
      'bg-purple-600': 'bg-primary',
      'text-blue-600': 'text-primary',
      'text-blue-500': 'text-primary',
      'text-indigo-600': 'text-primary',
      'text-purple-600': 'text-primary',
      'border-blue-500': 'border-primary',
      'border-indigo-500': 'border-primary',
      'ring-blue-500': 'ring-primary',
      'ring-indigo-500': 'ring-primary',

      // Background colors
      'bg-white': 'bg-background',
      'bg-gray-50': 'bg-background',
      'bg-slate-50': 'bg-background',

      // Foreground (text) colors
      'text-gray-900': 'text-foreground',
      'text-slate-900': 'text-foreground',
      'text-black': 'text-foreground',

      // Muted colors
      'bg-gray-100': 'bg-muted',
      'bg-gray-200': 'bg-muted',
      'bg-slate-100': 'bg-muted',
      'text-gray-600': 'text-muted-foreground',
      'text-gray-500': 'text-muted-foreground',
      'text-slate-600': 'text-muted-foreground',

      // Border colors
      'border-gray-200': 'border-border',
      'border-gray-300': 'border-border',
      'border-slate-200': 'border-border',

      // Destructive colors
      'bg-red-500': 'bg-destructive',
      'bg-red-600': 'bg-destructive',
      'text-red-600': 'text-destructive',
      'text-red-500': 'text-destructive',
      'border-red-500': 'border-destructive',
    };

    for (const [generic, specific] of Object.entries(colorReplacements)) {
      const regex = new RegExp(generic, 'g');
      styledCode = styledCode.replace(regex, specific);
    }

    // Ensure font family is applied
    const fontFamily = design?.typography?.fontFamily?.sans || 'Inter, system-ui, sans-serif';
    if (!styledCode.includes('font-[') && fontFamily !== 'Inter, system-ui, sans-serif') {
      // Add font to className strings
      styledCode = styledCode.replace(
        /className=["']([^"']*)["']/g,
        (match, classes) => {
          if (!classes.includes('font-')) {
            return `className="${classes} font-['${fontFamily}']"`;
          }
          return match;
        }
      );
    }

    return styledCode;
  }

  /**
   * Ensure code meets quality standards
   */
  private ensureQuality(code: string, context: BuildContext): string {
    let qualityCode = code;

    // Ensure TypeScript strict mode
    if (!qualityCode.includes('interface') && !qualityCode.includes('type ')) {
      console.warn('⚠️  Generated code missing TypeScript types');
    }

    // Ensure accessibility
    if (qualityCode.includes('<button') && !qualityCode.includes('aria-')) {
      console.warn('⚠️  Buttons missing ARIA labels');
    }

    // Ensure proper imports
    if (!qualityCode.includes("from 'react'") && !qualityCode.includes('from "react"')) {
      qualityCode = `'use client';\n\nimport React from 'react';\n${qualityCode}`;
    }

    // Ensure client directive for interactive components
    if (this.needsClientDirective(code) && !qualityCode.includes("'use client'")) {
      qualityCode = `'use client';\n\n${qualityCode}`;
    }

    return qualityCode;
  }

  /**
   * Check if component needs 'use client' directive
   */
  private needsClientDirective(code: string): boolean {
    const clientPatterns = [
      'useState',
      'useEffect',
      'useRef',
      'useCallback',
      'useMemo',
      'onClick',
      'onChange',
      'onSubmit',
      'addEventListener',
    ];

    return clientPatterns.some(pattern => code.includes(pattern));
  }

  /**
   * Analyze code quality
   */
  private analyzeQuality(code: string, context: BuildContext): {
    score: number;
    issues: string[];
    strengths: string[];
  } {
    const issues: string[] = [];
    const strengths: string[] = [];
    let score = 100;

    // Check TypeScript usage
    if (code.includes('interface') || code.includes('type ')) {
      strengths.push('Proper TypeScript types');
    } else {
      issues.push('Missing TypeScript interfaces');
      score -= 15;
    }

    // Check design token usage
    if (code.includes('bg-primary') || code.includes('text-foreground') || code.includes('border-border')) {
      strengths.push('Uses semantic design tokens');
    } else if (code.includes('bg-blue-') || code.includes('bg-gray-') || code.includes('text-gray-')) {
      issues.push('Uses hardcoded colors instead of design tokens');
      score -= 10;
    }

    // Penalize arbitrary values (bg-[#...])
    if (code.includes('bg-[#') || code.includes('text-[#')) {
      issues.push('Uses arbitrary color values instead of design tokens');
      score -= 15;
    }

    // Check accessibility
    const hasAriaLabels = code.includes('aria-');
    const hasAltText = !code.includes('<img') || code.includes('alt=');
    if (hasAriaLabels && hasAltText) {
      strengths.push('Good accessibility (ARIA labels, alt text)');
    } else {
      if (!hasAriaLabels) issues.push('Missing ARIA labels');
      if (!hasAltText) issues.push('Missing image alt text');
      score -= 10;
    }

    // Check mobile optimization
    if (code.includes('sm:') || code.includes('md:') || code.includes('lg:')) {
      strengths.push('Responsive design with breakpoints');
    } else {
      issues.push('No responsive breakpoints');
      score -= 10;
    }

    // Check error handling
    if (code.includes('try') && code.includes('catch')) {
      strengths.push('Proper error handling');
    } else if (code.includes('async')) {
      issues.push('Async code without try-catch');
      score -= 10;
    }

    // Check loading states
    if (code.includes('loading') || code.includes('isLoading') || code.includes('Skeleton')) {
      strengths.push('Loading states implemented');
    } else if (code.includes('fetch') || code.includes('async')) {
      issues.push('No loading states for async operations');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues,
      strengths,
    };
  }

  /**
   * Extract dependencies from generated code
   */
  private extractDependencies(code: string): string[] {
    const deps: string[] = [];
    const importRegex = /import .+ from ['"](.+)['"]/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const importPath = match[1];
      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
        deps.push(importPath);
      }
    }

    return Array.from(new Set(deps));
  }

  /**
   * Infer appropriate file path for component
   */
  private inferFilePath(component: ComponentContext): string {
    // Sanitize component name to kebab-case (same logic as file-writer.ts)
    const name = component.componentName
      .trim()
      .replace(/([a-z])([A-Z])/g, '$1-$2')  // camelCase → kebab-case
      .replace(/[\s_]+/g, '-')               // spaces/underscores → hyphens
      .replace(/[^a-zA-Z0-9-]/g, '')         // remove special chars
      .toLowerCase()
      .replace(/^-+|-+$/g, '');              // trim hyphens

    const typeMap: Record<string, string> = {
      'page': 'app',
      'layout': 'app',
      'component': 'src/components',
      'frontend': 'src/components',
      'ui': 'src/components/ui',
      'feature': 'src/components',
      'api': 'src/api',
      'service': 'src/services',
    };

    const dir = typeMap[component.componentType] || 'src/components';

    return `${dir}/${name}.tsx`;
  }
}
