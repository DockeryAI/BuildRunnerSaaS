/**
 * Component Designer
 * Generates beautifully designed components using AI with modern design patterns
 * and industry-specific styling guidance.
 */

import { DesignSpec } from './design-system-generator';
import { AdvancedDesignSystem, getAdvancedDesignSystem } from './advanced-design-system';
import { DESIGN_SYSTEM as FOUNDATION, motionVariants } from './design-system/foundation';
import { PREMIUM_COMPONENT_TEMPLATES } from './design-system/premium-components';
import { selectPreset } from './design-system/presets';
import { CatalystIntegrator } from './catalyst/integrator';
import { CATALYST_PATTERNS } from './catalyst/patterns';

export interface ComponentSpec {
  name: string;
  type: string;
  purpose: string;
  requirements: string[];
  data?: any;
}

export interface StyledComponent {
  code: string;
  designTokensUsed: string[];
  accessibility: {
    score: number;
    issues: string[];
  };
  modernPatterns: string[];
}

export class ComponentDesigner {
  private apiKey: string;
  private catalystIntegrator: CatalystIntegrator;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.catalystIntegrator = new CatalystIntegrator();
  }

  /**
   * Design a component with modern patterns and design system
   * Now with Catalyst UI integration for premium components!
   */
  async designComponent(
    component: ComponentSpec,
    designSystem: DesignSpec
  ): Promise<StyledComponent> {
    console.log(`🎨 Designing ${component.type}: ${component.name}`);

    // Check if we should use Catalyst as foundation
    const catalystIntegration = await this.catalystIntegrator.integrateWithCatalyst(
      component,
      designSystem
    );

    let prompt: string;

    if (catalystIntegration.useCatalyst) {
      console.log(`✨ Using Catalyst UI foundation: ${catalystIntegration.baseComponents.join(', ')}`);
      // Build prompt with Catalyst components as base
      prompt = this.buildCatalystComponentPrompt(component, designSystem, catalystIntegration);
    } else {
      // Fallback to standard prompt
      prompt = this.buildComponentPrompt(component, designSystem);
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://buildrunner.cloud',
          'X-Title': 'BuildRunner - Component Designer',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{
            role: 'system',
            content: this.getDesignerSystemPrompt()
          }, {
            role: 'user',
            content: prompt
          }],
          temperature: 0.3, // Lower for consistent, production code
          max_tokens: 24000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Component design failed: ${response.statusText}`);
      }

      const data = await response.json();
      let code = data.choices[0].message.content;

      // Strip markdown code fences
      code = code.replace(/^```(?:typescript|tsx|jsx|javascript)?\n/gm, '');
      code = code.replace(/\n```$/gm, '');
      code = code.trim();

      const modernPatterns = this.detectModernPatterns(code);
      const designTokensUsed = this.extractUsedTokens(code, designSystem);
      const accessibility = await this.checkAccessibility(code);

      console.log(`✅ Designed ${component.name} with ${modernPatterns.length} modern patterns`);

      return {
        code,
        designTokensUsed,
        accessibility,
        modernPatterns
      };

    } catch (error) {
      console.error(`Component design failed for ${component.name}:`, error);
      throw error;
    }
  }

  private getDesignerSystemPrompt(): string {
    return `You are an expert React developer and UI designer who creates production-quality components for PREMIUM applications.

You specialize in modern design patterns used by companies like Linear, Stripe, Vercel, Airbnb, and Notion.

CRITICAL RULES:
❌ NEVER generate plain white backgrounds or basic Bootstrap-style components
❌ NEVER use default HTML form inputs without styling
❌ NEVER create empty sections - always include rich placeholder content
❌ NEVER skip hover states, loading states, or empty states
❌ NEVER forget to import and use Framer Motion for animations
✅ ALWAYS use Framer Motion for ALL animations (motion.div, motion.button, etc.)
✅ ALWAYS use dark themes or rich gradients as the base
✅ ALWAYS include glassmorphic effects with backdrop-blur
✅ ALWAYS add micro-animations to ALL interactive elements
✅ ALWAYS create professional, polished UIs that look like $100k custom apps
✅ ALWAYS use AnimatePresence for conditional rendering

MODERN DESIGN PATTERNS YOU MUST USE:

1. **Glass Morphism** (for modals, overlays, cards):
   - backdrop-blur-xl bg-white/10 border border-white/20
   - Creates that frosted glass effect

2. **Subtle Gradients** (backgrounds, cards):
   - bg-gradient-to-br from-primary/5 to-transparent
   - bg-gradient-to-r from-primary to-secondary
   - Never harsh gradients, always subtle

3. **Color-Tinted Shadows**:
   - shadow-2xl shadow-primary/10
   - shadow-lg shadow-black/5
   - Makes shadows feel integrated with brand

4. **Border Gradients** (premium cards):
   - relative before:absolute before:inset-0 before:rounded-2xl
   - before:bg-gradient-to-r before:from-primary before:to-secondary
   - before:p-[1px] before:-z-10

5. **Smooth Rounded Corners**:
   - rounded-2xl or rounded-3xl for modern feel
   - Never use rounded-sm or rounded-md

6. **Micro-Interactions**:
   - hover:scale-[1.02] active:scale-[0.98]
   - transition-all duration-200 ease-out
   - Every interactive element must have hover state

7. **Dark Mode Excellence**:
   - ALWAYS support dark mode with dark: prefix
   - Dark backgrounds: dark:bg-gray-900 dark:bg-gray-800
   - Dark text: dark:text-white dark:text-gray-300
   - Dark borders: dark:border-gray-700

8. **Loading States**:
   - Skeleton loaders with shimmer effect
   - animate-pulse for loading states
   - Smooth transitions between loading and loaded

9. **Empty States**:
   - Beautiful illustrations or icons
   - Helpful messaging
   - Clear call-to-action

10. **Spacing Perfection**:
    - Use gap-4, gap-6, gap-8 (not margins)
    - space-y-4, space-y-6 for vertical rhythm
    - Generous padding: p-6, p-8, p-12

COMPONENT STRUCTURE REQUIREMENTS:

\`\`\`typescript
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion' // REQUIRED for animations
import { Icon1, Icon2 } from 'lucide-react' // Use relevant icons

interface ComponentProps {
  data?: Type; // Always optional with defaults
  onAction?: () => void;
}

export function Component({
  data = DEFAULT_DATA,
  onAction = () => {}
}: ComponentProps = {}) {
  const [loading, setLoading] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium, polished UI with rich interactions */}
        {/* Use motion.div, motion.button for all interactive elements */}
        {/* Add whileHover and whileTap to buttons */}
      </div>
    </motion.div>
  )
}

const DEFAULT_DATA = [/* mock data */];

export default function ComponentDemo() {
  return <Component />
}
\`\`\`

FRAMER MOTION REQUIREMENTS:
- ALL components must wrap in motion.div with initial/animate
- ALL buttons must be motion.button with whileHover and whileTap
- Use AnimatePresence for conditional elements
- Standard transitions: {{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
- Hover effects: whileHover={{ scale: 1.02, y: -4 }}
- Tap effects: whileTap={{ scale: 0.98 }}
- Stagger children with staggerChildren in parent variants

ACCESSIBILITY REQUIREMENTS:
- All interactive elements have proper ARIA labels
- Color contrast meets WCAG AA (4.5:1 for text)
- Keyboard navigation works perfectly
- Focus rings are visible and beautiful
- Alt text on all images

Return ONLY the complete component code, no explanations.`;
  }

  private buildComponentPrompt(component: ComponentSpec, designSystem: DesignSpec): string {
    const inspiration = this.getInspirationForType(component.type);

    // Get advanced design system for the component's purpose
    const advancedDesign = getAdvancedDesignSystem(component.purpose);
    const { palette, motifs, classes } = advancedDesign;

    return `Using this exact design system:

\`\`\`json
${JSON.stringify(designSystem, null, 2)}
\`\`\`

Create a ${component.type} component for: ${component.purpose}

**Component Name:** ${component.name}

**Requirements:**
${component.requirements.map(r => `- ${r}`).join('\n')}

**Design Inspiration:** ${inspiration}

**ADVANCED COLOR PALETTE (${palette.name}):**
Use these EXACT colors throughout the component:
- Primary: ${palette.colors.primary}
- Secondary: ${palette.colors.secondary}
- Accent: ${palette.colors.accent}
- Background Base: ${palette.colors.background.base}
- Background Elevated: ${palette.colors.background.elevated}
- Text Primary: ${palette.colors.text.primary}
- Text Secondary: ${palette.colors.text.secondary}
- Border: ${palette.colors.border.default}

**PREMIUM GRADIENTS:**
Use inline styles for these gradients:
- Hero Background: style={{ background: '${palette.gradients.hero}' }}
- Card Background: style={{ background: '${palette.gradients.card}' }}
- Button Background: style={{ background: '${palette.gradients.button}' }}
- Accent: style={{ background: '${palette.gradients.accent}' }}

**COLORED SHADOWS:**
- Small: shadow-sm (use: ${palette.shadows.sm})
- Medium: shadow-md (use: ${palette.shadows.md})
- Large: shadow-lg (use: ${palette.shadows.lg})
- Extra Large: shadow-xl (use: ${palette.shadows.xl})
- Colored Glow: shadow-2xl (use: ${palette.shadows.colored})

**CRITICAL STYLING RULES:**

1. **Color Implementation:**
   - Use hex colors directly: bg-[${palette.colors.primary}], text-[${palette.colors.text.primary}]
   - For gradients, use inline styles with the gradient values above
   - For shadows, use className with shadow utilities AND inline style for colored shadows

2. **Modern Design Patterns:**
   - Glass morphism: ${motifs.glassmorphism.classes}
   - Subtle gradients: inline styles with the gradient values above
   - Smooth corners: ${motifs.borders.radius}
   - Micro-interactions: ${motifs.animations.hover}

3. **All Interactive States:**
   - Default: Base styling
   - Hover: Enhanced (scale, shadow, color)
   - Focus: Ring with ring-2 ring-primary/50
   - Active: Pressed effect with scale-[0.98]
   - Disabled: opacity-50 cursor-not-allowed

4. **Responsive Design:**
   - Mobile-first approach
   - sm: for tablets (640px+)
   - md: for laptops (768px+)
   - lg: for desktops (1024px+)
   - xl: for large screens (1280px+)

5. **Dark Mode:**
   - Every color must have dark: variant
   - Test that dark mode looks amazing
   - Use appropriate contrasts

6. **Loading & Empty States:**
   - Beautiful skeleton loaders
   - Helpful empty states
   - Smooth transitions

Make it look as polished as ${inspiration}. Focus on:
- Professional, modern aesthetic
- Smooth animations and transitions
- Perfect spacing and typography
- Excellent dark mode support
- Delightful micro-interactions

Output a complete, production-ready React component.`;
  }

  /**
   * Build prompt using Catalyst UI components as foundation
   */
  private buildCatalystComponentPrompt(
    component: ComponentSpec,
    designSystem: DesignSpec,
    catalystIntegration: any
  ): string {
    return `# PREMIUM COMPONENT GENERATION WITH CATALYST UI FOUNDATION

You are customizing production-quality Catalyst UI components - the same premium components used by professional development teams.

**Component to Build:** ${component.type}
**Component Name:** ${component.name}
**Purpose:** ${component.purpose}

**Requirements:**
${component.requirements.map(r => `- ${r}`).join('\n')}

## Available Catalyst Components

${catalystIntegration.catalystSource}

## Design System to Apply

\`\`\`json
${JSON.stringify(designSystem, null, 2)}
\`\`\`

## Customization Instructions

${catalystIntegration.customizationPrompt}

## Catalyst Pattern Guidelines

**Color System:**
- Always use dark: variants: \`text-zinc-950 dark:text-white\`
- Borders: \`border-zinc-950/10 dark:border-white/10\`
- Backgrounds: \`bg-white dark:bg-zinc-900\`

**Interactive States:**
- Use data-* attributes: \`data-hover:bg-zinc-950/2.5 dark:data-hover:bg-white/5\`
- Focus: \`data-focus:outline-2 data-focus:outline-blue-500\`
- Active: \`data-active:bg-zinc-950/5\`
- Disabled: \`data-disabled:opacity-50\`

**Spacing:**
- Use CSS variables: \`px-(--gutter,--spacing(2))\`
- Consistent padding: \`px-4 py-2.5\`

**Responsive:**
- Mobile-first with lg: breakpoint
- Example: \`flex flex-col lg:flex-row\`

## Critical Rules

1. **Maintain Catalyst Quality**
   - DO NOT break the existing Catalyst structure
   - DO NOT remove accessibility features
   - DO keep the professional spacing and typography

2. **Add Framer Motion**
   - Wrap main component in motion.div with entrance animation
   - Add whileHover to interactive elements
   - Use AnimatePresence for conditional rendering

3. **Customize Appropriately**
   - Apply design system colors
   - Add specific content for the use case
   - Include realistic mock data
   - Implement required functionality

4. **Output Format**
\`\`\`typescript
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/catalyst/button'
// ... other Catalyst imports

export function ${component.name}() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-zinc-900"
    >
      {/* Your implementation using Catalyst components */}
    </motion.div>
  )
}

const MOCK_DATA = [/* realistic mock data */]

export default function ${component.name}Demo() {
  return <${component.name} />
}
\`\`\`

Generate the complete component now, maintaining Catalyst's premium quality while customizing for the specific requirements:`;
  }

  private getInspirationForType(type: string): string {
    const inspirations: Record<string, string> = {
      'dashboard': 'Linear Dashboard or Stripe Analytics',
      'data-table': 'Notion Database or Airtable',
      'kanban': 'Linear Board View or GitHub Projects',
      'chat': 'Discord or Slack',
      'profile': 'GitHub Profile or Twitter/X',
      'settings': 'Vercel Settings or Railway Dashboard',
      'landing': 'Stripe Homepage or Framer Landing',
      'form': 'Linear Settings or Notion Forms',
      'card': 'Linear Issue Card or GitHub Repo Card',
      'modal': 'Linear Command Palette or Vercel Dialog',
      'navigation': 'Linear Sidebar or GitHub Navigation',
      'hero': 'Stripe Hero or Vercel Homepage',
      'pricing': 'Stripe Pricing or Vercel Pricing',
      'authentication': 'Vercel Login or GitHub Auth',
      'analytics': 'Linear Analytics or Stripe Dashboard',
      'calendar': 'Cal.com or Calendly',
      'map': 'AllTrails or Google Maps',
      'gallery': 'Unsplash or Pinterest',
      'feed': 'Twitter/X Feed or Linear Updates',
      'search': 'Linear Command Palette or Algolia',
    };

    return inspirations[type.toLowerCase()] || 'Linear or Notion';
  }

  private detectModernPatterns(code: string): string[] {
    const patterns: string[] = [];

    if (code.includes('backdrop-blur')) patterns.push('Glass Morphism');
    if (code.includes('bg-gradient-to')) patterns.push('Subtle Gradients');
    if (code.includes('shadow-') && code.includes('/')) patterns.push('Color-Tinted Shadows');
    if (code.includes('rounded-2xl') || code.includes('rounded-3xl')) patterns.push('Modern Rounded Corners');
    if (code.includes('hover:scale')) patterns.push('Scale Micro-Interactions');
    if (code.includes('dark:')) patterns.push('Dark Mode Support');
    if (code.includes('animate-pulse') || code.includes('animate-')) patterns.push('Loading Animations');
    if (code.includes('transition-')) patterns.push('Smooth Transitions');
    if (code.includes('sm:') && code.includes('md:')) patterns.push('Responsive Design');
    if (code.includes('ring-2') || code.includes('focus:ring')) patterns.push('Focus States');

    return patterns;
  }

  private extractUsedTokens(code: string, designSystem: DesignSpec): string[] {
    const tokens: string[] = [];

    // Check for color usage
    if (code.includes(designSystem?.colorPalette?.primary || '#3B82F6')) tokens.push('primary');
    if (code.includes(designSystem?.colorPalette?.background || '#FFFFFF')) tokens.push('background');
    if (code.includes(designSystem?.colorPalette?.muted || '#F3F4F6')) tokens.push('muted');
    if (code.includes(designSystem?.colorPalette?.border || '#E5E7EB')) tokens.push('border');

    // Check for typography
    if (code.includes(designSystem?.typography?.fontFamily?.sans || 'Inter')) tokens.push('font-sans');

    // Check for spacing
    if (code.includes('gap-') || code.includes('space-')) tokens.push('spacing-system');

    // Check for shadows
    if (designSystem?.designTokens?.shadows) {
      Object.entries(designSystem.designTokens.shadows).forEach(([name, value]) => {
        if (code.includes(`shadow-${name}`)) tokens.push(`shadow-${name}`);
      });
    }

    return Array.from(new Set(tokens));
  }

  private async checkAccessibility(code: string): Promise<{ score: number; issues: string[] }> {
    const issues: string[] = [];
    let score = 100;

    // Check for ARIA labels
    if (code.includes('<button') && !code.includes('aria-')) {
      issues.push('Buttons missing ARIA labels');
      score -= 10;
    }

    // Check for alt text
    if (code.includes('<img') && !code.includes('alt=')) {
      issues.push('Images missing alt text');
      score -= 10;
    }

    // Check for focus indicators
    if (!code.includes('focus:') && !code.includes('focus-visible:')) {
      issues.push('Missing focus indicators');
      score -= 10;
    }

    // Check for keyboard navigation hints
    if ((code.includes('onClick') || code.includes('onSubmit')) && !code.includes('onKeyDown')) {
      issues.push('Consider adding keyboard navigation support');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }
}
