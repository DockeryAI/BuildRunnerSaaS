/**
 * Catalyst Integration Layer
 * Integrates Catalyst components with AI generation system
 */

import { ComponentSpec } from '../component-designer';
import { CatalystMapper, type ComponentSelection } from './mapper';
import { getCatalystComponentSource, getCatalystComponent } from './registry';
import { CATALYST_PATTERNS, CATALYST_GUIDELINES } from './patterns';
import { DesignSpec } from '../design-system-generator';

export interface CatalystIntegrationResult {
  useCatalyst: boolean;
  baseComponents: string[];
  catalystSource: string;
  customizationPrompt: string;
  fallbackToAI: boolean;
}

export class CatalystIntegrator {
  private mapper: CatalystMapper;

  constructor() {
    this.mapper = new CatalystMapper();
  }

  /**
   * Determine if a component should use Catalyst as base
   */
  shouldUseCatalyst(component: ComponentSpec): boolean {
    const type = component.type.toLowerCase();

    // These component types map well to Catalyst
    const catalystTypes = [
      'button',
      'input',
      'form',
      'table',
      'navigation',
      'sidebar',
      'navbar',
      'modal',
      'dialog',
      'dropdown',
      'select',
      'checkbox',
      'radio',
      'switch',
      'badge',
      'avatar',
      'card',
    ];

    return catalystTypes.some((ct) => type.includes(ct));
  }

  /**
   * Integrate Catalyst components for a given spec
   */
  async integrateWithCatalyst(
    component: ComponentSpec,
    designSystem: DesignSpec
  ): Promise<CatalystIntegrationResult> {
    // Check if component should use Catalyst
    if (!this.shouldUseCatalyst(component)) {
      return {
        useCatalyst: false,
        baseComponents: [],
        catalystSource: '',
        customizationPrompt: '',
        fallbackToAI: true,
      };
    }

    try {
      // Map component to Catalyst
      const mapping = this.mapper.mapFeatureToCatalyst(
        `${component.type} ${component.purpose} ${component.requirements.join(' ')}`
      );

      if (!mapping.primaryComponent) {
        return {
          useCatalyst: false,
          baseComponents: [],
          catalystSource: '',
          customizationPrompt: '',
          fallbackToAI: true,
        };
      }

      // Get all relevant component sources
      const baseComponents: string[] = [];
      let catalystSource = '';

      // Primary component
      baseComponents.push(mapping.primaryComponent.name);
      catalystSource += `// PRIMARY: ${mapping.primaryComponent.name}\n`;
      catalystSource += getCatalystComponentSource(mapping.primaryComponent.name);
      catalystSource += '\n\n';

      // Supporting components (limit to 3 most relevant)
      const supportingToInclude = mapping.supportingComponents.slice(0, 3);
      for (const supporting of supportingToInclude) {
        baseComponents.push(supporting.name);
        catalystSource += `// SUPPORTING: ${supporting.name}\n`;
        catalystSource += getCatalystComponentSource(supporting.name);
        catalystSource += '\n\n';
      }

      // Generate customization prompt
      const customizationPrompt = this.generateCustomizationPrompt(
        component,
        mapping,
        designSystem
      );

      return {
        useCatalyst: true,
        baseComponents,
        catalystSource,
        customizationPrompt,
        fallbackToAI: false,
      };
    } catch (error) {
      console.error('Catalyst integration failed:', error);
      return {
        useCatalyst: false,
        baseComponents: [],
        catalystSource: '',
        customizationPrompt: '',
        fallbackToAI: true,
      };
    }
  }

