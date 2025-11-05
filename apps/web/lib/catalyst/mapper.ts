/**
 * Catalyst Component Mapper
 * Intelligently maps PRD features to Catalyst UI components
 */

import {
  CATALYST_COMPONENTS,
  getCatalystComponent,
  findCatalystComponentsForUseCase,
  type CatalystComponent,
} from './registry';

export interface FeatureMappingResult {
  feature: string;
  primaryComponent: CatalystComponent | null;
  supportingComponents: CatalystComponent[];
  layout: CatalystComponent | null;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface ComponentSelection {
  component: CatalystComponent;
  customization: {
    props: Record<string, any>;
    content: Record<string, string>;
    styling: Record<string, string>;
  };
  priority: number;
}

/**
 * Intelligent mapper for PRD features to Catalyst components
 */
export class CatalystMapper {
  /**
   * Map a feature description to appropriate Catalyst components
   */
  mapFeatureToCatalyst(featureDescription: string): FeatureMappingResult {
    const normalized = featureDescription.toLowerCase();

    // Extract key terms
    const hasAuth = /auth|login|signup|sign.in|sign.up|register/.test(normalized);
    const hasTable = /table|list|data|records|entries/.test(normalized);
    const hasForm = /form|input|submit|create|edit/.test(normalized);
    const hasDashboard = /dashboard|analytics|stats|metrics|overview/.test(normalized);
    const hasSettings = /settings|preferences|config|options/.test(normalized);
    const hasProfile = /profile|user|account/.test(normalized);
    const hasNav = /navigation|menu|sidebar|nav/.test(normalized);
    const hasModal = /modal|dialog|popup|overlay/.test(normalized);

    // Determine primary component
    let primaryComponent: CatalystComponent | null = null;
    let supportingComponents: CatalystComponent[] = [];
    let layout: CatalystComponent | null = null;
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    let reasoning = '';

    // Authentication flows
    if (hasAuth) {
      primaryComponent = getCatalystComponent('input')!;
      supportingComponents = [
        getCatalystComponent('button')!,
        getCatalystComponent('fieldset')!,
        getCatalystComponent('link')!,
      ];
      layout = getCatalystComponent('auth-layout')!;
      confidence = 'high';
      reasoning = 'Authentication requires forms with inputs, buttons, and centered layout';
    }
    // Data tables
    else if (hasTable) {
      primaryComponent = getCatalystComponent('table')!;
      supportingComponents = [
        getCatalystComponent('badge')!,
        getCatalystComponent('dropdown')!,
        getCatalystComponent('pagination')!,
        getCatalystComponent('input')!, // for search
      ];
      layout = getCatalystComponent('sidebar-layout')!;
      confidence = 'high';
      reasoning = 'Data tables require table component with pagination and filtering';
    }
    // Forms
    else if (hasForm) {
      primaryComponent = getCatalystComponent('fieldset')!;
      supportingComponents = [
        getCatalystComponent('input')!,
        getCatalystComponent('textarea')!,
        getCatalystComponent('select')!,
        getCatalystComponent('checkbox')!,
        getCatalystComponent('radio')!,
        getCatalystComponent('button')!,
      ];
      layout = getCatalystComponent('stacked-layout')!;
      confidence = 'high';
      reasoning = 'Forms require multiple input types with fieldset organization';
    }
    // Dashboard
    else if (hasDashboard) {
      primaryComponent = getCatalystComponent('table')!;
      supportingComponents = [
        getCatalystComponent('badge')!,
        getCatalystComponent('avatar')!,
        getCatalystComponent('dropdown')!,
      ];
      layout = getCatalystComponent('sidebar-layout')!;
      confidence = 'high';
      reasoning = 'Dashboards need sidebar layout with data display components';
    }
    // Settings
    else if (hasSettings) {
      primaryComponent = getCatalystComponent('fieldset')!;
      supportingComponents = [
        getCatalystComponent('switch')!,
        getCatalystComponent('select')!,
        getCatalystComponent('input')!,
        getCatalystComponent('button')!,
      ];
      layout = getCatalystComponent('sidebar-layout')!;
      confidence = 'high';
      reasoning = 'Settings pages use forms with switches and selects';
    }
    // Profile
    else if (hasProfile) {
      primaryComponent = getCatalystComponent('avatar')!;
      supportingComponents = [
        getCatalystComponent('description-list')!,
        getCatalystComponent('badge')!,
        getCatalystComponent('button')!,
      ];
      layout = getCatalystComponent('stacked-layout')!;
      confidence = 'high';
      reasoning = 'Profile pages display user info with avatar and description lists';
    }
    // Navigation
    else if (hasNav) {
      primaryComponent = getCatalystComponent('sidebar')!;
      supportingComponents = [
        getCatalystComponent('navbar')!,
        getCatalystComponent('link')!,
        getCatalystComponent('avatar')!,
      ];
      layout = getCatalystComponent('sidebar-layout')!;
      confidence = 'high';
      reasoning = 'Navigation requires sidebar or navbar components';
    }
    // Modal/Dialog
    else if (hasModal) {
      primaryComponent = getCatalystComponent('dialog')!;
      supportingComponents = [
        getCatalystComponent('button')!,
        getCatalystComponent('heading')!,
        getCatalystComponent('text')!,
      ];
      layout = null;
      confidence = 'high';
      reasoning = 'Modals use dialog component with buttons and content';
    }
    // Fallback to general-purpose components
    else {
      primaryComponent = getCatalystComponent('button')!;
      supportingComponents = [
        getCatalystComponent('heading')!,
        getCatalystComponent('text')!,
        getCatalystComponent('divider')!,
      ];
      layout = getCatalystComponent('stacked-layout')!;
      confidence = 'low';
      reasoning = 'Generic feature - using basic components';
    }

    return {
      feature: featureDescription,
      primaryComponent,
      supportingComponents: supportingComponents.filter(Boolean),
      layout,
      confidence,
      reasoning,
    };
  }

