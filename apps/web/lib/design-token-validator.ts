/**
 * Design Token Validator
 * Enforces design token usage by detecting and fixing hardcoded colors
 */

import type { DesignProfile } from './design-intelligence/types';

export interface ValidationResult {
  isValid: boolean;
  violations: ColorViolation[];
  suggestions: string[];
  fixedCode?: string;
}

export interface ColorViolation {
  type: 'tailwind' | 'hex' | 'rgb' | 'hsl' | 'named';
  original: string;
  line?: number;
  context?: string;
  suggested: string;
}

export class DesignTokenValidator {
  // Regex patterns for detecting hardcoded colors
  private static readonly PATTERNS = {
    // Tailwind color utilities: bg-blue-500, text-gray-900, etc.
    tailwind: /\b(bg|text|border|ring|from|to|via)-(blue|red|green|yellow|purple|pink|indigo|cyan|teal|orange|gray|slate|zinc|neutral|stone|amber|lime|emerald|sky|violet|fuchsia|rose)(-\d+|(?!-))/g,

    // Special cases: bg-white, bg-black, text-white, text-black
    namedColors: /\b(bg|text|border)-(white|black)\b/g,

    // Hex colors: #6366F1, #8B5CF6, etc.
    hex: /#[0-9A-Fa-f]{3,8}/g,

    // RGB/RGBA colors: rgb(99, 102, 241), rgba(139, 92, 246, 0.5)
    rgb: /rgba?\([^)]+\)/g,

