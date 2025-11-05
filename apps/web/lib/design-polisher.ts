/**
 * Design Polisher
 * Automatically adds polish, micro-interactions, and ensures consistency
 * across all generated components.
 */

import { DesignSpec } from './design-system-generator';
import { StyledComponent } from './component-designer';

export interface PolishResult {
  polishedCode: string;
  improvementsApplied: string[];
  consistencyScore: number;
}

export class DesignPolisher {
  private apiKey: string;

  // Micro-interaction patterns that make apps feel premium
  private microInteractionPatterns = {
    buttons: `
      hover:scale-[1.02]
      active:scale-[0.98]
      transition-all duration-150 ease-out
      hover:shadow-lg hover:shadow-primary/20`,

    cards: `
      hover:-translate-y-1
      hover:shadow-2xl hover:shadow-black/5
      transition-all duration-300 ease-out
      cursor-pointer`,

    inputs: `
      focus:ring-2 focus:ring-primary/50
      focus:border-primary
      transition-all duration-200 ease-out
      focus:shadow-lg focus:shadow-primary/10`,

    links: `
      hover:text-primary
      relative
      after:absolute after:bottom-0 after:left-0
      after:h-[2px] after:w-0
      hover:after:w-full
      after:bg-primary
      after:transition-all after:duration-300 after:ease-out`,

    modals: `
      animate-in fade-in-0 zoom-in-95
      duration-300 ease-out`,

    dropdowns: `
      animate-in fade-in-0 slide-in-from-top-2
      duration-200 ease-out`,

    toasts: `
      animate-in slide-in-from-right-full
      duration-300 ease-out`,
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Polish all components for consistency and add micro-interactions
   */
  async polishApp(
    components: StyledComponent[],
    designSystem: DesignSpec
  ): Promise<PolishResult[]> {
    console.log(`✨ Polishing ${components.length} components...`);

    const results: PolishResult[] = [];

    for (const component of components) {
      const result = await this.polishComponent(component, designSystem);
      results.push(result);
    }

    console.log(`✅ Polish complete! Applied ${results.reduce((sum, r) => sum + r.improvementsApplied.length, 0)} improvements`);

    return results;
  }

  /**
   * Polish a single component
   */
  private async polishComponent(
    component: StyledComponent,
    designSystem: DesignSpec
  ): Promise<PolishResult> {
    const prompt = `Review and polish this React component to ensure it follows best practices and modern design standards.

**Design System:**
${JSON.stringify(designSystem, null, 2)}

**Component Code:**
\`\`\`typescript
${component.code}
\`\`\`

**Fix ANY inconsistencies:**

1. **Color Consistency:**
   - ALL colors must match the design system exactly
   - Use: ${designSystem.colorPalette.primary} for primary
   - Use: ${designSystem.colorPalette.background} for background
   - Use: ${designSystem.colorPalette.border} for borders
   - Replace any hardcoded colors (like #6366F1, blue-500, etc.)

2. **Spacing Consistency:**
   - Use spacing from the system: ${designSystem.designTokens.spacing.scale.join(', ')}
   - Ensure consistent gap, padding, margin usage
   - Remove any arbitrary spacing values

3. **Interactive States:**
   - EVERY button needs: hover, focus, active, disabled states
   - EVERY card needs: hover state with shadow/scale
   - EVERY input needs: focus ring and border highlight
   - EVERY link needs: hover color and underline animation

4. **Dark Mode:**
   - Every color needs dark: variant
   - Ensure dark mode looks professional
   - Test contrast ratios

5. **Typography:**
   - Font family: ${designSystem.typography.fontFamily.sans}
   - Use scale: ${Object.entries(designSystem.typography.scale).map(([k, v]) => `${k}: ${v}`).join(', ')}
   - Consistent line heights and letter spacing

**Add these polish elements if missing:**

1. **Loading Skeletons** (for data lists):
\`\`\`tsx
{isLoading ? (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
  </div>
) : (
  {/* actual content */}
)}
\`\`\`

2. **Empty States** (when no data):
\`\`\`tsx
{data.length === 0 ? (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No items yet</h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm">Get started by creating your first item</p>
  </div>
) : (
  {/* actual list */}
)}
\`\`\`

3. **Error States** (for forms, API calls):
\`\`\`tsx
{error && (
  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
  </div>
)}
\`\`\`

4. **Micro-Interactions:**
   - Buttons: hover:scale-[1.02] active:scale-[0.98] transition-all duration-150
   - Cards: hover:-translate-y-1 hover:shadow-2xl transition-all duration-300
   - Inputs: focus:ring-2 focus:ring-primary/50 transition-all duration-200

5. **Accessibility:**
   - Add ARIA labels to all buttons
   - Add alt text to all images
   - Ensure keyboard navigation works
   - Add focus-visible indicators

**CRITICAL:** Maintain all existing functionality. Only improve styling and UX.

**OUTPUT FORMAT:**
Return ONLY the complete polished TypeScript/TSX code.
- NO explanations
- NO markdown code fences (no \`\`\`)
- NO commentary
- Start directly with the code ('use client' or import statement)
- Just pure, clean, polished code

BEGIN CODE OUTPUT NOW:`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://buildrunner.cloud',
          'X-Title': 'BuildRunner - Design Polisher',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.2, // Very low for consistent polish
          max_tokens: 32000,
        }),
      });

      if (!response.ok) {
        console.warn(`Polish failed, using original component`);
        return {
          polishedCode: component.code,
          improvementsApplied: [],
          consistencyScore: 70,
        };
      }

      const data = await response.json();
      let polishedCode = data.choices[0].message.content;

      // Extract code from markdown code blocks (robust extraction)
      const codeBlockMatch = polishedCode.match(/```(?:typescript|tsx|jsx|javascript)?\n([\s\S]+?)\n```/);

      if (codeBlockMatch) {
        // Found code in markdown block - use it
        polishedCode = codeBlockMatch[1];
      } else {
        // No markdown blocks - strip any explanatory text before code
        // Look for common code starting patterns
        const codeStartPatterns = [
          /^['"]use client['"]/m,
          /^['"]use server['"]/m,
          /^import\s+/m,
          /^export\s+/m,
          /^\/\*\*/m,
          /^\/\//m,
          /^const\s+/m,
          /^function\s+/m,
          /^interface\s+/m,
          /^type\s+/m,
        ];

        for (const pattern of codeStartPatterns) {
          const match = polishedCode.match(pattern);
          if (match && match.index !== undefined) {
            // Found code start - extract from there
            polishedCode = polishedCode.substring(match.index);
            break;
          }
        }

        // Clean up any remaining markdown artifacts
        polishedCode = polishedCode.replace(/^```(?:typescript|tsx|jsx|javascript)?\n/gm, '');
        polishedCode = polishedCode.replace(/\n```$/gm, '');
      }

      polishedCode = polishedCode.trim();

      const improvementsApplied = this.detectImprovements(component.code, polishedCode);
      const consistencyScore = this.calculateConsistencyScore(polishedCode, designSystem);

      return {
        polishedCode,
        improvementsApplied,
        consistencyScore,
      };

    } catch (error) {
      console.error('Polish failed:', error);
      return {
        polishedCode: component.code,
        improvementsApplied: [],
        consistencyScore: 70,
      };
    }
  }

  /**
   * Add micro-interactions to components programmatically
   */
  addMicroInteractions(code: string): string {
    let enhanced = code;

    // Add button interactions
    enhanced = enhanced.replace(
      /className="([^"]*?)button([^"]*?)"/g,
      (match, before, after) => {
        if (match.includes('hover:scale') || match.includes('transition-all')) {
          return match; // Already has interactions
        }
        return `className="${before}button${after} hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 ease-out hover:shadow-lg"`;
      }
    );

    // Add card interactions
    enhanced = enhanced.replace(
      /className="([^"]*?)(?:card|rounded-(?:lg|xl|2xl|3xl))([^"]*?)"/g,
      (match, before, after) => {
        if (match.includes('hover:-translate-y') || match.includes('hover:shadow')) {
          return match; // Already has interactions
        }
        return `className="${before}rounded${after} hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out"`;
      }
    );

    // Add input focus states
    enhanced = enhanced.replace(
      /className="([^"]*?)(?:input|<input)([^"]*?)"/g,
      (match, before, after) => {
        if (match.includes('focus:ring') || match.includes('focus:border')) {
          return match; // Already has focus states
        }
        return `className="${before}input${after} focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"`;
      }
    );

    return enhanced;
  }

  /**
   * Detect what improvements were applied
   */
  private detectImprovements(original: string, polished: string): string[] {
    const improvements: string[] = [];

    if (polished.includes('animate-pulse') && !original.includes('animate-pulse')) {
      improvements.push('Added loading skeletons');
    }

    if (polished.includes('Empty state') || (polished.includes('length === 0') && !original.includes('length === 0'))) {
      improvements.push('Added empty states');
    }

    if (polished.includes('error') && polished.includes('bg-red')) {
      improvements.push('Added error states');
    }

    if (polished.includes('hover:scale') && !original.includes('hover:scale')) {
      improvements.push('Added button micro-interactions');
    }

    if (polished.includes('hover:-translate-y') && !original.includes('hover:-translate-y')) {
      improvements.push('Added card hover effects');
    }

    if (polished.includes('focus:ring') && !original.includes('focus:ring')) {
      improvements.push('Added focus states');
    }

    if (polished.includes('dark:') && original.split('dark:').length < polished.split('dark:').length) {
      improvements.push('Enhanced dark mode support');
    }

    if (polished.includes('aria-') && !original.includes('aria-')) {
      improvements.push('Added accessibility labels');
    }

    if (polished.includes('transition-') && !original.includes('transition-')) {
      improvements.push('Added smooth transitions');
    }

    return improvements;
  }

  /**
   * Calculate how consistent the component is with the design system
   */
  private calculateConsistencyScore(code: string, designSystem: DesignSpec): number {
    let score = 100;

    // Check primary color usage
    if (!code.includes(designSystem.colorPalette.primary)) {
      score -= 15;
    }

    // Check for hardcoded colors (bad)
    if (code.match(/#[0-9A-Fa-f]{6}/g)) {
      score -= 10;
    }

    // Check for dark mode
    if (!code.includes('dark:')) {
      score -= 20;
    }

    // Check for transitions
    if (!code.includes('transition-')) {
      score -= 10;
    }

    // Check for hover states
    if (!code.includes('hover:')) {
      score -= 15;
    }

    // Check for focus states
    if (!code.includes('focus:')) {
      score -= 10;
    }

    // Check for proper spacing
    if (!code.includes('gap-') && !code.includes('space-')) {
      score -= 10;
    }

    // Bonus for micro-interactions
    if (code.includes('scale-[1.02]')) {
      score += 5;
    }

    // Bonus for loading states
    if (code.includes('animate-pulse') || code.includes('isLoading')) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }
}
