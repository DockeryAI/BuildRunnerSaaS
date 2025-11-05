/**
 * Catalyst Pattern Extractor
 * Extracts and catalogs design patterns from Catalyst components
 */

export interface CatalystPattern {
  name: string;
  classes: string;
  description: string;
  examples: string[];
}

/**
 * Extracted patterns from Catalyst components
 * These patterns ensure generated code maintains Catalyst's premium quality
 */
export const CATALYST_PATTERNS = {
  // Color System - Using CSS variables
  colors: {
    primary: {
      bg: 'bg-(--btn-bg)',
      text: 'text-(--btn-icon)',
      border: 'border-(--btn-border)',
      hover: 'hover:bg-(--btn-hover-overlay)',
    },
    semantic: {
      zinc: 'text-zinc-950 dark:text-white',
      muted: 'text-zinc-500 dark:text-zinc-400',
      border: 'border-zinc-950/10 dark:border-white/10',
      background: 'bg-white dark:bg-zinc-900',
      elevated: 'bg-zinc-100 dark:bg-zinc-950',
    },
  },

  // Spacing System
  spacing: {
    gutter: 'px-(--gutter,--spacing(2))',
    padding: {
      sm: 'px-4 py-2',
      md: 'px-6 py-3',
      lg: 'px-8 py-4',
    },
    container: 'mx-auto max-w-6xl',
  },

  // Border Radius
  radius: {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    xs: 'shadow-xs',
    premium: 'shadow-lg ring-1 ring-zinc-950/5 dark:ring-white/10',
  },

  // Focus States
  focus: {
    ring: 'focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500',
    visible: 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
  },

  // Interactive States
  interactive: {
    hover: 'data-hover:bg-zinc-950/2.5 dark:data-hover:bg-white/5',
    active: 'data-active:bg-zinc-950/5 dark:data-active:bg-white/10',
    disabled: 'data-disabled:opacity-50',
  },

  // Transitions
  transitions: {
    default: 'transition',
    all: 'transition-all',
    colors: 'transition-colors',
    transform: 'transition-transform',
    withDuration: 'transition duration-300 ease-in-out',
  },

  // Typography
  typography: {
    heading: 'text-zinc-950 dark:text-white font-semibold',
    body: 'text-zinc-950 dark:text-white text-sm/6',
    muted: 'text-zinc-500 dark:text-zinc-400 text-sm/6',
    label: 'text-zinc-950 dark:text-white text-sm/6 font-medium',
  },

  // Layout Patterns
  layouts: {
    centered: 'flex items-center justify-center',
    stack: 'flex flex-col',
    row: 'flex items-center',
    grid2: 'grid grid-cols-2 gap-4',
    grid3: 'grid grid-cols-3 gap-4',
    responsive: 'flex flex-col lg:flex-row',
  },

  // Form Patterns
  forms: {
    field: 'space-y-2',
    label: 'block text-sm/6 font-medium text-zinc-950 dark:text-white',
    input:
      'block w-full rounded-lg border border-zinc-950/10 dark:border-white/10 bg-white dark:bg-zinc-900/50 px-4 py-2.5 text-sm/6',
    inputFocus:
      'focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
    error: 'text-red-600 dark:text-red-400 text-sm/6',
    helpText: 'text-zinc-500 dark:text-zinc-400 text-sm/6',
  },

  // Button Patterns
  buttons: {
    base: 'relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold px-4 py-2.5',
    solid:
      'border-transparent bg-(--btn-border) before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-(--btn-bg)',
    outline:
      'border-zinc-950/10 dark:border-white/15 text-zinc-950 dark:text-white hover:bg-zinc-950/2.5 dark:hover:bg-white/5',
    ghost:
      'border-transparent text-zinc-950 dark:text-white hover:bg-zinc-950/5 dark:hover:bg-white/10',
  },

  // Card Patterns
  cards: {
    base: 'rounded-lg bg-white dark:bg-zinc-900',
    bordered: 'border border-zinc-950/10 dark:border-white/10',
    shadow: 'shadow-lg ring-1 ring-zinc-950/5 dark:ring-white/10',
    elevated: 'bg-zinc-100 dark:bg-zinc-950',
    interactive:
      'hover:bg-zinc-950/2.5 dark:hover:bg-white/2.5 transition-colors cursor-pointer',
  },

  // Table Patterns
  tables: {
    wrapper: 'flow-root',
    container: 'overflow-x-auto whitespace-nowrap',
    table: 'min-w-full text-left text-sm/6 text-zinc-950 dark:text-white',
    header: 'text-zinc-500 dark:text-zinc-400',
    row: 'border-b border-zinc-950/5 dark:border-white/5',
    rowHover: 'hover:bg-zinc-950/2.5 dark:hover:bg-white/2.5',
    rowStriped: 'even:bg-zinc-950/2.5 dark:even:bg-white/2.5',
    cell: 'px-4 py-4',
  },

  // Dialog/Modal Patterns
  dialogs: {
    backdrop: 'fixed inset-0 bg-black/30 transition data-closed:opacity-0',
    panel:
      'fixed inset-0 flex items-center justify-center p-4 transition data-closed:scale-95 data-closed:opacity-0',
    content:
      'w-full max-w-lg rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-xl ring-1 ring-zinc-950/5 dark:ring-white/10',
    title: 'text-lg font-semibold text-zinc-950 dark:text-white',
    description: 'mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400',
  },

  // Navigation Patterns
  navigation: {
    nav: 'flex items-center gap-4',
    navItem:
      'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm/6 font-medium text-zinc-950 dark:text-white',
    navItemActive: 'bg-zinc-950/5 dark:bg-white/10',
    navItemHover: 'hover:bg-zinc-950/2.5 dark:hover:bg-white/5',
    sidebar:
      'fixed inset-y-0 left-0 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-950/10 dark:border-white/10',
    sidebarItem:
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm/6 font-medium text-zinc-950 dark:text-white hover:bg-zinc-950/2.5 dark:hover:bg-white/5',
  },

  // Badge Patterns
  badges: {
    base: 'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs/5 font-medium',
    default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white',
    primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  },

  // Responsive Patterns
  responsive: {
    show: {
      mobile: 'lg:hidden',
      desktop: 'max-lg:hidden',
    },
    cols: {
      mobile1Desktop2: 'grid grid-cols-1 lg:grid-cols-2',
      mobile1Desktop3: 'grid grid-cols-1 lg:grid-cols-3',
      mobile2Desktop4: 'grid grid-cols-2 lg:grid-cols-4',
    },
    padding: {
      responsive: 'px-4 lg:px-6',
      container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
    },
  },

  // Animation Patterns
  animations: {
    enter:
      'transition duration-300 ease-out data-enter:opacity-0 data-enter:scale-95 data-enter:duration-300',
    leave:
      'transition duration-200 ease-in data-leave:opacity-0 data-leave:scale-95 data-leave:duration-200',
    slide:
      'transition duration-300 ease-in-out data-closed:-translate-x-full data-enter:translate-x-0',
    fade: 'transition data-closed:opacity-0 data-enter:opacity-100 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in',
  },
};

