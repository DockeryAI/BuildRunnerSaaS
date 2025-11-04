/**
 * Professional Design Presets for Generated Applications
 *
 * Each preset includes a complete design system with:
 * - Color palette (background, surface, borders, primary, text)
 * - Component styling (cards, buttons, inputs, etc.)
 * - Typography and spacing guidelines
 * - Inspiration from industry-leading products
 */

export interface DesignPreset {
  name: string;
  inspiration: string;
  colors: {
    background: string;
    surface: string;
    border: string;
    primary: string;
    secondary?: string;
    accent?: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
  components: {
    card: string;
    button: string;
    buttonSecondary: string;
    input: string;
    badge: string;
    navigation: string;
  };
  layout: {
    container: string;
    section: string;
    grid: string;
  };
  typography: {
    heading: string;
    subheading: string;
    body: string;
    caption: string;
  };
}

export const DESIGN_PRESETS: Record<string, DesignPreset> = {
  'modern-saas': {
    name: 'Modern SaaS',
    inspiration: 'Linear, Notion, Stripe',
    colors: {
      background: '#0A0A0B',
      surface: '#141415',
      border: 'rgba(255,255,255,0.08)',
      primary: '#5E5CE6',
      secondary: '#8B5CF6',
      text: {
        primary: '#FFFFFF',
        secondary: '#A0A0A0',
        tertiary: '#707070',
      },
    },
    components: {
      card: 'bg-[#141415] border border-white/[0.08] rounded-xl p-6 hover:border-white/[0.16] transition-all duration-200 shadow-lg shadow-black/20',
      button: 'px-4 py-2 bg-[#5E5CE6] text-white rounded-lg hover:bg-[#5E5CE6]/90 transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg active:scale-95',
      buttonSecondary: 'px-4 py-2 bg-white/[0.08] text-white rounded-lg hover:bg-white/[0.12] transition-all duration-150 font-medium text-sm border border-white/[0.08]',
      input: 'w-full px-4 py-2.5 bg-black/30 border border-white/[0.08] rounded-lg text-white placeholder-white/40 focus:border-[#5E5CE6] focus:outline-none focus:ring-1 focus:ring-[#5E5CE6]/50 transition-all duration-150',
      badge: 'px-3 py-1 bg-[#5E5CE6]/20 text-[#5E5CE6] rounded-full text-xs font-medium border border-[#5E5CE6]/30',
      navigation: 'border-b border-white/[0.08] bg-[#0A0A0B]/80 backdrop-blur-lg sticky top-0 z-50',
    },
    layout: {
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      section: 'py-8 sm:py-12 lg:py-16',
      grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    },
    typography: {
      heading: 'text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight',
      subheading: 'text-xl sm:text-2xl font-semibold text-white',
      body: 'text-base text-gray-300 leading-relaxed',
      caption: 'text-sm text-gray-500',
    },
  },

  'clean-minimal': {
    name: 'Clean Minimal',
    inspiration: 'Vercel, GitHub, Apple',
    colors: {
      background: '#FFFFFF',
      surface: '#FAFAFA',
      border: '#E5E5E5',
      primary: '#000000',
      secondary: '#666666',
      text: {
        primary: '#000000',
        secondary: '#666666',
        tertiary: '#999999',
      },
    },
    components: {
      card: 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200',
      button: 'px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-150 font-medium text-sm tracking-wide shadow-sm hover:shadow-md active:scale-95',
      buttonSecondary: 'px-5 py-2.5 bg-white text-black rounded-full hover:bg-gray-50 transition-colors duration-150 font-medium text-sm tracking-wide border border-gray-200 shadow-sm',
      input: 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all duration-150',
      badge: 'px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-xs font-medium',
      navigation: 'border-b border-gray-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50',
    },
    layout: {
      container: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
      section: 'py-12 sm:py-16 lg:py-20',
      grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
    },
    typography: {
      heading: 'text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight',
      subheading: 'text-xl sm:text-2xl font-semibold text-black',
      body: 'text-base text-gray-600 leading-relaxed',
      caption: 'text-sm text-gray-400',
    },
  },

  'outdoor-adventure': {
    name: 'Outdoor Adventure',
    inspiration: 'AllTrails, REI, Patagonia',
    colors: {
      background: '#111827',
      surface: '#1F2937',
      border: '#374151',
      primary: '#10B981', // emerald-500
      secondary: '#6366F1', // indigo-500
      accent: '#F59E0B', // amber-500
      text: {
        primary: '#FFFFFF',
        secondary: '#9CA3AF',
        tertiary: '#6B7280',
      },
    },
    components: {
      card: 'bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-emerald-500/50 transition-all duration-200 shadow-lg shadow-black/30',
      button: 'px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-150 font-medium shadow-md hover:shadow-lg active:scale-95',
      buttonSecondary: 'px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-150 font-medium border border-gray-600',
      input: 'w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-150',
      badge: 'px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/30',
      navigation: 'border-b border-gray-800 bg-gray-900/80 backdrop-blur-lg sticky top-0 z-50',
    },
    layout: {
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      section: 'py-8 sm:py-12 lg:py-16',
      grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    },
    typography: {
      heading: 'text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight',
      subheading: 'text-xl sm:text-2xl font-semibold text-white',
      body: 'text-base text-gray-300 leading-relaxed',
      caption: 'text-sm text-gray-500',
    },
  },
};

/**
 * Get design preset by name, with fallback to modern-saas
 */
export function getDesignPreset(name?: string): DesignPreset {
  if (!name || !DESIGN_PRESETS[name]) {
    return DESIGN_PRESETS['modern-saas'];
  }
  return DESIGN_PRESETS[name];
}

/**
 * Infer design preset from app type/description
 */
export function inferDesignPreset(appType: string, description: string): DesignPreset {
  const lowerType = appType.toLowerCase();
  const lowerDesc = description.toLowerCase();

  // Outdoor/Adventure apps
  if (
    lowerType.includes('outdoor') ||
    lowerType.includes('trip') ||
    lowerType.includes('trail') ||
    lowerDesc.includes('hiking') ||
    lowerDesc.includes('camping') ||
    lowerDesc.includes('off-road') ||
    lowerDesc.includes('adventure')
  ) {
    return DESIGN_PRESETS['outdoor-adventure'];
  }

  // Clean minimal for portfolio, documentation, etc.
  if (
    lowerType.includes('portfolio') ||
    lowerType.includes('blog') ||
    lowerType.includes('docs') ||
    lowerDesc.includes('minimal') ||
    lowerDesc.includes('clean')
  ) {
    return DESIGN_PRESETS['clean-minimal'];
  }

  // Default to modern SaaS for dashboards, tools, apps
  return DESIGN_PRESETS['modern-saas'];
}

/**
 * Generate Tailwind config additions for a design preset
 */
export function generateTailwindConfig(preset: DesignPreset): string {
  return `
// Generated from design preset: ${preset.name}
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '${preset.colors.background}',
        surface: '${preset.colors.surface}',
        border: '${preset.colors.border}',
        primary: '${preset.colors.primary}',
        ${preset.colors.secondary ? `secondary: '${preset.colors.secondary}',` : ''}
        ${preset.colors.accent ? `accent: '${preset.colors.accent}',` : ''}
      },
    },
  },
};
`;
}