  /**
   * Generate AI prompt for customizing Catalyst components
   */
  private generateCustomizationPrompt(
    component: ComponentSpec,
    mapping: any,
    designSystem: DesignSpec
  ): string {
    return `You are customizing PREMIUM Catalyst UI components for a specific use case.

**CRITICAL: These are Catalyst UI components - maintain their professional quality!**

**Component Type:** ${component.type}
**Purpose:** ${component.purpose}
**Requirements:**
${component.requirements.map((r) => `- ${r}`).join('\n')}

**Catalyst Components Available:**
- Primary: ${mapping.primaryComponent?.name}
- Supporting: ${mapping.supportingComponents.map((c: any) => c.name).join(', ')}

**Design System Colors:**
- Primary: ${designSystem.colorPalette.primary}
- Secondary: ${designSystem.colorPalette.secondary}
- Background: ${designSystem.colorPalette.background}
- Text: ${designSystem.colorPalette.foreground}

**Catalyst Pattern Guidelines:**
${Object.entries(CATALYST_GUIDELINES)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

**Your Task:**
1. Use the provided Catalyst components as the foundation
2. Customize them for the specific requirements
3. Apply the design system colors where appropriate
4. Maintain Catalyst's patterns and quality
5. Add Framer Motion animations for interactions
6. Ensure responsive design (mobile-first, lg: for desktop)
7. Support dark mode with dark: classes

**Important Rules:**
- DO NOT change the core Catalyst structure and patterns
- DO add Framer Motion for page/component entrance animations
- DO customize colors to match the design system
- DO add specific content and data relevant to the use case
- DO maintain all accessibility features (ARIA, keyboard nav, touch targets)
- DO keep the professional spacing and typography
- DO preserve the data-* attribute patterns for states

**Output Format:**
Return a complete, working React component that:
1. Imports necessary Catalyst components
2. Imports Framer Motion for animations
3. Uses 'use client' directive
4. Wraps the main component in motion.div with entrance animation
5. Implements the specific functionality required
6. Includes realistic mock data as constants
7. Exports both the component and a demo function

Example structure:
\`\`\`typescript
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/catalyst/button'
import { ... } from '@/components/catalyst/...'

export function ${component.name}() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Your implementation using Catalyst components */}
    </motion.div>
  )
}

const MOCK_DATA = [/* realistic data */]

export default function ${component.name}Demo() {
  return <${component.name} />
}
\`\`\`

Generate the complete component now:`;
  }

  /**
   * Get Catalyst patterns for AI guidance
   */
  getCatalystPatternsPrompt(): string {
    return `
# Catalyst UI Patterns to Follow

## Color System
${JSON.stringify(CATALYST_PATTERNS.colors, null, 2)}

## Typography
${JSON.stringify(CATALYST_PATTERNS.typography, null, 2)}

## Interactive States
${JSON.stringify(CATALYST_PATTERNS.interactive, null, 2)}

## Focus States
${JSON.stringify(CATALYST_PATTERNS.focus, null, 2)}

## Transitions
${JSON.stringify(CATALYST_PATTERNS.transitions, null, 2)}

## Key Guidelines
${Object.entries(CATALYST_GUIDELINES)
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join('\n')}
`;
  }

  /**
   * Extract Catalyst imports needed for a component
   */
  extractRequiredImports(componentNames: string[]): string {
    const importStatements: string[] = [];

    for (const name of componentNames) {
      const component = getCatalystComponent(name);
      if (!component) continue;

      const fileName = component.fileName.replace('.tsx', '');
      // Convert kebab-case to PascalCase
      const componentName = fileName
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

      importStatements.push(
        `import { ${componentName} } from '@/components/catalyst/${fileName}'`
      );
    }

    return importStatements.join('\n');
  }

  /**
   * Generate full integration prompt for component designer
   */
  generateIntegrationPrompt(
    component: ComponentSpec,
    designSystem: DesignSpec,
    catalystSources: string
  ): string {
    const mapping = this.mapper.mapFeatureToCatalyst(
      `${component.type} ${component.purpose}`
    );

    return `# Component Generation with Catalyst UI Foundation

${this.generateCustomizationPrompt(component, mapping, designSystem)}

## Available Catalyst Components Source Code:

${catalystSources}

## Additional Catalyst Patterns:

${this.getCatalystPatternsPrompt()}

**Remember:** Start with Catalyst components as the foundation, customize for specific needs, and maintain professional quality throughout.
`;
  }
}

/**
 * Quick integration check
 */
export function shouldUseCatalystComponent(componentType: string): boolean {
  const integrator = new CatalystIntegrator();
  return integrator.shouldUseCatalyst({ type: componentType } as ComponentSpec);
}

/**
 * Get Catalyst foundation for component
 */
export async function getCatalystFoundation(
  component: ComponentSpec,
  designSystem: DesignSpec
): Promise<CatalystIntegrationResult> {
  const integrator = new CatalystIntegrator();
  return integrator.integrateWithCatalyst(component, designSystem);
}
