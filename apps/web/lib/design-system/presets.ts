/**
 * Design Presets
 * Industry-specific design presets with colors, effects, and inspirations
 */

export interface DesignPreset {
  name: string;
  description: string;
  inspiration: string[];
  theme: {
    dark: boolean;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
    };
    effects: {
      cards: string;
      buttons: string;
      backgrounds: string;
      hover: string;
    };
    animations: {
      duration: string;
      easing: string;
    };
  };
}

export const DESIGN_PRESETS: Record<string, DesignPreset> = {
  'saas-modern': {
    name: 'Modern SaaS',
    description: 'Clean, professional design inspired by Linear and Notion',
    inspiration: ['Linear', 'Notion', 'Stripe', 'Vercel'],
    theme: {
      dark: true,
      colors: {
        primary: '#6366f1', // Indigo
        secondary: '#8b5cf6', // Purple
        accent: '#06b6d4', // Cyan
        background: '#0a0a0f',
        surface: '#111118',
        text: '#ffffff',
        textSecondary: '#a1a1aa',
        border: '#27272a',
      },
      effects: {
        cards: 'backdrop-blur-xl bg-white/5 border border-white/10',
        buttons: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700',
        backgrounds: 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950',
        hover: 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/20',
      },
      animations: {
        duration: '0.3s',
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },

  'startup-bold': {
    name: 'Bold Startup',
    description: 'High-energy design with strong gradients and vibrant colors',
    inspiration: ['Vercel', 'Railway', 'Planetscale', 'Framer'],
    theme: {
      dark: true,
      colors: {
        primary: '#3b82f6', // Blue
        secondary: '#10b981', // Green
        accent: '#fbbf24', // Yellow
        background: '#000000',
        surface: '#0f0f0f',
        text: '#ffffff',
        textSecondary: '#9ca3af',
        border: '#1f1f1f',
      },
      effects: {
        cards: 'relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/10',
        buttons: 'bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 hover:shadow-lg hover:shadow-primary-500/50',
        backgrounds: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/20 via-black to-black',
        hover: 'hover:scale-[1.02] hover:shadow-2xl',
      },
      animations: {
        duration: '0.2s',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },

  'adventure-outdoor': {
    name: 'Adventure Outdoor',
    description: 'Warm, inviting design perfect for travel and outdoor apps',
    inspiration: ['AllTrails', 'Strava', 'Airbnb', 'Komoot'],
    theme: {
      dark: false,
      colors: {
        primary: '#ea580c', // Orange
        secondary: '#059669', // Emerald
        accent: '#0ea5e9', // Sky
        background: '#fafaf9',
        surface: '#ffffff',
        text: '#1c1917',
        textSecondary: '#78716c',
        border: '#e7e5e4',
      },
      effects: {
        cards: 'bg-white border border-stone-200 shadow-lg shadow-stone-200/50',
        buttons: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700',
        backgrounds: 'bg-gradient-to-br from-stone-50 via-white to-stone-100',
        hover: 'hover:-translate-y-1 hover:shadow-xl',
      },
      animations: {
        duration: '0.3s',
        easing: 'ease-out',
      },
    },
  },

  'fintech-secure': {
    name: 'Fintech Secure',
    description: 'Professional and trustworthy design for financial applications',
    inspiration: ['Stripe', 'Plaid', 'Coinbase', 'Revolut'],
    theme: {
      dark: true,
      colors: {
        primary: '#2563eb', // Blue
        secondary: '#7c3aed', // Violet
        accent: '#14b8a6', // Teal
        background: '#0c0a09',
        surface: '#1c1917',
        text: '#fafaf9',
        textSecondary: '#a8a29e',
        border: '#292524',
      },
      effects: {
        cards: 'backdrop-blur-xl bg-stone-900/50 border border-stone-800',
        buttons: 'bg-primary-600 hover:bg-primary-700 text-white font-medium',
        backgrounds: 'bg-gradient-to-br from-stone-950 to-stone-900',
        hover: 'hover:border-stone-700 hover:shadow-lg',
      },
      animations: {
        duration: '0.25s',
        easing: 'ease-in-out',
      },
    },
  },

  'creative-studio': {
    name: 'Creative Studio',
    description: 'Artistic and expressive design for creative portfolios',
    inspiration: ['Awwwards', 'Behance', 'Dribbble', 'Read.cv'],
    theme: {
      dark: true,
      colors: {
        primary: '#f43f5e', // Rose
        secondary: '#a855f7', // Purple
        accent: '#f59e0b', // Amber
        background: '#18181b',
        surface: '#27272a',
        text: '#fafafa',
        textSecondary: '#a1a1aa',
        border: '#3f3f46',
      },
      effects: {
        cards: 'backdrop-blur-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-white/10',
        buttons: 'bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-[length:200%_auto] hover:bg-right-bottom',
        backgrounds: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/20 via-zinc-900 to-black',
        hover: 'hover:scale-105 hover:rotate-1 hover:shadow-2xl hover:shadow-primary-500/25',
      },
      animations: {
        duration: '0.4s',
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },

  'health-wellness': {
    name: 'Health & Wellness',
    description: 'Calm and soothing design for health and wellness apps',
    inspiration: ['Headspace', 'Calm', 'MyFitnessPal', 'Strava'],
    theme: {
      dark: false,
      colors: {
        primary: '#14b8a6', // Teal
        secondary: '#06b6d4', // Cyan
        accent: '#8b5cf6', // Purple
        background: '#f0fdfa',
        surface: '#ffffff',
        text: '#134e4a',
        textSecondary: '#5eead4',
        border: '#99f6e4',
      },
      effects: {
        cards: 'bg-white/80 backdrop-blur-xl border border-teal-200 shadow-lg shadow-teal-100/50',
        buttons: 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600',
        backgrounds: 'bg-gradient-to-br from-teal-50 via-cyan-50 to-white',
        hover: 'hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-200/50',
      },
      animations: {
        duration: '0.35s',
        easing: 'ease-out',
      },
    },
  },

  'e-commerce-luxury': {
    name: 'E-Commerce Luxury',
    description: 'Elegant and sophisticated design for premium retail',
    inspiration: ['Apple', 'Tesla', 'Shopify', 'Net-a-Porter'],
    theme: {
      dark: true,
      colors: {
        primary: '#d97706', // Amber
        secondary: '#b45309', // Dark Amber
        accent: '#fbbf24', // Yellow
        background: '#0a0a0a',
        surface: '#171717',
        text: '#fafafa',
        textSecondary: '#a3a3a3',
        border: '#262626',
      },
      effects: {
        cards: 'backdrop-blur-xl bg-neutral-900/70 border border-amber-900/20',
        buttons: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800',
        backgrounds: 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/20',
        hover: 'hover:border-amber-700/50 hover:shadow-2xl hover:shadow-amber-900/20',
      },
      animations: {
        duration: '0.3s',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
};

/**
 * Select preset based on app type, purpose, or industry
 */
export function selectPreset(purpose: string): DesignPreset {
  const purposeLower = purpose.toLowerCase();

  // Industry-specific mapping
  if (purposeLower.includes('saas') || purposeLower.includes('software') || purposeLower.includes('productivity')) {
    return DESIGN_PRESETS['saas-modern'];
  }

  if (purposeLower.includes('startup') || purposeLower.includes('mvp') || purposeLower.includes('launch')) {
    return DESIGN_PRESETS['startup-bold'];
  }

  if (purposeLower.includes('travel') || purposeLower.includes('outdoor') || purposeLower.includes('adventure') || purposeLower.includes('trip')) {
    return DESIGN_PRESETS['adventure-outdoor'];
  }

  if (purposeLower.includes('finance') || purposeLower.includes('banking') || purposeLower.includes('payment') || purposeLower.includes('crypto')) {
    return DESIGN_PRESETS['fintech-secure'];
  }

  if (purposeLower.includes('creative') || purposeLower.includes('portfolio') || purposeLower.includes('art') || purposeLower.includes('design')) {
    return DESIGN_PRESETS['creative-studio'];
  }

  if (purposeLower.includes('health') || purposeLower.includes('wellness') || purposeLower.includes('fitness') || purposeLower.includes('medical')) {
    return DESIGN_PRESETS['health-wellness'];
  }

  if (purposeLower.includes('shop') || purposeLower.includes('store') || purposeLower.includes('commerce') || purposeLower.includes('retail')) {
    return DESIGN_PRESETS['e-commerce-luxury'];
  }

  // Default to modern SaaS for general apps
  return DESIGN_PRESETS['saas-modern'];
}

/**
 * Get all available preset names
 */
export function getPresetNames(): string[] {
  return Object.keys(DESIGN_PRESETS);
}

/**
 * Get preset by name
 */
export function getPreset(name: string): DesignPreset | undefined {
  return DESIGN_PRESETS[name];
}
