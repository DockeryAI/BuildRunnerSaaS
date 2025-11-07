/**
 * Material Design 3 Color Palette Generator
 *
 * Uses official Material Color Utilities to generate scientifically accurate
 * color palettes based on Material Design 3 principles.
 *
 * Features:
 * - HCT color space (Hue, Chroma, Tone) for perceptually accurate colors
 * - Dynamic color generation from a single seed color
 * - Proper contrast ratios for accessibility (WCAG AA)
 * - Harmonious color relationships
 * - Dark/light theme variants
 */

import {
  argbFromHex,
  hexFromArgb,
  Hct,
  TonalPalette,
  Scheme,
} from '@material/material-color-utilities';

export interface MaterialColorScheme {
  // Primary colors
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Secondary colors
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Tertiary colors (accent)
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  // Error colors
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // Neutral colors (backgrounds, surfaces)
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;

  // Additional surfaces
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;

  // Outline
  outline: string;
  outlineVariant: string;

  // Utility
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  shadow: string;
  scrim: string;
}

export interface IndustryColorRecommendation {
  seedColor: string;
  description: string;
  vibe: string;
}

/**
 * Industry-specific color recommendations based on color psychology
 */
export const INDUSTRY_COLORS: Record<string, IndustryColorRecommendation> = {
  outdoor: {
    seedColor: '#10B981', // Fresh emerald green
    description: 'Nature-inspired, adventurous, reliable',
    vibe: 'earthy',
  },
  nutrition: {
    seedColor: '#22C55E', // Vibrant health green
    description: 'Fresh, energetic, healthy',
    vibe: 'energetic',
  },
  construction: {
    seedColor: '#F97316', // Safety orange
    description: 'Strong, industrial, professional',
    vibe: 'industrial',
  },
  healthcare: {
    seedColor: '#0EA5E9', // Trust blue
    description: 'Trustworthy, calm, professional',
    vibe: 'calming',
  },
  education: {
    seedColor: '#8B5CF6', // Learning purple
    description: 'Creative, engaging, optimistic',
    vibe: 'creative',
  },
  finance: {
    seedColor: '#3B82F6', // Deep blue
    description: 'Stable, trustworthy, sophisticated',
    vibe: 'professional',
  },
  ecommerce: {
    seedColor: '#EC4899', // Vibrant pink
    description: 'Energetic, conversion-focused',
    vibe: 'vibrant',
  },
  saas: {
    seedColor: '#6366F1', // Modern indigo
    description: 'Professional, innovative, clean',
    vibe: 'modern',
  },
  travel: {
    seedColor: '#F59E0B', // Warm amber
    description: 'Adventurous, warm, inviting',
    vibe: 'adventurous',
  },
  social: {
    seedColor: '#8B5CF6', // Engaging purple
    description: 'Dynamic, social, engaging',
    vibe: 'social',
  },
  productivity: {
    seedColor: '#6366F1', // Focus indigo
    description: 'Focused, organized, efficient',
    vibe: 'focused',
  },
  default: {
    seedColor: '#6366F1', // Modern indigo
    description: 'Clean, professional, versatile',
    vibe: 'modern',
  },
};

export class MaterialPaletteGenerator {
  /**
   * Generate a complete Material Design 3 color scheme from a seed color
   */
  static generateScheme(seedColor: string, isDark: boolean = false): MaterialColorScheme {
    const argb = argbFromHex(seedColor);
    const scheme = isDark ? Scheme.dark(argb) : Scheme.light(argb);

    return {
      // Primary
      primary: hexFromArgb(scheme.primary),
      onPrimary: hexFromArgb(scheme.onPrimary),
      primaryContainer: hexFromArgb(scheme.primaryContainer),
      onPrimaryContainer: hexFromArgb(scheme.onPrimaryContainer),

      // Secondary
      secondary: hexFromArgb(scheme.secondary),
      onSecondary: hexFromArgb(scheme.onSecondary),
      secondaryContainer: hexFromArgb(scheme.secondaryContainer),
      onSecondaryContainer: hexFromArgb(scheme.onSecondaryContainer),

      // Tertiary (accent)
      tertiary: hexFromArgb(scheme.tertiary),
      onTertiary: hexFromArgb(scheme.onTertiary),
      tertiaryContainer: hexFromArgb(scheme.tertiaryContainer),
      onTertiaryContainer: hexFromArgb(scheme.onTertiaryContainer),

      // Error
      error: hexFromArgb(scheme.error),
      onError: hexFromArgb(scheme.onError),
      errorContainer: hexFromArgb(scheme.errorContainer),
      onErrorContainer: hexFromArgb(scheme.onErrorContainer),

      // Neutral backgrounds
      background: hexFromArgb(scheme.background),
      onBackground: hexFromArgb(scheme.onBackground),
      surface: hexFromArgb(scheme.surface),
      onSurface: hexFromArgb(scheme.onSurface),
      surfaceVariant: hexFromArgb(scheme.surfaceVariant),
      onSurfaceVariant: hexFromArgb(scheme.onSurfaceVariant),

      // Surface variants (simplified - using surface for all)
      surfaceDim: hexFromArgb(scheme.surface),
      surfaceBright: hexFromArgb(scheme.surface),
      surfaceContainerLowest: hexFromArgb(scheme.surface),
      surfaceContainerLow: hexFromArgb(scheme.surface),
      surfaceContainer: hexFromArgb(scheme.surface),
      surfaceContainerHigh: hexFromArgb(scheme.surfaceVariant),
      surfaceContainerHighest: hexFromArgb(scheme.surfaceVariant),

      // Outline
      outline: hexFromArgb(scheme.outline),
      outlineVariant: hexFromArgb(scheme.outlineVariant),

      // Inverse
      inverseSurface: hexFromArgb(scheme.inverseSurface),
      inverseOnSurface: hexFromArgb(scheme.inverseOnSurface),
      inversePrimary: hexFromArgb(scheme.inversePrimary),

      // Utility
      shadow: hexFromArgb(scheme.shadow),
      scrim: hexFromArgb(scheme.scrim),
    };
  }