  /**
   * Select optimal layout based on app type
   */
  selectLayout(
    appType: string
  ): 'sidebar-layout' | 'stacked-layout' | 'auth-layout' {
    const normalized = appType.toLowerCase();

    if (
      normalized.includes('dashboard') ||
      normalized.includes('admin') ||
      normalized.includes('app')
    ) {
      return 'sidebar-layout';
    }

    if (
      normalized.includes('auth') ||
      normalized.includes('login') ||
      normalized.includes('signup')
    ) {
      return 'auth-layout';
    }

    return 'stacked-layout';
  }

  /**
   * Map component type keywords to Catalyst components
   */
  mapComponentType(type: string): CatalystComponent[] {
    const typeMap: Record<string, string[]> = {
      button: ['button'],
      form: ['input', 'textarea', 'select', 'checkbox', 'radio', 'fieldset', 'button'],
      'form-input': ['input', 'fieldset'],
      'form-select': ['select', 'listbox', 'combobox'],
      'form-checkbox': ['checkbox'],
      'form-radio': ['radio'],
      'form-switch': ['switch'],
      table: ['table', 'pagination'],
      'data-table': ['table', 'pagination', 'dropdown'],
      list: ['table', 'avatar', 'badge'],
      card: ['heading', 'text', 'divider', 'button'],
      modal: ['dialog', 'button'],
      dialog: ['dialog'],
      navigation: ['sidebar', 'navbar', 'link'],
      navbar: ['navbar', 'link', 'dropdown'],
      sidebar: ['sidebar', 'link'],
      dropdown: ['dropdown'],
      menu: ['dropdown'],
      badge: ['badge'],
      avatar: ['avatar'],
      settings: ['fieldset', 'switch', 'select', 'button'],
      profile: ['avatar', 'description-list', 'badge', 'button'],
      authentication: ['input', 'button', 'link', 'fieldset'],
      search: ['input', 'combobox'],
      filter: ['select', 'checkbox', 'combobox'],
    };

    const componentNames = typeMap[type.toLowerCase()] || [];
    return componentNames
      .map((name) => getCatalystComponent(name))
      .filter(Boolean) as CatalystComponent[];
  }

