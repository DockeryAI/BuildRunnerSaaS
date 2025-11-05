/**
 * Catalyst UI Component Registry
 * Catalogs all Catalyst components with metadata for intelligent selection
 */

import * as fs from 'fs';
import * as path from 'path';

export interface CatalystComponent {
  name: string;
  fileName: string;
  category: 'layout' | 'form' | 'data-display' | 'feedback' | 'navigation' | 'overlay';
  description: string;
  useCases: string[];
  dependencies: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  responsive: boolean;
  darkMode: boolean;
  accessibility: {
    ariaSupport: boolean;
    keyboardNav: boolean;
    touchTargets: boolean;
  };
}

export const CATALYST_COMPONENTS: Record<string, CatalystComponent> = {
  alert: {
    name: 'Alert',
    fileName: 'alert.tsx',
    category: 'feedback',
    description: 'Display important messages and notifications',
    useCases: ['error-messages', 'success-notifications', 'warnings', 'info-banners'],
    dependencies: ['clsx'],
    complexity: 'simple',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  button: {
    name: 'Button',
    fileName: 'button.tsx',
    category: 'form',
    description: 'Premium button with multiple variants and color schemes',
    useCases: ['actions', 'forms', 'cta', 'navigation', 'submit'],
    dependencies: ['@headlessui/react', 'clsx'],
    complexity: 'moderate',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  input: {
    name: 'Input',
    fileName: 'input.tsx',
    category: 'form',
    description: 'Styled text input with validation states',
    useCases: ['forms', 'search', 'text-entry', 'authentication'],
    dependencies: ['@headlessui/react', 'clsx'],
    complexity: 'moderate',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  textarea: {
    name: 'Textarea',
    fileName: 'textarea.tsx',
    category: 'form',
    description: 'Multi-line text input',
    useCases: ['forms', 'comments', 'descriptions', 'messages'],
    dependencies: ['@headlessui/react', 'clsx'],
    complexity: 'simple',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  select: {
    name: 'Select',
    fileName: 'select.tsx',
    category: 'form',
    description: 'Dropdown select component',
    useCases: ['forms', 'filters', 'options', 'settings'],
    dependencies: ['@headlessui/react', 'clsx'],
    complexity: 'moderate',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  checkbox: {
    name: 'Checkbox',
    fileName: 'checkbox.tsx',
    category: 'form',
    description: 'Styled checkbox with custom design',
    useCases: ['forms', 'settings', 'selections', 'filters'],
    dependencies: ['@headlessui/react', 'clsx'],
    complexity: 'moderate',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  radio: {
    name: 'Radio',
    fileName: 'radio.tsx',
    category: 'form',
    description: 'Radio button group for single selections',
    useCases: ['forms', 'settings', 'single-choice', 'options'],
    dependencies: ['@headlessui/react', 'clsx'],
    complexity: 'moderate',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  switch: {
    name: 'Switch',
    fileName: 'switch.tsx',
    category: 'form',
    description: 'Toggle switch for on/off states',
    useCases: ['settings', 'preferences', 'features', 'toggles'],
    dependencies: ['@headlessui/react', 'clsx'],
    complexity: 'moderate',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  combobox: {
    name: 'Combobox',
    fileName: 'combobox.tsx',
    category: 'form',
    description: 'Searchable select with autocomplete',
    useCases: ['search', 'autocomplete', 'filters', 'tags'],
    dependencies: ['@headlessui/react', 'clsx'],
    complexity: 'complex',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  listbox: {
    name: 'Listbox',
    fileName: 'listbox.tsx',
    category: 'form',
    description: 'Custom styled listbox/select',
    useCases: ['dropdowns', 'filters', 'options', 'settings'],
    dependencies: ['@headlessui/react', 'clsx'],
    complexity: 'moderate',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  fieldset: {
    name: 'Fieldset',
    fileName: 'fieldset.tsx',
    category: 'form',
    description: 'Form field grouping with legend',
    useCases: ['forms', 'sections', 'grouping'],
    dependencies: ['clsx'],
    complexity: 'simple',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  table: {
    name: 'Table',
    fileName: 'table.tsx',
    category: 'data-display',
    description: 'Professional data table with sorting and styling options',
    useCases: ['data-tables', 'lists', 'reports', 'dashboards'],
    dependencies: ['clsx'],
    complexity: 'complex',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  'description-list': {
    name: 'DescriptionList',
    fileName: 'description-list.tsx',
    category: 'data-display',
    description: 'Key-value pair display',
    useCases: ['details', 'properties', 'metadata', 'profile-info'],
    dependencies: ['clsx'],
    complexity: 'simple',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  badge: {
    name: 'Badge',
    fileName: 'badge.tsx',
    category: 'data-display',
    description: 'Status indicators and labels',
    useCases: ['status', 'tags', 'labels', 'counts', 'notifications'],
    dependencies: ['clsx'],
    complexity: 'simple',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  avatar: {
    name: 'Avatar',
    fileName: 'avatar.tsx',
    category: 'data-display',
    description: 'User profile images with fallbacks',
    useCases: ['profiles', 'users', 'comments', 'chat'],
    dependencies: ['clsx'],
    complexity: 'simple',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  heading: {
    name: 'Heading',
    fileName: 'heading.tsx',
    category: 'data-display',
    description: 'Styled headings with consistent typography',
    useCases: ['titles', 'sections', 'headers'],
    dependencies: ['clsx'],
    complexity: 'simple',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  text: {
    name: 'Text',
    fileName: 'text.tsx',
    category: 'data-display',
    description: 'Styled text with variants',
    useCases: ['body-text', 'descriptions', 'labels'],
    dependencies: ['clsx'],
    complexity: 'simple',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  divider: {
    name: 'Divider',
    fileName: 'divider.tsx',
    category: 'data-display',
    description: 'Horizontal or vertical separator',
    useCases: ['sections', 'spacing', 'separation'],
    dependencies: ['clsx'],
    complexity: 'simple',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  dialog: {
    name: 'Dialog',
    fileName: 'dialog.tsx',
    category: 'overlay',
    description: 'Modal dialog overlay',
    useCases: ['modals', 'confirmations', 'forms', 'details'],
    dependencies: ['@headlessui/react', 'clsx'],
    complexity: 'moderate',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  dropdown: {
    name: 'Dropdown',
    fileName: 'dropdown.tsx',
    category: 'overlay',
    description: 'Dropdown menu for actions',
    useCases: ['menus', 'actions', 'options', 'context-menu'],
    dependencies: ['@headlessui/react', 'clsx'],
    complexity: 'moderate',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  navbar: {
    name: 'Navbar',
    fileName: 'navbar.tsx',
    category: 'navigation',
    description: 'Top navigation bar',
    useCases: ['header', 'navigation', 'branding'],
    dependencies: ['clsx'],
    complexity: 'moderate',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  sidebar: {
    name: 'Sidebar',
    fileName: 'sidebar.tsx',
    category: 'navigation',
    description: 'Side navigation panel',
    useCases: ['navigation', 'menu', 'dashboard', 'app-layout'],
    dependencies: ['clsx'],
    complexity: 'moderate',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  pagination: {
    name: 'Pagination',
    fileName: 'pagination.tsx',
    category: 'navigation',
    description: 'Page navigation controls',
    useCases: ['tables', 'lists', 'search-results', 'galleries'],
    dependencies: ['clsx'],
    complexity: 'moderate',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  link: {
    name: 'Link',
    fileName: 'link.tsx',
    category: 'navigation',
    description: 'Styled navigation link',
    useCases: ['navigation', 'references', 'routing'],
    dependencies: ['clsx'],
    complexity: 'simple',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  'sidebar-layout': {
    name: 'SidebarLayout',
    fileName: 'sidebar-layout.tsx',
    category: 'layout',
    description: 'Application layout with sidebar navigation',
    useCases: ['app-layout', 'dashboard', 'admin-panel'],
    dependencies: ['@headlessui/react'],
    complexity: 'complex',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  'stacked-layout': {
    name: 'StackedLayout',
    fileName: 'stacked-layout.tsx',
    category: 'layout',
    description: 'Simple stacked layout with header',
    useCases: ['simple-apps', 'marketing', 'content'],
    dependencies: [],
    complexity: 'simple',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },

  'auth-layout': {
    name: 'AuthLayout',
    fileName: 'auth-layout.tsx',
    category: 'layout',
    description: 'Centered layout for authentication pages',
    useCases: ['login', 'signup', 'authentication'],
    dependencies: [],
    complexity: 'simple',
    responsive: true,
    darkMode: true,
    accessibility: {
      ariaSupport: true,
      keyboardNav: true,
      touchTargets: true,
    },
  },
};

/**
 * Get component metadata by name
 */
export function getCatalystComponent(name: string): CatalystComponent | undefined {
  return CATALYST_COMPONENTS[name];
}

/**
 * Get all components in a category
 */
export function getCatalystComponentsByCategory(
  category: CatalystComponent['category']
): CatalystComponent[] {
  return Object.values(CATALYST_COMPONENTS).filter((comp) => comp.category === category);
}

/**
 * Find components matching use case
 */
export function findCatalystComponentsForUseCase(useCase: string): CatalystComponent[] {
  const useCaseLower = useCase.toLowerCase();
  return Object.values(CATALYST_COMPONENTS).filter((comp) =>
    comp.useCases.some((uc) => uc.includes(useCaseLower) || useCaseLower.includes(uc))
  );
}

/**
 * Get component source code
 */
export function getCatalystComponentSource(componentName: string): string {
  const component = getCatalystComponent(componentName);
  if (!component) {
    throw new Error(`Component ${componentName} not found in registry`);
  }

  const componentPath = path.join(
    process.cwd(),
    'lib/tailwindui-components/catalyst-ui-kit/typescript',
    component.fileName
  );

  if (!fs.existsSync(componentPath)) {
    throw new Error(`Component file not found: ${componentPath}`);
  }

  return fs.readFileSync(componentPath, 'utf-8');
}

/**
 * Get all component names
 */
export function getAllCatalystComponentNames(): string[] {
  return Object.keys(CATALYST_COMPONENTS);
}

/**
 * Get components by complexity
 */
export function getCatalystComponentsByComplexity(
  complexity: 'simple' | 'moderate' | 'complex'
): CatalystComponent[] {
  return Object.values(CATALYST_COMPONENTS).filter((comp) => comp.complexity === complexity);
}
