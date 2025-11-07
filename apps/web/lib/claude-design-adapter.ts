/**
 * Claude CLI Design Adapter
 *
 * Formats Material Design 3 design systems for Claude CLI consumption.
 * Automatically injects design tokens into PRDs so Claude generates
 * beautiful, consistent UIs from the start.
 *
 * Phase 2 of Material Design integration.
 */

import { DesignSpec } from './design-system-generator';
import { MaterialDesignSpec } from './material/MaterialThemeAdapter';

export class ClaudeDesignAdapter {
  /**
   * Format design spec as Claude-friendly markdown
   * This gets injected into PRD.md that Claude CLI reads
   */
  static formatDesignSystemForClaude(designSpec: DesignSpec): string {
    const material = designSpec as MaterialDesignSpec;

    return `
## Design System Specification

**Important:** All UI components MUST use these exact design tokens. Do not deviate from these specifications.

### Color Palette (Light Mode)

Use these colors throughout the application:

- **Primary:** \`${designSpec.colorPalette.primary}\` (main brand color - buttons, links, CTAs)
- **Primary Text:** \`${designSpec.colorPalette.primaryForeground}\` (text on primary color)
- **Secondary:** \`${designSpec.colorPalette.secondary}\` (supporting actions)
- **Accent:** \`${designSpec.colorPalette.accent}\` (highlights, important elements)
- **Background:** \`${designSpec.colorPalette.background}\` (page background)
- **Surface:** \`${designSpec.colorPalette.surface || designSpec.colorPalette.background}\` (cards, panels)
- **Text:** \`${designSpec.colorPalette.foreground}\` (primary text color)
- **Muted:** \`${designSpec.colorPalette.muted}\` (subtle backgrounds)
- **Muted Text:** \`${designSpec.colorPalette.mutedForeground}\` (secondary text)
- **Border:** \`${designSpec.colorPalette.border}\` (dividers, outlines)
- **Error:** \`${designSpec.colorPalette.destructive}\` (errors, destructive actions)

${material?.darkColorPalette ? `
### Dark Mode Colors

When implementing dark mode (using \`dark:\` prefix), use these colors:

- **Primary:** \`${material.darkColorPalette.primary}\`
- **Primary Text:** \`${material.darkColorPalette.primaryForeground}\`
- **Background:** \`${material.darkColorPalette.background}\`
- **Surface:** \`${material.darkColorPalette.surface || material.darkColorPalette.background}\`
- **Text:** \`${material.darkColorPalette.foreground}\`
- **Border:** \`${material.darkColorPalette.border}\`
` : ''}

### Typography

Use these font families and sizes:

**Fonts:**
- Sans-serif: \`${designSpec.typography.fontFamily.sans}\`
- Monospace: \`${designSpec.typography.fontFamily.mono}\`

**Type Scale:**
- Extra small: \`${designSpec.typography.scale.xs}\` (captions, labels)
- Small: \`${designSpec.typography.scale.sm}\` (secondary text)
- Base: \`${designSpec.typography.scale.base}\` (body text)
- Large: \`${designSpec.typography.scale.lg}\` (emphasized text)
- XL: \`${designSpec.typography.scale.xl}\` (small headings)
- 2XL: \`${designSpec.typography.scale['2xl']}\` (section headings)
- 3XL: \`${designSpec.typography.scale['3xl']}\` (page titles)
- 4XL: \`${designSpec.typography.scale['4xl']}\` (hero text)

**Font Weights:**
- Regular: ${designSpec.typography.weights.normal}
- Medium: ${designSpec.typography.weights.medium}
- Semibold: ${designSpec.typography.weights.semibold}
- Bold: ${designSpec.typography.weights.bold}

### Spacing Scale

Use \`${designSpec.designTokens.spacing.unit}px\` base unit with these multipliers:

${designSpec.designTokens.spacing.scale.map(m => `- \`${m * designSpec.designTokens.spacing.unit}px\` (×${m})`).join('\n')}

**Common spacing patterns:**
- Element padding: 16px-24px
- Section gaps: 48px-64px
- Component margins: 8px-16px

### Border Radius