  /**
   * Select components for an entire page
   */
  selectPageComponents(pageDescription: string): ComponentSelection[] {
    const selections: ComponentSelection[] = [];
    const mapping = this.mapFeatureToCatalyst(pageDescription);

    // Add layout if applicable
    if (mapping.layout) {
      selections.push({
        component: mapping.layout,
        customization: {
          props: {},
          content: {},
          styling: {},
        },
        priority: 1,
      });
    }

    // Add primary component
    if (mapping.primaryComponent) {
      selections.push({
        component: mapping.primaryComponent,
        customization: {
          props: {},
          content: {},
          styling: {},
        },
        priority: 2,
      });
    }

    // Add supporting components
    mapping.supportingComponents.forEach((comp, index) => {
      selections.push({
        component: comp,
        customization: {
          props: {},
          content: {},
          styling: {},
        },
        priority: 3 + index,
      });
    });

    return selections;
  }

  /**
   * Generate customization suggestions based on feature requirements
   */
  generateCustomization(
    component: CatalystComponent,
    requirements: string[]
  ): ComponentSelection['customization'] {
    const customization: ComponentSelection['customization'] = {
      props: {},
      content: {},
      styling: {},
    };

    // Button customizations
    if (component.name === 'Button') {
      if (requirements.some((r) => /primary|main|submit/.test(r))) {
        customization.props.color = 'indigo';
      }
      if (requirements.some((r) => /destructive|delete|remove/.test(r))) {
        customization.props.color = 'red';
      }
      if (requirements.some((r) => /secondary|cancel/.test(r))) {
        customization.props.outline = true;
      }
    }

    // Input customizations
    if (component.name === 'Input') {
      if (requirements.some((r) => /email/.test(r))) {
        customization.props.type = 'email';
      }
      if (requirements.some((r) => /password/.test(r))) {
        customization.props.type = 'password';
      }
      if (requirements.some((r) => /required|mandatory/.test(r))) {
        customization.props.required = true;
      }
    }

    // Table customizations
    if (component.name === 'Table') {
      if (requirements.some((r) => /striped|alternate/.test(r))) {
        customization.props.striped = true;
      }
      if (requirements.some((r) => /compact|dense/.test(r))) {
        customization.props.dense = true;
      }
      if (requirements.some((r) => /grid|bordered/.test(r))) {
        customization.props.grid = true;
      }
    }

    return customization;
  }

  /**
   * Analyze PRD and generate complete component map
   */
  analyzeAndMapPRD(prd: {
    features: Array<{ name: string; description: string; requirements?: string[] }>;
    appType?: string;
  }): {
    layout: string;
    features: Array<{
      feature: string;
      components: ComponentSelection[];
      mapping: FeatureMappingResult;
    }>;
  } {
    const layout = prd.appType ? this.selectLayout(prd.appType) : 'stacked-layout';

    const features = prd.features.map((feature) => {
      const mapping = this.mapFeatureToCatalyst(feature.description);
      const components: ComponentSelection[] = [];

      // Add primary component with customization
      if (mapping.primaryComponent) {
        components.push({
          component: mapping.primaryComponent,
          customization: this.generateCustomization(
            mapping.primaryComponent,
            feature.requirements || []
          ),
          priority: 1,
        });
      }

      // Add supporting components
      mapping.supportingComponents.forEach((comp, index) => {
        components.push({
          component: comp,
          customization: this.generateCustomization(comp, feature.requirements || []),
          priority: 2 + index,
        });
      });

      return {
        feature: feature.name,
        components,
        mapping,
      };
    });

    return {
      layout,
      features,
    };
  }
}

/**
 * Quick mapping functions
 */
export function quickMapFeature(featureDescription: string): FeatureMappingResult {
  const mapper = new CatalystMapper();
  return mapper.mapFeatureToCatalyst(featureDescription);
}

export function quickSelectComponents(pageDescription: string): ComponentSelection[] {
  const mapper = new CatalystMapper();
  return mapper.selectPageComponents(pageDescription);
}
