/**
 * AI Component Generator
 * Uses context-aware prompts to generate production-quality components
 */

import { ContextBuilder, BuildContext, PRDContext, ComponentContext } from './context-builder';
import { DesignSpec } from './design-system-generator';

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

  constructor(apiKey: string, model: string = 'anthropic/claude-sonnet-4') {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Generate a component with full PRD and design context
   */
  async generateComponent(context: BuildContext): Promise<GenerationResult> {
    // Build the comprehensive prompt
    const prompt = ContextBuilder.buildComponentPrompt(context);

    console.log(`🎨 Generating ${context.component.componentName} with full context...`);
    console.log(`📝 Prompt length: ${prompt.length} characters`);

    // Generate code with AI
    const rawCode = await this.callAI(prompt);

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
   * Call AI API with proper error handling and retries
   */
  private async callAI(prompt: string, retries = 3): Promise<string> {
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
            model: this.model,
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

        if (isTruncated && attempt < retries) {
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

    // Replace generic colors with exact hex values
    const colorReplacements: Record<string, string> = {
      'bg-blue-500': `bg-[${design.colorPalette.primary}]`,
      'bg-blue-600': `bg-[${design.colorPalette.primary}]`,
      'bg-blue-700': `bg-[${design.colorPalette.primary}]`,
      'text-blue-600': `text-[${design.colorPalette.primary}]`,
      'text-blue-500': `text-[${design.colorPalette.primary}]`,
      'border-blue-500': `border-[${design.colorPalette.primary}]`,
      'ring-blue-500': `ring-[${design.colorPalette.primary}]`,

      'bg-gray-100': `bg-[${design.colorPalette.muted}]`,
      'bg-gray-50': `bg-[${design.colorPalette.background}]`,
      'text-gray-900': `text-[${design.colorPalette.foreground}]`,
      'border-gray-200': `border-[${design.colorPalette.border}]`,

      'bg-red-500': `bg-[${design.colorPalette.destructive}]`,
      'bg-red-600': `bg-[${design.colorPalette.destructive}]`,
      'text-red-600': `text-[${design.colorPalette.destructiveForeground}]`,
    };

    for (const [generic, specific] of Object.entries(colorReplacements)) {
      const regex = new RegExp(generic, 'g');
      styledCode = styledCode.replace(regex, specific);
    }

    // Ensure font family is applied
    if (!styledCode.includes('font-[') && design.typography.fontFamily.sans !== 'Inter, system-ui, sans-serif') {
      // Add font to className strings
      styledCode = styledCode.replace(
        /className=["']([^"']*)["']/g,
        (match, classes) => {
          if (!classes.includes('font-')) {
            return `className="${classes} font-['${design.typography.fontFamily.sans}']"`;
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
    if (code.includes(`bg-[${context.design.colorPalette.primary}]`)) {
      strengths.push('Uses exact design tokens');
    } else if (code.includes('bg-blue-')) {
      issues.push('Uses generic colors instead of design tokens');
      score -= 10;
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