/**
 * Get a complete pattern string for a component type
 */
export function getCatalystPattern(
  category: keyof typeof CATALYST_PATTERNS,
  pattern: string
): string {
  const categoryPatterns = CATALYST_PATTERNS[category] as any;
  if (!categoryPatterns) return '';

  if (typeof categoryPatterns === 'string') return categoryPatterns;
  if (typeof categoryPatterns[pattern] === 'string') return categoryPatterns[pattern];

  // Handle nested patterns
  const keys = pattern.split('.');
  let result: any = categoryPatterns;
  for (const key of keys) {
    result = result[key];
    if (!result) return '';
  }

  return typeof result === 'string' ? result : '';
}

/**
 * Combine multiple Catalyst patterns
 */
export function combineCatalystPatterns(...patterns: string[]): string {
  return patterns.filter(Boolean).join(' ');
}

/**
 * Generate Catalyst-style component classes
 */
export function generateCatalystClasses(options: {
  base: string;
  interactive?: boolean;
  responsive?: boolean;
  darkMode?: boolean;
  focus?: boolean;
}): string {
  const classes = [options.base];

  if (options.interactive) {
    classes.push(CATALYST_PATTERNS.transitions.default);
    classes.push(CATALYST_PATTERNS.interactive.hover);
    classes.push(CATALYST_PATTERNS.interactive.active);
  }

  if (options.focus) {
    classes.push(CATALYST_PATTERNS.focus.ring);
  }

  if (options.darkMode) {
    // Dark mode classes are included in base patterns
  }

  return classes.join(' ');
}

/**
 * Pattern guidelines for AI generation
 */
export const CATALYST_GUIDELINES = {
  spacing: 'Use --gutter and --spacing CSS variables for consistent spacing',
  colors: 'Always include dark: variants for all color classes',
  states: 'Use data-* attributes (data-hover, data-focus, data-active) for states',
  focus: 'Always use data-focus:outline-2 pattern for focus states',
  transitions: 'Add transition classes to all interactive elements',
  responsive: 'Mobile-first with lg: breakpoint for desktop',
  shadows: 'Use shadow-xs or shadow-lg with ring-1 for elevated elements',
  borders: 'Use /10 opacity for borders: border-zinc-950/10 dark:border-white/10',
  backgrounds: 'White/Zinc-900 base, Zinc-100/Zinc-950 for elevated',
  radius: 'Prefer rounded-lg for most elements',
};
