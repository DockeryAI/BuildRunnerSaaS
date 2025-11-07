/**
 * Material Design 3 Theme Adapter
 *
 * Converts Material Design 3 color schemes to BuildRunner's DesignSpec format.
 * Bridges the gap between Material Design's comprehensive color system and
 * our Tailwind-based design tokens.
 */

import { DesignSpec } from '../design-system-generator';
import {
  MaterialPaletteGenerator,
  MaterialColorScheme,
  INDUSTRY_COLORS,
} from './MaterialPaletteGenerator';

export interface MaterialDesignSpec extends DesignSpec {
  // Extended with Material Design specific properties
  materialScheme?: {
    light: MaterialColorScheme;
    dark: MaterialColorScheme;
  };
  designPrinciples?: string[];
}

export class MaterialThemeAdapter {
  /**
   * Convert Material Design scheme to DesignSpec format
   * This maintains all Material Design color relationships while
   * mapping to Tailwind-compatible naming
   */
  static materialToDesignSpec(
    industry: string,
    projectName: string,
    materialLight: MaterialColorScheme,
    materialDark: MaterialColorScheme
  ): MaterialDesignSpec {
    const industryInfo = INDUSTRY_COLORS[industry] || INDUSTRY_COLORS.default;

    // Map Material Design colors to DesignSpec (light mode)
    const colorPalette = {
      // Primary colors
      primary: materialLight.primary,
      primaryForeground: materialLight.onPrimary,

      // Secondary colors
      secondary: materialLight.secondary,
      secondaryForeground: materialLight.onSecondary,

      // Accent colors (Material's tertiary)
      accent: materialLight.tertiary,
      accentForeground: materialLight.onTertiary,

      // Muted colors (for subtle UI elements)
      muted: materialLight.surfaceContainerHighest,
      mutedForeground: materialLight.onSurfaceVariant,

      // Background and surface
      background: materialLight.background,
      foreground: materialLight.onBackground,
      surface: materialLight.surface,

      // Border and outline
      border: materialLight.outlineVariant,
      ring: materialLight.primary,

      // Destructive (error) colors
      destructive: materialLight.error,
      destructiveForeground: materialLight.onError,

      // Additional useful mappings
      card: materialLight.surfaceContainer,
      cardForeground: materialLight.onSurface,
      popover: materialLight.surfaceContainerHigh,
      popoverForeground: materialLight.onSurface,
    };

    // Dark mode colors
    const darkColorPalette = {
      primary: materialDark.primary,
      primaryForeground: materialDark.onPrimary,
      secondary: materialDark.secondary,
      secondaryForeground: materialDark.onSecondary,
      accent: materialDark.tertiary,
      accentForeground: materialDark.onTertiary,
      muted: materialDark.surfaceContainerHighest,
      mutedForeground: materialDark.onSurfaceVariant,
      background: materialDark.background,
      foreground: materialDark.onBackground,
      surface: materialDark.surface,
      border: materialDark.outlineVariant,
      ring: materialDark.primary,
      destructive: materialDark.error,
      destructiveForeground: materialDark.onError,
      card: materialDark.surfaceContainer,
      cardForeground: materialDark.onSurface,
      popover: materialDark.surfaceContainerHigh,
      popoverForeground: materialDark.onSurface,
    };

    // Material Design 3 typography scale
    const typography = MaterialPaletteGenerator.generateTypographyScale();

    return {
      visualStyle: this.getVisualStyleForIndustry(industry),
      colorPalette,
      darkColorPalette,
      typography: {
        fontFamily: {
          sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          mono: 'JetBrains Mono, "Fira Code", Consolas, monospace',
        },
        scale: {
          xs: typography.scale.labelSmall,
          sm: typography.scale.labelMedium,
          base: typography.scale.bodyMedium,
          lg: typography.scale.bodyLarge,
          xl: typography.scale.titleMedium,
          '2xl': typography.scale.titleLarge,
          '3xl': typography.scale.headlineSmall,
          '4xl': typography.scale.headlineMedium,
          '5xl': typography.scale.displaySmall,
        },
        weights: typography.weights,
      },
      designTokens: {
        spacing: {
          unit: 4,
          scale: [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24],
        },
        borderRadius: {
          none: '0',
          sm: '0.25rem',  // 4px
          md: '0.5rem',   // 8px (Material default)
          lg: '0.75rem',  // 12px
          xl: '1rem',     // 16px
          '2xl': '1.5rem', // 24px
          full: '9999px',
        },
        shadows: MaterialPaletteGenerator.generateElevationSystem(),
        blur: {
          none: '0',
          sm: '4px',
          md: '8px',
          lg: '16px',
          xl: '24px',
        },
      },
      componentPatterns: {
        navigation: this.getNavigationStyleForIndustry(industry),
        layout: this.getLayoutStyleForIndustry(industry),
        cardStyle: 'elevated',
        buttonStyle: 'filled', // Material Design default
        inputStyle: 'outlined',
      },
      inspiration: this.getInspirationAppsForIndustry(industry),
      generatedAt: new Date().toISOString(),
      industry,

      // Material Design specific extensions
      materialScheme: {
        light: materialLight,
        dark: materialDark,
      },
      designPrinciples: [
        'Material Design 3 color science',
        'Perceptually accurate color relationships (HCT color space)',
        'Accessible contrast ratios (WCAG AA)',
        `Industry-optimized for ${industry}: ${industryInfo.vibe}`,
        'Dynamic color theming support',
      ],
    };
  }