- Small: \`${designSpec.designTokens.borderRadius.sm}\` (inputs, small buttons)
- Medium: \`${designSpec.designTokens.borderRadius.md}\` (buttons, cards)
- Large: \`${designSpec.designTokens.borderRadius.lg}\` (prominent cards)
- XL: \`${designSpec.designTokens.borderRadius.xl}\` (hero sections)
- Full: \`${designSpec.designTokens.borderRadius.full}\` (pills, avatars)

### Shadows (Elevation)

- Small: \`${designSpec.designTokens.shadows.sm}\` (subtle elevation)
- Medium: \`${designSpec.designTokens.shadows.md}\` (cards, dropdowns)
- Large: \`${designSpec.designTokens.shadows.lg}\` (modals, popovers)
- XL: \`${designSpec.designTokens.shadows.xl}\` (dialogs)

### Component Guidelines

**Navigation Style:** ${designSpec.componentPatterns.navigation}
- Use ${designSpec.componentPatterns.navigation === 'sidebar' ? 'a left sidebar for navigation' : 'a top navigation bar'}

**Layout Pattern:** ${designSpec.componentPatterns.layout}
**Card Style:** ${designSpec.componentPatterns.cardStyle}
- ${designSpec.componentPatterns.cardStyle === 'elevated' ? 'Cards should have subtle shadows' : 'Cards should be flat with borders'}

### Tailwind Configuration

When generating \`tailwind.config.ts\`, use these exact tokens:

\`\`\`typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: '${designSpec.colorPalette.primary}',
        'primary-foreground': '${designSpec.colorPalette.primaryForeground}',
        secondary: '${designSpec.colorPalette.secondary}',
        accent: '${designSpec.colorPalette.accent}',
        background: '${designSpec.colorPalette.background}',
        foreground: '${designSpec.colorPalette.foreground}',
        muted: '${designSpec.colorPalette.muted}',
        'muted-foreground': '${designSpec.colorPalette.mutedForeground}',
        border: '${designSpec.colorPalette.border}',
        destructive: '${designSpec.colorPalette.destructive}',
      },
      fontFamily: {
        sans: [${designSpec.typography.fontFamily.sans.split(',').map(f => `'${f.trim()}'`).join(', ')}],
        mono: [${designSpec.typography.fontFamily.mono.split(',').map(f => `'${f.trim()}'`).join(', ')}],
      },
      borderRadius: {
        sm: '${designSpec.designTokens.borderRadius.sm}',
        md: '${designSpec.designTokens.borderRadius.md}',
        lg: '${designSpec.designTokens.borderRadius.lg}',
        xl: '${designSpec.designTokens.borderRadius.xl}',
      },
      boxShadow: {
        sm: '${designSpec.designTokens.shadows.sm}',
        md: '${designSpec.designTokens.shadows.md}',
        lg: '${designSpec.designTokens.shadows.lg}',
        xl: '${designSpec.designTokens.shadows.xl}',
      }
    }
  }
}
\`\`\`

${material?.designPrinciples ? `
### Design Principles

This design system follows:

${material.designPrinciples.map(p => `- ${p}`).join('\n')}
` : ''}

${designSpec.inspiration ? `
### Design Inspiration

This app's design is inspired by: **${designSpec.inspiration.join(', ')}**

Study these apps for UI patterns and interactions.
` : ''}

---

**CRITICAL:** All components must use these tokens. Do not use arbitrary hex values or hard-coded colors.
`;
  }

  /**
   * Create a design context section for PRD
   */
  static createDesignContext(
    projectName: string,
    industry: string,
    designSpec: DesignSpec
  ): string {
    return `# Design System

**Project:** ${projectName}
**Industry:** ${industry}
**Visual Style:** ${designSpec.visualStyle}
**Generated:** ${designSpec.generatedAt}

${this.formatDesignSystemForClaude(designSpec)}

## Implementation Requirements

1. **Tailwind CSS Setup:**
   - Install: \`npm install tailwindcss postcss autoprefixer\`
   - Configure using the Tailwind config above
   - Use utility classes for all styling

2. **Component Library (Optional):**
   - Consider using shadcn/ui or Radix UI primitives
   - Customize with our design tokens
   - Ensure accessibility (WCAG AA)

3. **Dark Mode:**
   - Implement using Tailwind's dark mode classes
   - Use the dark color palette specified above
   - Test all components in both modes

4. **Responsive Design:**
   - Mobile-first approach
   - Use Tailwind breakpoints (sm, md, lg, xl)
   - Test on mobile, tablet, desktop

5. **Accessibility:**
   - All colors meet WCAG AA contrast ratios
   - Use semantic HTML
   - Include proper ARIA labels
   - Keyboard navigation support
`;
  }

  /**
   * Generate concise design prompt for Claude CLI
   * This gets added to the PRD for quick reference
   */
  static generateDesignPrompt(designSpec: DesignSpec): string {
    return `Use ${designSpec.colorPalette.primary} as primary color, ${designSpec.typography.fontFamily.sans.split(',')[0].trim()} font family, ${designSpec.componentPatterns.navigation} navigation, and ${designSpec.componentPatterns.cardStyle} card style.`;
  }

  /**
   * Inject design system into existing PRD content
   */
  static injectDesignSystemIntoPRD(
    prdContent: string,
    projectName: string,
    industry: string,
    designSpec: DesignSpec
  ): string {
    const designSection = this.createDesignContext(projectName, industry, designSpec);

    // Try to inject after the main description, before features
    const featureMatch = prdContent.match(/(## Features|## Core Features|## Functional Requirements)/i);

    if (featureMatch && featureMatch.index) {
      // Insert design system before features section
      return (
        prdContent.slice(0, featureMatch.index) +
        '\n\n' +
        designSection +
        '\n\n' +
        prdContent.slice(featureMatch.index)
      );
    }

    // If no features section found, append at the end
    return prdContent + '\n\n' + designSection;
  }
}