    // HSL colors: hsl(239, 84%, 67%)
    hsl: /hsla?\([^)]+\)/g,
  };

  /**
   * Validate component code for design token compliance
   */
  static validateComponent(code: string, profile?: DesignProfile | null): ValidationResult {
    const violations: ColorViolation[] = [];

    // Check for Tailwind color utilities
    const tailwindMatches = code.matchAll(this.PATTERNS.tailwind);
    for (const match of tailwindMatches) {
      const original = match[0];
      const prefix = match[1]; // bg, text, border, etc.
      const color = match[2]; // blue, gray, etc.

      violations.push({
        type: 'tailwind',
        original,
        suggested: this.suggestTokenReplacement(prefix, color, profile),
        context: this.getContext(code, match.index || 0),
      });
    }

    // Check for named colors (white/black)
    const namedMatches = code.matchAll(this.PATTERNS.namedColors);
    for (const match of namedMatches) {
      const original = match[0];
      const prefix = match[1];
      const color = match[2];

      violations.push({
        type: 'named',
        original,
        suggested: this.suggestTokenReplacement(prefix, color, profile),
        context: this.getContext(code, match.index || 0),
      });
    }

    // Check for hex colors
    const hexMatches = code.matchAll(this.PATTERNS.hex);
    for (const match of hexMatches) {
      violations.push({
        type: 'hex',
        original: match[0],
        suggested: 'Use design tokens instead of hex colors',
        context: this.getContext(code, match.index || 0),
      });
    }

    // Check for RGB colors
    const rgbMatches = code.matchAll(this.PATTERNS.rgb);
    for (const match of rgbMatches) {
      violations.push({
        type: 'rgb',
        original: match[0],
        suggested: 'Use design tokens instead of RGB colors',
        context: this.getContext(code, match.index || 0),
      });
    }

    // Check for HSL colors
    const hslMatches = code.matchAll(this.PATTERNS.hsl);
    for (const match of hslMatches) {
      violations.push({
        type: 'hsl',
        original: match[0],
        suggested: 'Use design tokens instead of HSL colors',
        context: this.getContext(code, match.index || 0),
      });
    }

    const isValid = violations.length === 0;
    const suggestions = this.generateSuggestions(violations);

    return {
      isValid,
      violations,
      suggestions,
      fixedCode: isValid ? undefined : this.autoFixViolations(code, profile),
    };
  }

  /**
   * Automatically fix hardcoded colors in code
   */
  static autoFixViolations(code: string, profile?: DesignProfile | null): string {
    let fixed = code;

    // Fix Tailwind color utilities
    fixed = fixed.replace(this.PATTERNS.tailwind, (match, prefix, color, suffix) => {
      return this.suggestTokenReplacement(prefix, color, profile);
    });

    // Fix named colors (white/black)
    fixed = fixed.replace(this.PATTERNS.namedColors, (match, prefix, color) => {
      return this.suggestTokenReplacement(prefix, color, profile);
    });

    // Note: We can't auto-fix hex/rgb/hsl because we don't know the semantic meaning
    // Those require manual inspection or more sophisticated analysis

    return fixed;
  }

  /**
   * Suggest appropriate design token replacement
   */
  private static suggestTokenReplacement(prefix: string, color: string, profile?: DesignProfile | null): string {
    const colorLower = color.toLowerCase();

    // Handle white/black
    if (colorLower === 'white') {
      return prefix === 'text' ? `${prefix}-foreground` : `${prefix}-background`;
    }
    if (colorLower === 'black') {
      return prefix === 'text' ? `${prefix}-foreground` : `${prefix}-background`;
    }

    // Handle grays (usually background/surface/muted)
    if (['gray', 'slate', 'zinc', 'neutral', 'stone'].includes(colorLower)) {
      if (prefix === 'bg') return 'bg-surface';
      if (prefix === 'text') return 'text-muted-foreground';
      if (prefix === 'border') return 'border-border';
      return `${prefix}-muted`;
    }

    // If we have a profile, use its primary colors
    if (profile && profile.colorScheme) {
      const primaryHue = this.extractHue(profile.colorScheme.primary);
      const secondaryHue = this.extractHue(profile.colorScheme.secondary);

      if (this.colorsMatch(colorLower, primaryHue)) {
        return `${prefix}-primary`;
      }
      if (this.colorsMatch(colorLower, secondaryHue)) {
        return `${prefix}-secondary`;
      }
    }

    // Default mapping based on common patterns
    const colorMap: Record<string, string> = {
      blue: 'primary',
      indigo: 'primary',
      purple: 'secondary',
      violet: 'secondary',
      cyan: 'accent',
      sky: 'accent',
      teal: 'accent',
      green: 'accent',
      red: 'destructive',
      rose: 'destructive',
      pink: 'secondary',
      orange: 'accent',
      yellow: 'accent',
      amber: 'accent',
      lime: 'accent',
      emerald: 'accent',
      fuchsia: 'secondary',
    };

    const token = colorMap[colorLower] || 'primary';
    return `${prefix}-${token}`;
  }

  /**
   * Extract hue from hex color (e.g., #6366F1 → 'blue')
   */
  private static extractHue(hex: string): string {
    // Simple heuristic based on hex values
    // This is a simplified version - could be enhanced with actual color analysis
    const colorValue = parseInt(hex.slice(1, 3), 16);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (r > g && r > b) return 'red';
    if (g > r && g > b) return 'green';
    if (b > r && b > g) return 'blue';
    if (r === g && r > b) return 'yellow';
    if (r === b && r > g) return 'purple';
    if (g === b && g > r) return 'cyan';

    return 'blue'; // Default
  }

  /**
   * Check if two color names match (e.g., 'blue' matches 'indigo')
   */
  private static colorsMatch(color1: string, color2: string): boolean {
    const blueFamily = ['blue', 'indigo', 'sky', 'cyan'];
    const purpleFamily = ['purple', 'violet', 'fuchsia', 'pink'];
    const greenFamily = ['green', 'emerald', 'lime', 'teal'];
    const redFamily = ['red', 'rose', 'orange'];
    const yellowFamily = ['yellow', 'amber'];

    for (const family of [blueFamily, purpleFamily, greenFamily, redFamily, yellowFamily]) {
      if (family.includes(color1) && family.includes(color2)) {
        return true;
      }
    }

    return color1 === color2;
  }

  /**
   * Get surrounding context for a match
   */
  private static getContext(code: string, index: number, radius = 40): string {
    const start = Math.max(0, index - radius);
    const end = Math.min(code.length, index + radius);
    return code.slice(start, end).trim();
  }

  /**
   * Generate human-readable suggestions
   */
  private static generateSuggestions(violations: ColorViolation[]): string[] {
    const suggestions: string[] = [];

    const tailwindCount = violations.filter(v => v.type === 'tailwind').length;
    const namedCount = violations.filter(v => v.type === 'named').length;
    const hexCount = violations.filter(v => v.type === 'hex').length;

    if (tailwindCount > 0) {
      suggestions.push(
        `Replace ${tailwindCount} Tailwind color ${tailwindCount === 1 ? 'utility' : 'utilities'} with design tokens`
      );
    }

    if (namedCount > 0) {
      suggestions.push(
        `Replace ${namedCount} named color${namedCount === 1 ? '' : 's'} (white/black) with design tokens`
      );
    }

    if (hexCount > 0) {
      suggestions.push(
        `Remove ${hexCount} hardcoded hex color${hexCount === 1 ? '' : 's'} - use design tokens instead`
      );
    }

    if (violations.length === 0) {
      suggestions.push('✅ Component follows design token standards');
    }

    return suggestions;
  }

  /**
   * Get a severity level for the validation result
   */
  static getSeverity(result: ValidationResult): 'error' | 'warning' | 'info' {
    if (result.violations.length === 0) return 'info';

    const hasHexOrRgb = result.violations.some(v =>
      v.type === 'hex' || v.type === 'rgb' || v.type === 'hsl'
    );

    return hasHexOrRgb ? 'error' : 'warning';
  }

  /**
   * Format validation result for logging
   */
  static formatResult(componentName: string, result: ValidationResult): string {
    if (result.isValid) {
      return `✅ ${componentName}: Passes design token validation`;
    }

    const severity = this.getSeverity(result);
    const icon = severity === 'error' ? '❌' : '⚠️';

    let output = `${icon} ${componentName}: Found ${result.violations.length} design token violations:\n`;

    // Group violations by type
    const byType = result.violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [type, count] of Object.entries(byType)) {
      output += `  - ${count} ${type} color${count === 1 ? '' : 's'}\n`;
    }

    output += `\nSuggestions:\n`;
    result.suggestions.forEach(s => {
      output += `  • ${s}\n`;
    });

    return output;
  }
}
