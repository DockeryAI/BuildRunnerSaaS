/**
 * Design System Foundation
 * Core animations, effects, and component definitions for premium UI generation
 */

export const DESIGN_SYSTEM = {
  // Framer Motion animation variants
  animations: {
    fadeInUp: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
      }
    },
    fadeInDown: {
      hidden: { opacity: 0, y: -20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
      }
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 200, damping: 20 }
      }
    },
    slideInLeft: {
      hidden: { opacity: 0, x: -100 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 100 }
      }
    },
    slideInRight: {
      hidden: { opacity: 0, x: 100 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 100 }
      }
    },
    staggerContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2
        }
      }
    },
    rotateIn: {
      hidden: { opacity: 0, rotate: -10 },
      visible: {
        opacity: 1,
        rotate: 0,
        transition: { type: "spring", stiffness: 200, damping: 15 }
      }
    }
  },

  // Visual effects and utility classes
  effects: {
    glass: "backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20",
    glassDark: "backdrop-blur-xl bg-gray-900/60 border border-white/10",
    glow: "shadow-2xl shadow-primary-500/25",
    glowHover: "hover:shadow-2xl hover:shadow-primary-500/30 transition-shadow duration-300",
    gradient: "bg-gradient-to-br from-primary-500 to-secondary-600",
    gradientText: "bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-600",
    noise: "relative after:absolute after:inset-0 after:opacity-5 after:bg-noise after:pointer-events-none",
    mesh: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent",
    shimmer: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
  },

  // Component styling patterns
  components: {
    card: {
      base: "relative overflow-hidden rounded-2xl transition-all duration-300",
      variants: {
        default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
        glass: "backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20",
        gradient: "bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20",
        elevated: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl",
      },
      hover: "hover:-translate-y-1 hover:shadow-2xl",
      padding: "p-6",
    },
    button: {
      base: "relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed",
      sizes: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
      },
      variants: {
        primary: "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-500/25",
        secondary: "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98]",
        glass: "backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]",
        gradient: "bg-gradient-to-r from-primary-500 to-secondary-600 text-white hover:shadow-lg hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98]",
        outline: "border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white hover:scale-[1.02] active:scale-[0.98]",
        ghost: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98]",
      }
    },
    input: {
      base: "w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl outline-none transition-all duration-200 backdrop-blur-xl",
      focus: "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
      error: "border-red-500 focus:border-red-500 focus:ring-red-500/20",
      disabled: "opacity-50 cursor-not-allowed",
    },
    badge: {
      base: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
      variants: {
        default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
        primary: "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
        success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
        error: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        glass: "backdrop-blur-xl bg-white/10 border border-white/20 text-white",
      }
    },
    modal: {
      overlay: "fixed inset-0 bg-black/50 backdrop-blur-sm z-40",
      container: "fixed inset-0 flex items-center justify-center z-50 p-4",
      content: "relative w-full max-w-lg rounded-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-800 shadow-2xl",
      header: "px-6 py-4 border-b border-gray-200 dark:border-gray-800",
      body: "px-6 py-4",
      footer: "px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3",
    },
    tooltip: {
      base: "absolute z-50 px-3 py-2 text-sm rounded-lg backdrop-blur-xl bg-gray-900/90 text-white border border-white/10 shadow-xl",
      arrow: "absolute w-2 h-2 bg-gray-900 border-l border-t border-white/10 transform rotate-45",
    },
    skeleton: {
      base: "animate-pulse bg-gray-200 dark:bg-gray-800 rounded",
      shimmer: "relative overflow-hidden bg-gray-200 dark:bg-gray-800 rounded before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    }
  },

  // Spacing and sizing scales
  spacing: {
    section: "py-20 lg:py-32",
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    stack: {
      xs: "space-y-2",
      sm: "space-y-4",
      md: "space-y-6",
      lg: "space-y-8",
      xl: "space-y-12",
    }
  },

  // Typography patterns
  typography: {
    display: "text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
    h1: "text-4xl md:text-5xl font-bold tracking-tight",
    h2: "text-3xl md:text-4xl font-bold tracking-tight",
    h3: "text-2xl md:text-3xl font-semibold",
    h4: "text-xl md:text-2xl font-semibold",
    lead: "text-xl md:text-2xl text-gray-600 dark:text-gray-400",
    body: "text-base text-gray-700 dark:text-gray-300",
    small: "text-sm text-gray-600 dark:text-gray-400",
    gradient: "bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-600",
  },

  // Layout patterns
  layouts: {
    centered: "flex items-center justify-center min-h-screen",
    hero: "relative min-h-screen flex items-center justify-center overflow-hidden",
    section: "py-20 lg:py-32 relative",
    grid: {
      cols2: "grid grid-cols-1 md:grid-cols-2 gap-6",
      cols3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      cols4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
    }
  },

  // Responsive breakpoints
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  }
};

// Helper function to combine classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Export animation variants for direct use
export const motionVariants = DESIGN_SYSTEM.animations;
export const effectClasses = DESIGN_SYSTEM.effects;
export const componentStyles = DESIGN_SYSTEM.components;
