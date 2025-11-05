/**
 * Advanced Design System
 * Generates professional, premium design systems with modern color palettes,
 * stunning gradients, and sophisticated visual patterns.
 */

export interface AdvancedColorPalette {
  name: string;
  theme: 'dark' | 'light' | 'vibrant';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: {
      base: string;
      elevated: string;
      overlay: string;
    };
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: {
      subtle: string;
      default: string;
      emphasis: string;
    };
  };
  gradients: {
    hero: string;
    card: string;
    button: string;
    accent: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    colored: string;
  };
}

export interface DesignMotifs {
  glassmorphism: {
    enabled: boolean;
    intensity: 'subtle' | 'medium' | 'strong';
    classes: string;
  };
  animations: {
    microInteractions: boolean;
    transitions: string;
    hover: string;
    focus: string;
  };
  borders: {
    style: 'solid' | 'gradient' | 'glow';
    radius: string;
  };
}

export class AdvancedDesignSystem {
  /**
   * Professional color palettes for different industries and moods
   */
  static getPalettes(): Record<string, AdvancedColorPalette> {
    return {
      'sunset-professional': {
        name: 'Sunset Professional',
        theme: 'dark',
        colors: {
          primary: '#FF6B35',      // Sunset Orange
          secondary: '#F7931E',    // Golden Hour
          accent: '#FFD23F',       // Warm Yellow
          background: {
            base: '#0F0F0F',
            elevated: '#1A1A1A',
            overlay: 'rgba(15, 15, 15, 0.95)',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#E0E0E0',
            muted: '#A0A0A0',
          },
          border: {
            subtle: 'rgba(255, 107, 53, 0.1)',
            default: 'rgba(255, 107, 53, 0.2)',
            emphasis: 'rgba(255, 107, 53, 0.4)',
          },
        },
        gradients: {
          hero: 'linear-gradient(135deg, #0F0F0F 0%, #FF6B35 50%, #F7931E 100%)',
          card: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(247, 147, 30, 0.05) 100%)',
          button: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          accent: 'linear-gradient(90deg, #FF6B35 0%, #FFD23F 100%)',
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(255, 107, 53, 0.05)',
          md: '0 4px 6px -1px rgba(255, 107, 53, 0.1)',
          lg: '0 10px 15px -3px rgba(255, 107, 53, 0.15)',
          xl: '0 20px 25px -5px rgba(255, 107, 53, 0.2)',
          colored: '0 10px 40px rgba(255, 107, 53, 0.3)',
        },
      },
      'deep-purple-luxury': {
        name: 'Deep Purple Luxury',
        theme: 'dark',
        colors: {
          primary: '#8B5CF6',      // Deep Purple
          secondary: '#A78BFA',    // Light Purple
          accent: '#EC4899',       // Pink Accent
          background: {
            base: '#0A0A0F',
            elevated: '#14141F',
            overlay: 'rgba(10, 10, 15, 0.95)',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#E0E0E0',
            muted: '#9CA3AF',
          },
          border: {
            subtle: 'rgba(139, 92, 246, 0.1)',
            default: 'rgba(139, 92, 246, 0.2)',
            emphasis: 'rgba(139, 92, 246, 0.4)',
          },
        },
        gradients: {
          hero: 'linear-gradient(135deg, #0A0A0F 0%, #8B5CF6 50%, #EC4899 100%)',
          card: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(167, 139, 250, 0.05) 100%)',
          button: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
          accent: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)',
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(139, 92, 246, 0.05)',
          md: '0 4px 6px -1px rgba(139, 92, 246, 0.1)',
          lg: '0 10px 15px -3px rgba(139, 92, 246, 0.15)',
          xl: '0 20px 25px -5px rgba(139, 92, 246, 0.2)',
          colored: '0 10px 40px rgba(139, 92, 246, 0.3)',
        },
      },
      'teal-modern': {
        name: 'Teal Modern',
        theme: 'dark',
        colors: {
          primary: '#14B8A6',      // Bright Teal
          secondary: '#06B6D4',    // Cyan
          accent: '#10B981',       // Emerald
          background: {
            base: '#0F1419',
            elevated: '#1A1F25',
            overlay: 'rgba(15, 20, 25, 0.95)',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#E0E0E0',
            muted: '#94A3B8',
          },
          border: {
            subtle: 'rgba(20, 184, 166, 0.1)',
            default: 'rgba(20, 184, 166, 0.2)',
            emphasis: 'rgba(20, 184, 166, 0.4)',
          },
        },
        gradients: {
          hero: 'linear-gradient(135deg, #0F1419 0%, #14B8A6 50%, #06B6D4 100%)',
          card: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
          button: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
          accent: 'linear-gradient(90deg, #14B8A6 0%, #10B981 100%)',
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(20, 184, 166, 0.05)',
          md: '0 4px 6px -1px rgba(20, 184, 166, 0.1)',
          lg: '0 10px 15px -3px rgba(20, 184, 166, 0.15)',
          xl: '0 20px 25px -5px rgba(20, 184, 166, 0.2)',
          colored: '0 10px 40px rgba(20, 184, 166, 0.3)',
        },
      },
      'electric-blue': {
        name: 'Electric Blue',
        theme: 'dark',
        colors: {
          primary: '#3B82F6',      // Electric Blue
          secondary: '#60A5FA',    // Light Blue
          accent: '#2DD4BF',       // Teal Accent
          background: {
            base: '#0A0F1E',
            elevated: '#14192B',
            overlay: 'rgba(10, 15, 30, 0.95)',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#E0E0E0',
            muted: '#94A3B8',
          },
          border: {
            subtle: 'rgba(59, 130, 246, 0.1)',
            default: 'rgba(59, 130, 246, 0.2)',
            emphasis: 'rgba(59, 130, 246, 0.4)',
          },
        },
        gradients: {
          hero: 'linear-gradient(135deg, #0A0F1E 0%, #3B82F6 50%, #2DD4BF 100%)',
          card: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(96, 165, 250, 0.05) 100%)',
          button: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
          accent: 'linear-gradient(90deg, #3B82F6 0%, #2DD4BF 100%)',
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(59, 130, 246, 0.05)',
          md: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
          lg: '0 10px 15px -3px rgba(59, 130, 246, 0.15)',
          xl: '0 20px 25px -5px rgba(59, 130, 246, 0.2)',
          colored: '0 10px 40px rgba(59, 130, 246, 0.3)',
        },
      },
      'rose-elegant': {
        name: 'Rose Elegant',
        theme: 'dark',
        colors: {
          primary: '#FB7185',      // Rose
          secondary: '#F472B6',    // Pink
          accent: '#A78BFA',       // Purple Accent
          background: {
            base: '#18111A',
            elevated: '#221827',
            overlay: 'rgba(24, 17, 26, 0.95)',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#E0E0E0',
            muted: '#A8A29E',
          },
          border: {
            subtle: 'rgba(251, 113, 133, 0.1)',
            default: 'rgba(251, 113, 133, 0.2)',
            emphasis: 'rgba(251, 113, 133, 0.4)',
          },
        },
        gradients: {
          hero: 'linear-gradient(135deg, #18111A 0%, #FB7185 50%, #F472B6 100%)',
          card: 'linear-gradient(135deg, rgba(251, 113, 133, 0.05) 0%, rgba(244, 114, 182, 0.05) 100%)',
          button: 'linear-gradient(135deg, #FB7185 0%, #F472B6 100%)',
          accent: 'linear-gradient(90deg, #FB7185 0%, #A78BFA 100%)',
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(251, 113, 133, 0.05)',
          md: '0 4px 6px -1px rgba(251, 113, 133, 0.1)',
          lg: '0 10px 15px -3px rgba(251, 113, 133, 0.15)',
          xl: '0 20px 25px -5px rgba(251, 113, 133, 0.2)',
          colored: '0 10px 40px rgba(251, 113, 133, 0.3)',
        },
      },
    };
  }

  /**
   * Get design motifs for professional, polished UIs
   */
  static getMotifs(): DesignMotifs {
    return {
      glassmorphism: {
        enabled: true,
        intensity: 'medium',
        classes: 'backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20',
      },
      animations: {
        microInteractions: true,
        transitions: 'transition-all duration-200 ease-out',
        hover: 'hover:scale-[1.02] hover:shadow-xl',
        focus: 'focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
      },
      borders: {
        style: 'gradient',
        radius: 'rounded-2xl',
      },
    };
  }

  /**
   * Select palette based on industry/purpose
   */
  static selectPaletteForPurpose(purpose: string): AdvancedColorPalette {
    const palettes = this.getPalettes();
    const purposeLower = purpose.toLowerCase();

    // Industry-specific palette selection
    if (purposeLower.includes('health') || purposeLower.includes('wellness') || purposeLower.includes('medical')) {
      return palettes['teal-modern'];
    }

    if (purposeLower.includes('luxury') || purposeLower.includes('premium') || purposeLower.includes('exclusive')) {
      return palettes['deep-purple-luxury'];
    }

    if (purposeLower.includes('tech') || purposeLower.includes('ai') || purposeLower.includes('software')) {
      return palettes['electric-blue'];
    }

    if (purposeLower.includes('creative') || purposeLower.includes('design') || purposeLower.includes('art')) {
      return palettes['sunset-professional'];
    }

    if (purposeLower.includes('fashion') || purposeLower.includes('beauty') || purposeLower.includes('lifestyle')) {
      return palettes['rose-elegant'];
    }

    // Default to sunset professional for general purposes
    return palettes['sunset-professional'];
  }

  /**
   * Generate Tailwind CSS config for the palette
   */
  static generateTailwindConfig(palette: AdvancedColorPalette): string {
    return `// Tailwind CSS configuration for ${palette.name}
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${palette.colors.primary}',
        secondary: '${palette.colors.secondary}',
        accent: '${palette.colors.accent}',
      },
      backgroundImage: {
        'gradient-hero': '${palette.gradients.hero}',
        'gradient-card': '${palette.gradients.card}',
        'gradient-button': '${palette.gradients.button}',
        'gradient-accent': '${palette.gradients.accent}',
      },
      boxShadow: {
        'sm-colored': '${palette.shadows.sm}',
        'md-colored': '${palette.shadows.md}',
        'lg-colored': '${palette.shadows.lg}',
        'xl-colored': '${palette.shadows.xl}',
        'colored': '${palette.shadows.colored}',
      },
    },
  },
}`;
  }

  /**
   * Generate CSS custom properties for the palette
   */
  static generateCSSVariables(palette: AdvancedColorPalette): string {
    return `:root {
  /* Primary Colors */
  --color-primary: ${palette.colors.primary};
  --color-secondary: ${palette.colors.secondary};
  --color-accent: ${palette.colors.accent};

  /* Background */
  --color-bg-base: ${palette.colors.background.base};
  --color-bg-elevated: ${palette.colors.background.elevated};
  --color-bg-overlay: ${palette.colors.background.overlay};

  /* Text */
  --color-text-primary: ${palette.colors.text.primary};
  --color-text-secondary: ${palette.colors.text.secondary};
  --color-text-muted: ${palette.colors.text.muted};

  /* Border */
  --color-border-subtle: ${palette.colors.border.subtle};
  --color-border-default: ${palette.colors.border.default};
  --color-border-emphasis: ${palette.colors.border.emphasis};

  /* Gradients */
  --gradient-hero: ${palette.gradients.hero};
  --gradient-card: ${palette.gradients.card};
  --gradient-button: ${palette.gradients.button};
  --gradient-accent: ${palette.gradients.accent};
}`;
  }

  /**
   * Get component styling classes based on the design system
   */
  static getComponentClasses(palette: AdvancedColorPalette, motifs: DesignMotifs) {
    return {
      // Hero section
      hero: `min-h-screen w-full relative overflow-hidden`,
      heroBackground: `absolute inset-0 bg-[${palette.colors.background.base}]`,
      heroGradient: `absolute inset-0 opacity-80`,
      heroContent: `relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen`,

      // Cards
      card: `${motifs.borders.radius} ${motifs.glassmorphism.classes} p-6 ${motifs.animations.transitions} ${motifs.animations.hover}`,
      cardPremium: `${motifs.borders.radius} relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-6 ${motifs.animations.transitions} hover:border-white/20 hover:shadow-xl`,

      // Buttons
      buttonPrimary: `px-6 py-3 ${motifs.borders.radius} font-medium text-white ${motifs.animations.transitions} hover:scale-105 active:scale-95 shadow-lg`,
      buttonSecondary: `px-6 py-3 ${motifs.borders.radius} font-medium border-2 ${motifs.animations.transitions} hover:scale-105 active:scale-95`,
      buttonGhost: `px-6 py-3 ${motifs.borders.radius} font-medium ${motifs.animations.transitions} hover:bg-white/10`,

      // Inputs
      input: `px-4 py-3 ${motifs.borders.radius} bg-white/5 border border-white/10 text-white placeholder-white/40 ${motifs.animations.transitions} focus:border-white/30 focus:bg-white/10 ${motifs.animations.focus}`,

      // Navigation
      nav: `sticky top-0 z-50 ${motifs.glassmorphism.classes} border-b border-white/10`,
      navItem: `px-4 py-2 rounded-lg ${motifs.animations.transitions} hover:bg-white/10`,

      // Container
      container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`,
      section: `py-20 relative`,

      // Text
      heading1: `text-5xl md:text-7xl font-bold tracking-tight`,
      heading2: `text-4xl md:text-5xl font-bold tracking-tight`,
      heading3: `text-3xl md:text-4xl font-bold tracking-tight`,
      bodyLarge: `text-xl text-white/80`,
      bodyNormal: `text-base text-white/70`,

      // Interactive states
      focusRing: `focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none`,
      disabled: `opacity-50 cursor-not-allowed`,
    };
  }
}

/**
 * Export helper function to get design system for a project
 */
export function getAdvancedDesignSystem(purpose: string) {
  const palette = AdvancedDesignSystem.selectPaletteForPurpose(purpose);
  const motifs = AdvancedDesignSystem.getMotifs();
  const classes = AdvancedDesignSystem.getComponentClasses(palette, motifs);
  const cssVariables = AdvancedDesignSystem.generateCSSVariables(palette);

  return {
    palette,
    motifs,
    classes,
    cssVariables,
  };
}
