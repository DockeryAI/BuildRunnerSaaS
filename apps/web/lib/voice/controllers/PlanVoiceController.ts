/**
 * Plan Voice Controller
 * Handles voice commands for the Plan page (timeline/milestones)
 */

import { IntentHandler, Intent } from '../IntentRouter';

// Event emitter for plan actions
interface PlanEvent {
  type: 'view_timeline' | 'add_milestone' | 'mark_complete' | 'reorder' | 'estimate';
  data?: any;
}

class PlanEventEmitter {
  private listeners: ((event: PlanEvent) => void)[] = [];

  on(listener: (event: PlanEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(event: PlanEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in plan event listener:', error);
      }
    });
  }
}

export const planEvents = new PlanEventEmitter();

export class PlanVoiceController implements IntentHandler {
  canHandle(intent: Intent): boolean {
    return intent.page === 'plan';
  }

  async handle(intent: Intent): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      switch (intent.action) {
        case 'view_timeline':
          return this.viewTimeline(intent);

        case 'add_milestone':
          return this.addMilestone(intent);

        case 'mark_complete':
          return this.markComplete(intent);

        case 'reorder':
          return this.reorder(intent);

        case 'estimate':
          return this.updateEstimate(intent);

        case 'view_dependencies':
          return this.viewDependencies(intent);

        case 'add_task':
          return this.addTask(intent);

        default:
          return {
            success: false,
            message: `I understand you want to ${intent.action}, but I'm not sure how to do that in the plan.`,
          };
      }
    } catch (error) {
      console.error('Plan Voice Controller error:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error processing that command.',
      };
    }
  }

  /**
   * View project timeline
   */
  private viewTimeline(intent: Intent): { success: boolean; message: string; data?: any } {
    planEvents.emit({
      type: 'view_timeline',
    });

    return {
      success: true,
      message: 'Showing project timeline...',
      data: { view: 'timeline' },
    };
  }

  /**
   * Add a new milestone
   */
  private addMilestone(intent: Intent): { success: boolean; message: string; data?: any } {
    const { name, date, description } = intent.params;

    if (!name) {
      return {
        success: false,
        message: 'Please specify a name for the milestone.',
      };
    }

    planEvents.emit({
      type: 'add_milestone',
      data: { name, date, description },
    });

    return {
      success: true,
      message: `Adding milestone: ${name}${date ? ` for ${date}` : ''}...`,
      data: { name, date, description },
    };
  }

  /**
   * Mark item as complete
   */
  private markComplete(intent: Intent): { success: boolean; message: string; data?: any } {
    const { itemName, itemId } = intent.params;

    if (!itemName && !itemId) {
      return {
        success: false,
        message: 'Please specify which item to mark as complete.',
      };
    }

    planEvents.emit({
      type: 'mark_complete',
      data: { itemName, itemId },
    });

    return {
      success: true,
      message: `Marking ${itemName || 'item'} as complete...`,
      data: { itemName, itemId },
    };
  }

  /**
   * Reorder plan items
   */
  private reorder(intent: Intent): { success: boolean; message: string; data?: any } {
    const { itemName, position } = intent.params;

    if (!itemName) {
      return {
        success: false,
        message: 'Please specify which item to reorder.',
      };
    }

    planEvents.emit({
      type: 'reorder',
      data: { itemName, position },
    });

    return {
      success: true,
      message: `Reordering ${itemName}${position ? ` to position ${position}` : ''}...`,
      data: { itemName, position },
    };
  }

  /**
   * Update time estimate
   */
  private updateEstimate(intent: Intent): { success: boolean; message: string; data?: any } {
    const { itemName, estimate } = intent.params;

    if (!itemName || !estimate) {
      return {
        success: false,
        message: 'Please specify the item and time estimate.',
      };
    }

    planEvents.emit({
      type: 'estimate',
      data: { itemName, estimate },
    });

    return {
      success: true,
      message: `Updated ${itemName} estimate to ${estimate}...`,
      data: { itemName, estimate },
    };
  }

  /**
   * View dependencies
   */
  private viewDependencies(intent: Intent): { success: boolean; message: string; data?: any } {
    const { itemName } = intent.params;

    return {
      success: true,
      message: itemName
        ? `Showing dependencies for ${itemName}...`
        : 'Showing all project dependencies...',
      data: { itemName },
    };
  }

  /**
   * Add a task
   */
  private addTask(intent: Intent): { success: boolean; message: string; data?: any } {
    const { name, assignee, dueDate } = intent.params;

    if (!name) {
      return {
        success: false,
        message: 'Please specify a name for the task.',
      };
    }

    return {
      success: true,
      message: `Adding task: ${name}${assignee ? ` assigned to ${assignee}` : ''}...`,
      data: { name, assignee, dueDate },
    };
  }
}
