/**
 * Design Token Injection System
 *
 * CRITICAL MISSING PIECE: Converts DesignSpec from DesignIntelligence into
 * actual Tailwind config and CSS that makes the design system work.
 *
 * Without this, components use classes like bg-background, text-foreground
 * but Tailwind doesn't know what those mean, causing broken/unstyled components.
 */

import { DesignSpec } from './archived/openrouter/design-system-generator';
import * as fs from 'fs';
import * as path from 'path';

export interface TailwindConfig {
  content: string[];
  theme: {
    extend: {
      colors: Record<string, string>;
      fontFamily: Record<string, string[]>;
      fontSize: Record<string, string>;
      fontWeight: Record<string, number>;
      spacing: Record<string, string>;
      borderRadius: Record<string, string>;
      boxShadow: Record<string, string>;
      backdropBlur: Record<string, string>;
    };
  };
  plugins: string[];
}

export class DesignTokenInjector {
  /**
   * Generate complete Tailwind config from design spec
   */
  generateTailwindConfig(designSpec: DesignSpec): string {
    const config: TailwindConfig = {
      content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
        extend: {
          colors: this.convertColorPalette(designSpec?.colorPalette || {}),
          fontFamily: this.convertFontFamily(designSpec?.typography?.fontFamily || { sans: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, monospace' }),
          fontSize: this.convertFontScale(designSpec?.typography?.scale || {}),
          fontWeight: designSpec?.typography?.weights || { normal: 400, medium: 500, semibold: 600, bold: 700 },
          spacing: this.convertSpacing(designSpec?.designTokens?.spacing || { scale: [0, 8, 16, 24, 32, 40, 48, 56, 64] }),
          borderRadius: this.convertBorderRadius(designSpec?.designTokens?.borderRadius || {}),
          boxShadow: this.convertShadows(designSpec?.designTokens?.shadows || {}),
          backdropBlur: {
            xs: '2px',
            sm: '4px',
            md: '8px',
            lg: '12px',
            xl: '16px',
            '2xl': '24px',
            '3xl': '40px',
          },
        },
      },
      plugins: ['@tailwindcss/forms', '@tailwindcss/typography'],
    };

    return this.stringifyConfig(config);
  }

  /**
   * Convert color palette to Tailwind format
   */
  private convertColorPalette(colors: Record<string, string>): Record<string, string> {
    return {
      // Core colors
      background: colors.background || '#FFFFFF',
      foreground: colors.foreground || '#111827',

      // Surface (cards, panels - slightly different from background)
      surface: colors.surface || colors.muted || '#F9FAFB',

      // Primary brand color
      primary: {
        DEFAULT: colors.primary || '#6366F1',
        foreground: colors.primaryForeground || '#FFFFFF',
      },

      // Secondary supporting color
      secondary: {
        DEFAULT: colors.secondary || '#8B5CF6',
        foreground: colors.secondaryForeground || '#FFFFFF',
      },

      // Accent for highlights and CTAs
      accent: {
        DEFAULT: colors.accent || colors.primary || '#6366F1',
        foreground: colors.accentForeground || '#FFFFFF',
      },

      // Muted backgrounds and text
      muted: {
        DEFAULT: colors.muted || '#F3F4F6',
        foreground: colors.mutedForeground || '#6B7280',
      },

      // Borders and dividers
      border: colors.border || '#E5E7EB',

      // Focus rings
      ring: colors.ring || colors.primary || '#6366F1',

      // Destructive (errors, delete actions)
      destructive: {
        DEFAULT: colors.destructive || '#EF4444',
        foreground: colors.destructiveForeground || '#FFFFFF',
      },
    } as any;
  }

  /**
   * Convert font family to Tailwind format
   */
  private convertFontFamily(fontFamily: { sans: string; mono: string }): Record<string, string[]> {
    return {
      sans: (fontFamily?.sans || 'Inter, system-ui, sans-serif').split(',').map(f => f.trim()),
      mono: (fontFamily?.mono || 'JetBrains Mono, monospace').split(',').map(f => f.trim()),
    };
  }

  /**
   * Convert font scale to Tailwind format
   */
  private convertFontScale(scale: Record<string, string>): Record<string, string> {
    return scale;
  }

  /**
   * Convert spacing scale to Tailwind format
   */
  private convertSpacing(spacing: { base?: number; unit?: number; scale: number[] }): Record<string, string> {
    const result: Record<string, string> = {};
    const baseUnit = spacing?.base || spacing?.unit || 8;

    (spacing?.scale || [0, 8, 16, 24, 32, 40, 48, 56, 64]).forEach((value, index) => {
      result[index.toString()] = `${value}px`;
    });

    return result;
  }

  /**
   * Convert border radius to Tailwind format
   */
  private convertBorderRadius(borderRadius: Record<string, string>): Record<string, string> {
    return borderRadius;
  }

  /**
   * Convert shadows to Tailwind format
   */
  private convertShadows(shadows: Record<string, string>): Record<string, string> {
    return shadows;
  }

  /**
   * Stringify config as TypeScript module
   */
  private stringifyConfig(config: TailwindConfig): string {
    return `import type { Config } from 'tailwindcss'

const config: Config = {
  content: ${JSON.stringify(config.content, null, 2)},
  darkMode: ['class'],
  theme: {
    extend: ${JSON.stringify(config.theme.extend, null, 6).replace(/"([^"]+)":/g, '$1:')},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
`;
  }

  /**
   * Generate CSS variables for design tokens
   */
  generateCSSVariables(designSpec: DesignSpec): string {
    const { colorPalette } = designSpec;

    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Background */
    --background: ${this.hexToHSL(colorPalette.background)};
    --foreground: ${this.hexToHSL(colorPalette.foreground)};

    /* Surface (cards, panels) */
    --surface: ${this.hexToHSL(colorPalette.surface || colorPalette.muted || '#F9FAFB')};

    /* Primary */
    --primary: ${this.hexToHSL(colorPalette.primary)};
    --primary-foreground: ${this.hexToHSL(colorPalette.primaryForeground)};

    /* Secondary */
    --secondary: ${this.hexToHSL(colorPalette.secondary)};
    --secondary-foreground: ${this.hexToHSL(colorPalette.secondaryForeground)};

    /* Accent */
    --accent: ${this.hexToHSL(colorPalette.accent || colorPalette.primary)};
    --accent-foreground: ${this.hexToHSL(colorPalette.accentForeground || colorPalette.primaryForeground)};

    /* Muted */
    --muted: ${this.hexToHSL(colorPalette.muted || '#F3F4F6')};
    --muted-foreground: ${this.hexToHSL(colorPalette.mutedForeground || '#6B7280')};

    /* Border & Ring */
    --border: ${this.hexToHSL(colorPalette.border || '#E5E7EB')};
    --ring: ${this.hexToHSL(colorPalette.ring || colorPalette.primary)};

    /* Destructive */
    --destructive: ${this.hexToHSL(colorPalette.destructive || '#EF4444')};
    --destructive-foreground: ${this.hexToHSL(colorPalette.destructiveForeground || '#FFFFFF')};
  }

  .dark {
    /* Dark mode overrides */
    --background: 222 47% 11%;
    --foreground: 213 31% 91%;
    --surface: 217 33% 17%;
    --primary: ${this.hexToHSL(colorPalette.primary)};
    --primary-foreground: ${this.hexToHSL(colorPalette.primaryForeground)};
    --secondary: 217 33% 17%;
    --secondary-foreground: 213 31% 91%;
    --accent: ${this.hexToHSL(colorPalette.accent || colorPalette.primary)};
    --accent-foreground: ${this.hexToHSL(colorPalette.accentForeground || colorPalette.primaryForeground)};
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --border: 215 28% 17%;
    --ring: ${this.hexToHSL(colorPalette.ring || colorPalette.primary)};
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  /* Glass morphism utilities */
  .glass {
    @apply bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10;
  }

  /* Gradient utilities */
  .gradient-primary {
    @apply bg-gradient-to-br from-primary to-primary/80;
  }

  .gradient-accent {
    @apply bg-gradient-to-br from-accent to-accent/80;
  }
}
`;
  }

  /**
   * Convert hex color to HSL format for CSS variables
   */
  private hexToHSL(hex: string | undefined | any): string {
    // Handle undefined/null values
    if (!hex) {
      // Return a safe default (neutral gray)
      return '0 0% 50%';
    }

    // Handle object values (e.g., { DEFAULT: '#color' })
    if (typeof hex === 'object' && hex.DEFAULT) {
      hex = hex.DEFAULT;
    }

    // Ensure hex is a string
    if (typeof hex !== 'string') {
      console.warn('hexToHSL received non-string value:', hex);
      return '0 0% 50%';
    }

    // Remove # if present
    hex = hex.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Find min and max
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    // Calculate hue
    let h = 0;
    if (diff !== 0) {
      if (max === r) {
        h = ((g - b) / diff) % 6;
      } else if (max === g) {
        h = (b - r) / diff + 2;
      } else {
        h = (r - g) / diff + 4;
      }
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    // Calculate lightness
    const l = (max + min) / 2;

    // Calculate saturation
    const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));

    // Return as HSL string (format: "hue saturation% lightness%")
    return `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }

