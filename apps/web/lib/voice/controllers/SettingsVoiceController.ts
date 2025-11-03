/**
 * Settings Voice Controller
 * Handles voice commands for the Settings page
 */

import { IntentHandler, Intent } from '../IntentRouter';

// Event emitter for settings actions
interface SettingsEvent {
  type: 'update_setting' | 'add_api_key' | 'view_section';
  data?: any;
}

class SettingsEventEmitter {
  private listeners: ((event: SettingsEvent) => void)[] = [];

  on(listener: (event: SettingsEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(event: SettingsEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in settings event listener:', error);
      }
    });
  }
}

export const settingsEvents = new SettingsEventEmitter();

export class SettingsVoiceController implements IntentHandler {
  canHandle(intent: Intent): boolean {
    return intent.page === 'settings';
  }

  async handle(intent: Intent): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      switch (intent.action) {
        case 'update_setting':
          return this.updateSetting(intent);

        case 'add_api_key':
          return this.addApiKey(intent);

        case 'view_section':
          return this.viewSection(intent);

        case 'toggle_feature':
          return this.toggleFeature(intent);

        case 'change_theme':
          return this.changeTheme(intent);

        case 'manage_integrations':
          return this.manageIntegrations(intent);

        default:
          return {
            success: false,
            message: `I understand you want to ${intent.action}, but I'm not sure how to do that in settings.`,
          };
      }
    } catch (error) {
      console.error('Settings Voice Controller error:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error processing that command.',
      };
    }
  }

  /**
   * Update a setting
   */
  private updateSetting(intent: Intent): { success: boolean; message: string; data?: any } {
    const { setting, value } = intent.params;

    if (!setting) {
      return {
        success: false,
        message: 'Please specify which setting to update.',
      };
    }

    settingsEvents.emit({
      type: 'update_setting',
      data: { setting, value },
    });

    return {
      success: true,
      message: value
        ? `Updating ${setting} to ${value}...`
        : `Opening ${setting} settings...`,
      data: { setting, value },
    };
  }

  /**
   * Add API key
   */
  private addApiKey(intent: Intent): { success: boolean; message: string; data?: any } {
    const { service } = intent.params;

    if (!service) {
      return {
        success: false,
        message: 'Please specify which service API key to add.',
      };
    }

    settingsEvents.emit({
      type: 'add_api_key',
      data: { service },
    });

    return {
      success: true,
      message: `Opening API key setup for ${service}. For security, please enter your key manually.`,
      data: { service },
    };
  }

  /**
   * View settings section
   */
  private viewSection(intent: Intent): { success: boolean; message: string; data?: any } {
    const { section } = intent.params;

    if (!section) {
      return {
        success: false,
        message: 'Please specify which settings section to view.',
      };
    }

    settingsEvents.emit({
      type: 'view_section',
      data: { section },
    });

    return {
      success: true,
      message: `Showing ${section} settings...`,
      data: { section },
    };
  }

  /**
   * Toggle a feature
   */
  private toggleFeature(intent: Intent): { success: boolean; message: string; data?: any } {
    const { feature, enabled } = intent.params;

    if (!feature) {
      return {
        success: false,
        message: 'Please specify which feature to toggle.',
      };
    }

    return {
      success: true,
      message: `${enabled ? 'Enabling' : 'Disabling'} ${feature}...`,
      data: { feature, enabled },
    };
  }

  /**
   * Change theme
   */
  private changeTheme(intent: Intent): { success: boolean; message: string; data?: any } {
    const { theme } = intent.params;

    if (!theme) {
      return {
        success: false,
        message: 'Please specify a theme (light, dark, or auto).',
      };
    }

    return {
      success: true,
      message: `Switching to ${theme} theme...`,
      data: { theme },
    };
  }

  /**
   * Manage integrations
   */
  private manageIntegrations(intent: Intent): { success: boolean; message: string; data?: any } {
    const { integration } = intent.params;

    return {
      success: true,
      message: integration
        ? `Opening ${integration} integration settings...`
        : 'Showing all integrations...',
      data: { integration },
    };
  }
}