  /**
   * Generate complete Material Design theme for an industry
   */
  static generateForIndustry(
    industry: string,
    projectName: string,
    customSeedColor?: string
  ): MaterialDesignSpec {
    // Get seed color (custom or industry default)
    const seedColor = customSeedColor || MaterialPaletteGenerator.getIndustrySeedColor(industry);

    // Generate Material Design schemes (light and dark)
    const { light, dark } = MaterialPaletteGenerator.generateThemes(seedColor);

    console.log(`🎨 Generated Material Design 3 theme for ${industry}`);
    console.log(`   Seed color: ${seedColor}`);
    console.log(`   Primary: ${light.primary} (light), ${dark.primary} (dark)`);

    return this.materialToDesignSpec(industry, projectName, light, dark);
  }

  /**
   * Get appropriate visual style for industry
   */
  private static getVisualStyleForIndustry(industry: string): string {
    const styleMap: Record<string, string> = {
      outdoor: 'bold-adventurous',
      nutrition: 'clean-vibrant',
      construction: 'industrial-professional',
      healthcare: 'calm-trustworthy',
      education: 'playful-engaging',
      finance: 'elegant-corporate',
      ecommerce: 'bold-colorful',
      saas: 'modern-minimal',
      travel: 'warm-inviting',
      social: 'dynamic-engaging',
      productivity: 'focused-minimal',
      default: 'modern-minimal',
    };

    return styleMap[industry] || styleMap.default;
  }

  /**
   * Get navigation style for industry
   */
  private static getNavigationStyleForIndustry(
    industry: string
  ): 'sidebar' | 'topnav' | 'tabs' | 'command-palette' {
    const navMap: Record<string, 'sidebar' | 'topnav' | 'tabs' | 'command-palette'> = {
      saas: 'sidebar',
      finance: 'sidebar',
      productivity: 'sidebar',
      social: 'sidebar',
      outdoor: 'topnav',
      travel: 'topnav',
      ecommerce: 'topnav',
      nutrition: 'topnav',
      education: 'topnav',
      healthcare: 'sidebar',
      construction: 'sidebar',
      default: 'topnav',
    };

    return navMap[industry] || navMap.default;
  }

  /**
   * Get layout style for industry
   */
  private static getLayoutStyleForIndustry(industry: string): string {
    const layoutMap: Record<string, string> = {
      saas: 'sidebar-layout',
      finance: 'dashboard-grid',
      productivity: 'canvas-layout',
      social: 'three-column',
      outdoor: 'map-centric',
      travel: 'hero-with-search',
      ecommerce: 'grid-layout',
      nutrition: 'dashboard-grid',
      education: 'centered-content',
      healthcare: 'sidebar-layout',
      construction: 'sidebar-layout',
      default: 'centered',
    };

    return layoutMap[industry] || layoutMap.default;
  }