  /**
   * Write Tailwind config to build directory
   */
  async writeTailwindConfig(buildDir: string, designSpec: DesignSpec): Promise<void> {
    const configContent = this.generateTailwindConfig(designSpec);
    const configPath = path.join(buildDir, 'tailwind.config.ts');

    await fs.promises.writeFile(configPath, configContent, 'utf-8');
    console.log(`✅ Wrote Tailwind config to: ${configPath}`);
  }

  /**
   * Write CSS variables to build directory
   */
  async writeGlobalCSS(buildDir: string, designSpec: DesignSpec): Promise<void> {
    const cssContent = this.generateCSSVariables(designSpec);
    const cssDir = path.join(buildDir, 'app');
    const cssPath = path.join(cssDir, 'globals.css');

    // Ensure directory exists
    await fs.promises.mkdir(cssDir, { recursive: true });

    await fs.promises.writeFile(cssPath, cssContent, 'utf-8');
    console.log(`✅ Wrote global CSS to: ${cssPath}`);
  }

  /**
   * Inject design tokens into build directory (main entry point)
   */
  async injectDesignTokens(buildDir: string, designSpec: DesignSpec): Promise<void> {
    console.log('💉 Injecting design tokens into build...');
    console.log(`   Build directory: ${buildDir}`);

    try {
      // Ensure build directory exists
      await fs.promises.mkdir(buildDir, { recursive: true });
      console.log('  ✓ Build directory ready');

      // Write Tailwind config
      await this.writeTailwindConfig(buildDir, designSpec);

      // Write global CSS with design variables
      await this.writeGlobalCSS(buildDir, designSpec);

      console.log('✅ Design tokens injected successfully!');
    } catch (error) {
      console.error('❌ Failed to inject design tokens:', error);
      console.error('   Error details:', error);
      throw error;
    }
  }
}
