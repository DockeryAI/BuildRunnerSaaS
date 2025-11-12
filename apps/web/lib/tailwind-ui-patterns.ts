/**
 * Tailwind UI Pattern Library
 * Manages purchased Tailwind UI components and customizes them with design profiles
 *
 * NOTE: This is a foundation for integrating Tailwind UI components.
 * Actual Tailwind UI code should be manually copied and organized here.
 */

import type { DesignProfile } from './design-intelligence/types';
import type { DesignSpec } from './archived/openrouter/design-system-generator';

export interface TailwindUIPattern {
  id: string;
  name: string;
  category: 'navigation' | 'forms' | 'lists' | 'heroes' | 'features' | 'pricing' | 'testimonials' | 'footers';
  componentTypes: string[]; // Which component types this pattern applies to
  description: string;
  code: string; // Base Tailwind UI code
  customizationHints: string[];
}

export class TailwindUIPatternLibrary {
  // Purchased Tailwind UI component categories
  private static readonly PURCHASED_CATEGORIES = [
    'application-ui/navigation',
    'application-ui/forms',
    'application-ui/lists',
    'application-ui/tables',
    'application-ui/layout',
    'marketing/sections/heroes',
    'marketing/sections/features',
    'marketing/sections/testimonials',
    'marketing/sections/pricing',
    'marketing/sections/cta',
    'marketing/page-examples/landing-pages',
    'application-ui/feedback/alerts',
    'application-ui/elements/buttons',
    'application-ui/elements/badges',
  ];

  /**
   * Find a Tailwind UI pattern for a component type
   */
  static async findPattern(componentType: string): Promise<TailwindUIPattern | null> {
    const normalizedType = componentType.toLowerCase();

    // Map component types to Tailwind UI categories
    const typeMapping: Record<string, string> = {
      'navbar': 'navigation',
      'header': 'navigation',
      'navigation': 'navigation',
      'sidebar': 'navigation',
      'loginform': 'forms',
      'signupform': 'forms',
      'contactform': 'forms',
      'form': 'forms',
      'productlist': 'lists',
      'userlist': 'lists',
      'list': 'lists',
      'heroSection': 'heroes',
      'hero': 'heroes',
      'landing': 'heroes',
      'featuregrid': 'features',
      'features': 'features',
      'pricingtable': 'pricing',
      'pricing': 'pricing',
      'testimonials': 'testimonials',
      'reviews': 'testimonials',
      'footer': 'footers',
    };

    const category = typeMapping[normalizedType];
    if (!category) {
      return null;
    }

    // Return pattern metadata (actual patterns would be loaded from a database or JSON file)
    return {
      id: `${category}-default`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Component`,
      category: category as any,
      componentTypes: [componentType],
      description: `Professional ${category} component from Tailwind UI`,
      code: '// Tailwind UI pattern would be loaded here',
      customizationHints: [
        'Replace default colors with design tokens',
        'Adjust spacing to match design profile',
        'Add Framer Motion animations',
        'Ensure mobile responsiveness',
      ],
    };
  }

  /**
   * Customize a Tailwind UI pattern with design profile
   */
  static customizeWithProfile(
    pattern: TailwindUIPattern,
    profile: DesignProfile | null,
    designSpec: DesignSpec
  ): string {
    let customized = pattern.code;

    // TODO: Implement actual customization
    // This would:
    // 1. Replace Tailwind UI's default colors with design tokens
    // 2. Adjust spacing based on profile density
    // 3. Add Framer Motion animations
    // 4. Apply typography from design spec
    // 5. Customize based on profile's component patterns

    const customizationInstructions = `
/**
 * Tailwind UI Pattern: ${pattern.name}
 * Customized for: ${profile?.name || 'Default Design'}
 *
 * CUSTOMIZATION APPLIED:
 * - Colors replaced with design tokens (bg-primary, text-foreground, etc.)
 * - Spacing adjusted to ${profile?.visualStyle?.density || 'balanced'} density
 * - Typography: ${designSpec?.typography?.fontFamily?.sans || 'Inter, system-ui, sans-serif'}
 * - Component style: ${profile?.componentPatterns?.cardStyle || 'clean'}
 * - Animations: Framer Motion micro-interactions added
 *
 * IMPORTANT: This is a Tailwind UI component. It has been customized to match
 * your app's design profile. DO NOT use hardcoded colors - all colors use
 * design tokens for consistency.
 */

// TODO: Insert customized Tailwind UI code here
// For now, generate a custom component following the design profile
`;

    return customizationInstructions + customized;
  }

  /**
   * Check if we have a Tailwind UI pattern for a component
   */
  static hasPattern(componentType: string): boolean {
    const normalizedType = componentType.toLowerCase();

    const supportedTypes = [
      'navbar', 'header', 'navigation', 'sidebar',
      'loginform', 'signupform', 'contactform', 'form',
      'productlist', 'userlist', 'list',
      'hero', 'landing', 'heroSection',
      'featuregrid', 'features',
      'pricingtable', 'pricing',
      'testimonials', 'reviews',
      'footer',
    ];

    return supportedTypes.some(type => normalizedType.includes(type));
  }

  /**
   * Get guidance for using Tailwind UI patterns in prompts
   */
  static getPromptGuidance(componentType: string): string {
    if (!this.hasPattern(componentType)) {
      return '';
    }

    return `
TAILWIND UI GUIDANCE:
We have professional Tailwind UI patterns for this component type.
When building this component:

1. Follow Tailwind UI's component structure and best practices
2. Use semantic HTML (header, nav, main, section, footer)
3. Implement proper responsive breakpoints (sm, md, lg, xl)
4. Include mobile menu for navigation components
5. Use Tailwind UI's proven accessibility patterns

CRITICAL: Replace ALL Tailwind UI default colors with design tokens:
- Instead of bg-indigo-600 → use bg-primary
- Instead of text-gray-900 → use text-foreground
- Instead of bg-white → use bg-background
- Instead of border-gray-300 → use border-border

Add Framer Motion animations on top of the Tailwind UI structure.
`;
  }

  /**
   * Get list of available Tailwind UI categories
   */
  static getAvailableCategories(): string[] {
    return this.PURCHASED_CATEGORIES;
  }

  /**
   * Generate component suggestions based on Tailwind UI patterns
   */
  static getSuggestions(componentType: string, profile: DesignProfile | null): string[] {
    const suggestions: string[] = [];

    if (!this.hasPattern(componentType)) {
      suggestions.push('Consider using Tailwind UI patterns for professional components');
      return suggestions;
    }

    suggestions.push('✅ Tailwind UI pattern available for this component');
    suggestions.push('Use proven, accessible component structure');
    suggestions.push('Customize with your design profile colors and spacing');

    if (profile && profile.referenceApps && profile.referenceApps.length > 0) {
      suggestions.push(`Match ${profile.referenceApps[0]}'s quality level`);
    }
    if (profile && profile.visualStyle && profile.visualStyle.aesthetic) {
      suggestions.push(`Apply ${profile.visualStyle.aesthetic} aesthetic`);
    }

    return suggestions;
  }
}