  /**
   * Generate both light and dark theme schemes
   */
  static generateThemes(seedColor: string): {
    light: MaterialColorScheme;
    dark: MaterialColorScheme;
  } {
    return {
      light: this.generateScheme(seedColor, false),
      dark: this.generateScheme(seedColor, true),
    };
  }

  /**
   * Get industry-appropriate seed color
   */
  static getIndustrySeedColor(industry: string): string {
    const recommendation = INDUSTRY_COLORS[industry] || INDUSTRY_COLORS.default;
    return recommendation.seedColor;
  }

  /**
   * Generate custom tonal palette for specific use cases
   */
  static generateTonalPalette(hue: number, chroma: number): string[] {
    const palette = TonalPalette.fromHueAndChroma(hue, chroma);

    // Material Design 3 standard tone values
    const tones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];

    return tones.map(tone => hexFromArgb(palette.tone(tone)));
  }

  /**
   * Create a harmonious color scheme from a base color
   * Uses Material Design's HCT color space for perceptual accuracy
   */
  static generateHarmoniousScheme(
    baseColor: string,
    harmony: 'complementary' | 'analogous' | 'triadic' = 'analogous'
  ): { primary: string; secondary: string; tertiary: string } {
    const argb = argbFromHex(baseColor);
    const hct = Hct.fromInt(argb);

    let secondaryHue: number;
    let tertiaryHue: number;

    switch (harmony) {
      case 'complementary':
        // 180 degrees opposite
        secondaryHue = (hct.hue + 180) % 360;
        tertiaryHue = (hct.hue + 30) % 360;
        break;

      case 'triadic':
        // 120 degrees apart
        secondaryHue = (hct.hue + 120) % 360;
        tertiaryHue = (hct.hue + 240) % 360;
        break;

      case 'analogous':
      default:
        // 30 degrees apart (Material Design default)
        secondaryHue = (hct.hue + 30) % 360;
        tertiaryHue = (hct.hue + 60) % 360;
        break;
    }

    // Keep chroma consistent for harmony
    const chroma = hct.chroma;
    const tone = hct.tone;

    return {
      primary: hexFromArgb(Hct.from(hct.hue, chroma, tone).toInt()),
      secondary: hexFromArgb(Hct.from(secondaryHue, chroma * 0.8, tone).toInt()),
      tertiary: hexFromArgb(Hct.from(tertiaryHue, chroma * 0.6, tone).toInt()),
    };
  }

  /**
   * Adjust color for accessibility (ensure proper contrast)
   */
  static ensureContrast(
    foreground: string,
    background: string,
    targetRatio: number = 4.5
  ): string {
    // This is a simplified version - Material Design utilities handle this automatically
    // in the Scheme generation, but useful for custom adjustments
    const fgArgb = argbFromHex(foreground);
    const fgHct = Hct.fromInt(fgArgb);

    // Adjust tone to meet contrast requirement
    // For light backgrounds, make text darker; for dark backgrounds, lighter
    const bgArgb = argbFromHex(background);
    const bgHct = Hct.fromInt(bgArgb);

    if (bgHct.tone > 50) {
      // Light background - darken text
      fgHct.tone = Math.min(30, fgHct.tone);
    } else {
      // Dark background - lighten text
      fgHct.tone = Math.max(90, fgHct.tone);
    }

    return hexFromArgb(fgHct.toInt());
  }

  /**
   * Generate elevation shadows using Material Design principles
   */
  static generateElevationSystem(): Record<string, string> {
    return {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 2px 4px -1px rgb(0 0 0 / 0.06), 0 4px 6px -1px rgb(0 0 0 / 0.10)',
      lg: '0 4px 6px -2px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.10)',
      xl: '0 10px 10px -5px rgb(0 0 0 / 0.04), 0 20px 25px -5px rgb(0 0 0 / 0.10)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    };
  }

  /**
   * Generate Material Design 3 typography scale
   */
  static generateTypographyScale(): {
    scale: Record<string, string>;
    weights: Record<string, number>;
  } {
    return {
      scale: {
        // Material Design 3 type scale
        displayLarge: '3.5625rem',    // 57px
        displayMedium: '2.8125rem',   // 45px
        displaySmall: '2.25rem',      // 36px

        headlineLarge: '2rem',        // 32px
        headlineMedium: '1.75rem',    // 28px
        headlineSmall: '1.5rem',      // 24px

        titleLarge: '1.375rem',       // 22px
        titleMedium: '1rem',          // 16px
        titleSmall: '0.875rem',       // 14px

        bodyLarge: '1rem',            // 16px
        bodyMedium: '0.875rem',       // 14px
        bodySmall: '0.75rem',         // 12px

        labelLarge: '0.875rem',       // 14px
        labelMedium: '0.75rem',       // 12px
        labelSmall: '0.6875rem',      // 11px
      },
      weights: {
        regular: 400,
        medium: 500,
        bold: 700,
      },
    };
  }
}
