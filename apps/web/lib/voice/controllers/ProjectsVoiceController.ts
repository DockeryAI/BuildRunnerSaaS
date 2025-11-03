/**
 * Projects Voice Controller
 * Handles voice commands for the Projects page
 */

import { IntentHandler, Intent } from '../IntentRouter';

// Event emitter for project actions
interface ProjectEvent {
  type: 'create' | 'open' | 'delete' | 'search' | 'filter';
  data?: any;
}

class ProjectEventEmitter {
  private listeners: ((event: ProjectEvent) => void)[] = [];

  on(listener: (event: ProjectEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(event: ProjectEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in project event listener:', error);
      }
    });
  }
}

export const projectEvents = new ProjectEventEmitter();

export class ProjectsVoiceController implements IntentHandler {
  canHandle(intent: Intent): boolean {
    return intent.page === 'projects';
  }

  async handle(intent: Intent): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      switch (intent.action) {
        case 'create_project':
          return this.createProject(intent);

        case 'open_project':
          return this.openProject(intent);

        case 'delete_project':
          return this.deleteProject(intent);

        case 'search_projects':
          return this.searchProjects(intent);

        case 'filter_projects':
          return this.filterProjects(intent);

        case 'view_recent':
          return this.viewRecent(intent);

        case 'view_templates':
          return this.viewTemplates(intent);

        default:
          return {
            success: false,
            message: `I understand you want to ${intent.action}, but I'm not sure how to do that with projects.`,
          };
      }
    } catch (error) {
      console.error('Projects Voice Controller error:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error processing that command.',
      };
    }
  }

  /**
   * Create a new project
   */
  private createProject(intent: Intent): { success: boolean; message: string; data?: any } {
    const { name, template } = intent.params;

    projectEvents.emit({
      type: 'create',
      data: { name, template },
    });

    return {
      success: true,
      message: name
        ? `Creating new project: ${name}...`
        : 'Opening new project wizard...',
      data: { name, template },
    };
  }

  /**
   * Open an existing project
   */
  private openProject(intent: Intent): { success: boolean; message: string; data?: any } {
    const { projectName, projectId } = intent.params;

    if (!projectName && !projectId) {
      return {
        success: false,
        message: 'Please specify which project to open.',
      };
    }

    projectEvents.emit({
      type: 'open',
      data: { projectName, projectId },
    });

    return {
      success: true,
      message: `Opening ${projectName || 'project'}...`,
      data: { projectName, projectId },
    };
  }

  /**
   * Delete a project
   */
  private deleteProject(intent: Intent): { success: boolean; message: string; data?: any } {
    const { projectName, projectId } = intent.params;

    if (!projectName && !projectId) {
      return {
        success: false,
        message: 'Please specify which project to delete.',
      };
    }

    projectEvents.emit({
      type: 'delete',
      data: { projectName, projectId },
    });

    return {
      success: true,
      message: `Are you sure you want to delete ${projectName || 'this project'}? This action cannot be undone.`,
      data: { projectName, projectId, requiresConfirmation: true },
    };
  }

  /**
   * Search for projects
   */
  private searchProjects(intent: Intent): { success: boolean; message: string; data?: any } {
    const { query } = intent.params;

    if (!query) {
      return {
        success: false,
        message: 'What would you like to search for?',
      };
    }

    projectEvents.emit({
      type: 'search',
      data: { query },
    });

    return {
      success: true,
      message: `Searching for projects matching "${query}"...`,
      data: { query },
    };
  }

  /**
   * Filter projects
   */
  private filterProjects(intent: Intent): { success: boolean; message: string; data?: any } {
    const { status, date, tag } = intent.params;

    projectEvents.emit({
      type: 'filter',
      data: { status, date, tag },
    });

    const filters: string[] = [];
    if (status) filters.push(`status: ${status}`);
    if (date) filters.push(`date: ${date}`);
    if (tag) filters.push(`tag: ${tag}`);

    return {
      success: true,
      message: filters.length > 0
        ? `Filtering projects by ${filters.join(', ')}...`
        : 'Showing all projects...',
      data: { status, date, tag },
    };
  }

  /**
   * View recent projects
   */
  private viewRecent(intent: Intent): { success: boolean; message: string; data?: any } {
    return {
      success: true,
      message: 'Showing your recent projects...',
      data: { filter: 'recent' },
    };
  }

  /**
   * View templates
   */
  private viewTemplates(intent: Intent): { success: boolean; message: string; data?: any } {
    return {
      success: true,
      message: 'Showing available project templates...',
      data: { view: 'templates' },
    };
  }
}
