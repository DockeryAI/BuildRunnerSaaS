/**
 * Design System Generator
 * Phase 1: Generate beautiful, cohesive design specifications before code generation
 *
 * Integrates with design-presets.ts for consistent, professional styling
 */

import { DESIGN_PRESETS, inferDesignPreset, DesignPreset } from './design-presets';

export interface ColorPalette {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  background: string;
  foreground: string;
  border: string;
  ring: string;
  destructive: string;
  destructiveForeground: string;
}

export interface Typography {
  fontFamily: {
    sans: string;
    mono: string;
  };
  scale: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  weights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface DesignTokens {
  spacing: {
    unit: number; // Base unit in pixels
    scale: number[]; // Multipliers [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16]
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface DesignSpec {
  visualStyle: 'modern-minimal' | 'bold-colorful' | 'elegant-corporate' | 'playful-friendly';
  colorPalette: ColorPalette;
  typography: Typography;
  designTokens: DesignTokens;
  inspiration: string[];
  componentPatterns: {
    navigation: 'sidebar' | 'topnav' | 'tabs';
    layout: 'centered' | 'full-width' | 'sidebar-layout';
    cardStyle: 'flat' | 'elevated' | 'bordered';
  };
  generatedAt: string;
}

export class DesignSystemGenerator {

  /**
   * Generate a complete design system based on the product idea
   */
  async generateDesignSystem(
    productIdea: string,
    appType: 'web' | 'mobile',
    apiKey: string
  ): Promise<DesignSpec> {
    console.log('🎨 Generating design system for:', productIdea);

    const prompt = this.buildDesignPrompt(productIdea, appType);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.href : 'https://buildrunner.app',
          'X-Title': 'BuildRunner Design System Generator',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7, // Higher for creative design
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Design generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const designContent = data.choices[0].message.content;

      // Extract JSON from response
      const jsonMatch = designContent.match(/```json\n([\s\S]+?)\n```/) ||
                       designContent.match(/\{[\s\S]+\}/);

      if (jsonMatch) {
        const designSpec = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        console.log('✅ Design system generated:', designSpec.visualStyle);
        return this.enhanceDesignSpec(designSpec);
      }

      throw new Error('Could not parse design specification from AI response');

    } catch (error) {
      console.error('Design system generation failed:', error);
      // Return fallback modern design
      return this.getFallbackDesign();
    }
  }

  /**
   * Convert design preset to DesignSpec format
   */
  private presetToDesignSpec(preset: DesignPreset): DesignSpec {
    return {
      visualStyle: 'modern-minimal',
      colorPalette: {
        primary: preset.colors.primary,
        primaryForeground: preset.colors.text.primary,
        secondary: preset.colors.secondary || preset.colors.primary,
        secondaryForeground: preset.colors.text.primary,
        accent: preset.colors.accent || preset.colors.primary,
        accentForeground: preset.colors.text.primary,
        muted: preset.colors.surface,
        mutedForeground: preset.colors.text.secondary,
        background: preset.colors.background,
        foreground: preset.colors.text.primary,
        border: preset.colors.border,
        ring: preset.colors.primary,
        destructive: 'rgb(239, 68, 68)',
        destructiveForeground: 'rgb(255, 255, 255)',
      },
      typography: {
        fontFamily: {
          sans: 'Inter, system-ui, sans-serif',
          mono: 'JetBrains Mono, monospace',
        },
        scale: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        weights: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      },
      designTokens: {
        spacing: {
          unit: 4,
          scale: [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16],
        },
        borderRadius: {
          sm: '0.25rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        },
      },
      componentPatterns: {
        navigation: 'topnav',
        layout: 'centered',
        cardStyle: 'elevated',
      },
      inspiration: [preset.inspiration],
      generatedAt: new Date().toISOString(),
    };
  }

  private buildDesignPrompt(productIdea: string, appType: string): string {
    // Get the best matching preset for context
    const suggestedPreset = inferDesignPreset('', productIdea);

    return `You are a world-class UI/UX designer specializing in modern web applications. Create a comprehensive design system for this product:

**Product Idea:**
${productIdea}

**App Type:** ${appType}

**Your Task:**
Design a beautiful, cohesive design system that would make this app look professional and modern. Consider apps like Linear, Notion, Stripe, and Vercel as quality benchmarks.

**Suggested Design Direction:**
Based on the product idea, we recommend the "${suggestedPreset.name}" style inspired by ${suggestedPreset.inspiration}.
You may use this as a starting point or create something completely different if it better fits the product.

**Available Design Presets for Reference:**
${Object.entries(DESIGN_PRESETS).map(([key, preset]) =>
  `- ${preset.name}: ${preset.inspiration}`
).join('\n')}

**Requirements:**

1. **Visual Style** - Choose ONE that fits the product:
   - modern-minimal (clean, lots of whitespace, subtle colors)
   - bold-colorful (vibrant, energetic, high contrast)
   - elegant-corporate (sophisticated, professional, refined)
   - playful-friendly (approachable, warm, fun)

2. **Color Palette** - Provide specific Tailwind CSS color values:
   - Primary color (main brand color)
   - Secondary color (supporting color)
   - Accent color (call-to-action, highlights)
   - Neutral grays (backgrounds, borders, text)
   - Semantic colors (success, warning, error)

3. **Typography** - Font pairings and scale:
   - Font family (from Google Fonts)
   - Type scale (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
   - Font weights (normal, medium, semibold, bold)

4. **Design Tokens**:
   - Spacing scale (consistent margins/padding)
   - Border radius values
   - Shadow definitions

5. **Component Patterns**:
   - Navigation style (sidebar/topnav/tabs)
   - Layout approach (centered/full-width/sidebar)
   - Card style (flat/elevated/bordered)

6. **Inspiration** - List 2-3 existing apps with similar design aesthetic

**CRITICAL:** Output ONLY valid JSON matching this exact structure:

\`\`\`json
{
  "visualStyle": "modern-minimal",
  "colorPalette": {
    "primary": "rgb(99, 102, 241)",
    "primaryForeground": "rgb(255, 255, 255)",
    "secondary": "rgb(241, 245, 249)",
    "secondaryForeground": "rgb(15, 23, 42)",
    "accent": "rgb(168, 85, 247)",
    "accentForeground": "rgb(255, 255, 255)",
    "muted": "rgb(241, 245, 249)",
    "mutedForeground": "rgb(100, 116, 139)",
    "background": "rgb(255, 255, 255)",
    "foreground": "rgb(15, 23, 42)",
    "border": "rgb(226, 232, 240)",
    "ring": "rgb(99, 102, 241)",
    "destructive": "rgb(239, 68, 68)",
    "destructiveForeground": "rgb(255, 255, 255)"
  },
  "typography": {
    "fontFamily": {
      "sans": "Inter, system-ui, sans-serif",
      "mono": "JetBrains Mono, monospace"
    },
    "scale": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    },
    "weights": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    }
  },
  "designTokens": {
    "spacing": {
      "unit": 4,
      "scale": [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16]
    },
    "borderRadius": {
      "sm": "0.25rem",
      "md": "0.375rem",
      "lg": "0.5rem",
      "xl": "0.75rem",
      "full": "9999px"
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1)"
    }
  },
  "componentPatterns": {
    "navigation": "sidebar",
    "layout": "sidebar-layout",
    "cardStyle": "elevated"
  },
  "inspiration": ["Linear", "Notion", "Stripe Dashboard"]
}
\`\`\`

Generate a design system that will make this app look AMAZING. Think carefully about color harmony, contrast, and the product's target audience.`;
  }

  private enhanceDesignSpec(spec: any): DesignSpec {
    return {
      ...spec,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get fallback design using predefined preset
   */
  private getFallbackDesign(): DesignSpec {
    console.log('🎨 Using fallback design preset: Modern SaaS');
    return this.presetToDesignSpec(DESIGN_PRESETS['modern-saas']);
  }

  /**
   * DEPRECATED: Legacy fallback - kept for reference
   * Use getFallbackDesign() instead which uses design presets
   */
  private getLegacyFallbackDesign(): DesignSpec {
    return {
      visualStyle: 'modern-minimal',
      colorPalette: {
        primary: 'rgb(99, 102, 241)',
        primaryForeground: 'rgb(255, 255, 255)',
        secondary: 'rgb(241, 245, 249)',
        secondaryForeground: 'rgb(15, 23, 42)',
        accent: 'rgb(168, 85, 247)',
        accentForeground: 'rgb(255, 255, 255)',
        muted: 'rgb(241, 245, 249)',
        mutedForeground: 'rgb(100, 116, 139)',
        background: 'rgb(255, 255, 255)',
        foreground: 'rgb(15, 23, 42)',
        border: 'rgb(226, 232, 240)',
        ring: 'rgb(99, 102, 241)',
        destructive: 'rgb(239, 68, 68)',
        destructiveForeground: 'rgb(255, 255, 255)',
      },
      typography: {
        fontFamily: {
          sans: 'Inter, system-ui, sans-serif',
          mono: 'JetBrains Mono, monospace',
        },
        scale: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        weights: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      },
      designTokens: {
        spacing: {
          unit: 4,
          scale: [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16],
        },
        borderRadius: {
          sm: '0.25rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        },
      },
      componentPatterns: {
        navigation: 'sidebar',
        layout: 'sidebar-layout',
        cardStyle: 'elevated',
      },
      inspiration: ['Linear', 'Notion', 'Stripe Dashboard'],
      generatedAt: new Date().toISOString(),
    };
  }
}