  /**
   * Get inspiration apps for industry
   */
  private static getInspirationAppsForIndustry(industry: string): string[] {
    const inspirationMap: Record<string, string[]> = {
      outdoor: ['AllTrails', 'Gaia GPS', 'Trailforks', 'REI'],
      nutrition: ['MyFitnessPal', 'Cronometer', 'Noom'],
      construction: ['Procore', 'Fieldwire', 'PlanGrid'],
      healthcare: ['Epic', 'Zocdoc', 'One Medical'],
      education: ['Coursera', 'Duolingo', 'Khan Academy'],
      finance: ['Stripe', 'Plaid', 'Mercury', 'Robinhood'],
      ecommerce: ['Shopify', 'Stripe Checkout', 'Square'],
      saas: ['Linear', 'Notion', 'Figma', 'Vercel'],
      travel: ['Airbnb', 'Booking.com', 'AllTrails'],
      social: ['Discord', 'Linear', 'GitHub'],
      productivity: ['Notion', 'Linear', 'Airtable'],
      default: ['Linear', 'Stripe', 'Vercel'],
    };

    return inspirationMap[industry] || inspirationMap.default;
  }

  /**
   * Generate CSS custom properties for Material Design theme
   * Useful for runtime theme switching
   */
  static generateCSSVariables(scheme: MaterialColorScheme): string {
    return `
:root {
  /* Primary */
  --md-sys-color-primary: ${scheme.primary};
  --md-sys-color-on-primary: ${scheme.onPrimary};
  --md-sys-color-primary-container: ${scheme.primaryContainer};
  --md-sys-color-on-primary-container: ${scheme.onPrimaryContainer};

  /* Secondary */
  --md-sys-color-secondary: ${scheme.secondary};
  --md-sys-color-on-secondary: ${scheme.onSecondary};
  --md-sys-color-secondary-container: ${scheme.secondaryContainer};
  --md-sys-color-on-secondary-container: ${scheme.onSecondaryContainer};

  /* Tertiary */
  --md-sys-color-tertiary: ${scheme.tertiary};
  --md-sys-color-on-tertiary: ${scheme.onTertiary};
  --md-sys-color-tertiary-container: ${scheme.tertiaryContainer};
  --md-sys-color-on-tertiary-container: ${scheme.onTertiaryContainer};

  /* Error */
  --md-sys-color-error: ${scheme.error};
  --md-sys-color-on-error: ${scheme.onError};
  --md-sys-color-error-container: ${scheme.errorContainer};
  --md-sys-color-on-error-container: ${scheme.onErrorContainer};

  /* Background */
  --md-sys-color-background: ${scheme.background};
  --md-sys-color-on-background: ${scheme.onBackground};

  /* Surface */
  --md-sys-color-surface: ${scheme.surface};
  --md-sys-color-on-surface: ${scheme.onSurface};
  --md-sys-color-surface-variant: ${scheme.surfaceVariant};
  --md-sys-color-on-surface-variant: ${scheme.onSurfaceVariant};

  /* Outline */
  --md-sys-color-outline: ${scheme.outline};
  --md-sys-color-outline-variant: ${scheme.outlineVariant};

  /* Surface containers */
  --md-sys-color-surface-container-lowest: ${scheme.surfaceContainerLowest};
  --md-sys-color-surface-container-low: ${scheme.surfaceContainerLow};
  --md-sys-color-surface-container: ${scheme.surfaceContainer};
  --md-sys-color-surface-container-high: ${scheme.surfaceContainerHigh};
  --md-sys-color-surface-container-highest: ${scheme.surfaceContainerHighest};
}
`.trim();
  }

  /**
   * Export Material Design theme for use in other tools (Figma, design systems)
   */
  static exportForDesignTools(spec: MaterialDesignSpec): {
    tokens: any;
    figmaExport: any;
  } {
    return {
      tokens: {
        color: {
          primary: {
            value: spec.colorPalette.primary,
            type: 'color',
          },
          secondary: {
            value: spec.colorPalette.secondary,
            type: 'color',
          },
          // ... all other tokens
        },
        typography: spec.typography,
        spacing: spec.designTokens.spacing,
      },
      figmaExport: {
        // Format compatible with Figma's design token plugin
        colorScheme: spec.materialScheme,
        designPrinciples: spec.designPrinciples,
      },
    };
  }
}
