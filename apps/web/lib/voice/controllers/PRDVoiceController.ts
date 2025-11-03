/**
 * PRD Voice Controller
 * Handles voice commands for the PRD Builder (create page)
 */

import { IntentHandler, Intent } from '../IntentRouter';
import { useOrchestrationStore } from '@/lib/stores/orchestration-store';
import type { PRDItem } from '@/lib/stores/orchestration-store';

export class PRDVoiceController implements IntentHandler {
  canHandle(intent: Intent): boolean {
    return intent.page === 'create';
  }

  async handle(intent: Intent): Promise<{ success: boolean; message: string; data?: any }> {
    const store = useOrchestrationStore.getState();

    try {
      switch (intent.action) {
        case 'add_section':
          return await this.addSection(intent, store);

        case 'generate_prd':
          return await this.generatePRD(intent, store);

        case 'edit_section':
          return await this.editSection(intent, store);

        case 'read_back':
          return await this.readBack(intent, store);

        case 'save_prd':
          return await this.savePRD(intent, store);

        case 'brainstorm':
          return await this.brainstorm(intent, store);

        case 'change_phase':
          return await this.changePhase(intent, store);

        case 'delete_item':
          return await this.deleteItem(intent, store);

        case 'view_suggestions':
          return await this.viewSuggestions(intent, store);

        case 'set_idea':
          return await this.setIdea(intent, store);

        default:
          return {
            success: false,
            message: `I understand you want to ${intent.action}, but I'm not sure how to do that yet.`,
          };
      }
    } catch (error) {
      console.error('PRD Voice Controller error:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error processing that command.',
      };
    }
  }

  /**
   * Add content to a PRD section
   */
  private async addSection(
    intent: Intent,
    store: ReturnType<typeof useOrchestrationStore.getState>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const { sectionId, content, title } = intent.params;

    if (!sectionId || !content) {
      return {
        success: false,
        message: 'Please specify which section and what content to add.',
      };
    }

    const currentPhase = store.currentPhase;
    const sections = store.sections[currentPhase];
    const section = sections?.find((s) => s.id === sectionId);

    if (!section) {
      return {
        success: false,
        message: `I couldn't find the ${sectionId} section. Available sections are: ${sections?.map((s) => s.name).join(', ')}.`,
      };
    }

    // Create new PRD item
    const newItem: PRDItem = {
      id: `item-${Date.now()}`,
      title: title || 'Voice Added Item',
      shortDescription: content.substring(0, 100),
      fullDescription: content,
      citations: [],
      status: 'active',
    };

    await store.addItemToSection(currentPhase, sectionId, newItem);

    return {
      success: true,
      message: `Added "${title || 'new item'}" to ${section.name}.`,
      data: { itemId: newItem.id },
    };
  }

  /**
   * Generate PRD content using AI
   */
  private async generatePRD(
    intent: Intent,
    store: ReturnType<typeof useOrchestrationStore.getState>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const { section, type } = intent.params;

    if (!store.productIdea) {
      return {
        success: false,
        message: 'Please set a product idea first by saying "set product idea to [your idea]".',
      };
    }

    // Trigger AI generation
    try {
      await store.startOrchestration();

      return {
        success: true,
        message: `Started generating PRD content for ${section || 'all sections'}. This may take a moment.`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to start PRD generation. Please try again.',
      };
    }
  }

  /**
   * Edit a PRD section item
   */
  private async editSection(
    intent: Intent,
    store: ReturnType<typeof useOrchestrationStore.getState>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const { sectionId, itemId, content } = intent.params;

    if (!sectionId || !itemId || !content) {
      return {
        success: false,
        message: 'Please specify which section, item, and the new content.',
      };
    }

    const currentPhase = store.currentPhase;

    await store.updateItem(currentPhase, sectionId, itemId, {
      fullDescription: content,
      shortDescription: content.substring(0, 100),
    });

    return {
      success: true,
      message: 'Updated the item successfully.',
    };
  }

  /**
   * Read back PRD content
   */
  private async readBack(
    intent: Intent,
    store: ReturnType<typeof useOrchestrationStore.getState>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const { sectionId } = intent.params;
    const currentPhase = store.currentPhase;
    const sections = store.sections[currentPhase];

    if (sectionId) {
      // Read specific section
      const section = sections?.find((s) => s.id === sectionId);
      if (!section) {
        return {
          success: false,
          message: `Couldn't find section ${sectionId}.`,
        };
      }

      if (section.items.length === 0) {
        return {
          success: true,
          message: `The ${section.name} section is currently empty.`,
        };
      }

      const itemsSummary = section.items
        .map((item, idx) => `${idx + 1}. ${item.title}: ${item.shortDescription}`)
        .join('. ');

      return {
        success: true,
        message: `${section.name} has ${section.items.length} items. ${itemsSummary}`,
        data: { section, items: section.items },
      };
    } else {
      // Read entire phase summary
      const totalItems = sections?.reduce((sum, s) => sum + s.items.length, 0) || 0;
      const sectionSummary = sections?.map((s) => `${s.name}: ${s.items.length} items`).join(', ');

      return {
        success: true,
        message: `Phase ${currentPhase} has ${totalItems} total items across ${sections?.length} sections. ${sectionSummary}.`,
        data: { phase: currentPhase, sections },
      };
    }
  }

  /**
   * Save PRD (triggers autosave)
   */
  private async savePRD(
    intent: Intent,
    store: ReturnType<typeof useOrchestrationStore.getState>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    // Trigger sync to registry
    try {
      await store.syncToRegistry();

      return {
        success: true,
        message: 'PRD saved successfully and synced to feature registry.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save PRD. Please try again.',
      };
    }
  }

  /**
   * Start brainstorming session
   */
  private async brainstorm(
    intent: Intent,
    store: ReturnType<typeof useOrchestrationStore.getState>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const { topic } = intent.params;

    if (!store.productIdea) {
      return {
        success: false,
        message: 'Please set a product idea first.',
      };
    }

    return {
      success: true,
      message: `Let's brainstorm about ${topic || 'your product'}. What aspects would you like to explore?`,
      data: { mode: 'brainstorm', topic },
    };
  }

  /**
   * Change current phase
   */
  private async changePhase(
    intent: Intent,
    store: ReturnType<typeof useOrchestrationStore.getState>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const { phase } = intent.params;

    if (!phase || phase < 1 || phase > 4) {
      return {
        success: false,
        message: 'Please specify a valid phase number between 1 and 4.',
      };
    }

    store.setCurrentPhase(phase);

    const phaseNames = {
      1: 'Context',
      2: 'Shape',
      3: 'Evidence',
      4: 'Launch',
    };

    return {
      success: true,
      message: `Switched to Phase ${phase}: ${phaseNames[phase as keyof typeof phaseNames]}.`,
      data: { phase },
    };
  }

  /**
   * Delete an item
   */
  private async deleteItem(
    intent: Intent,
    store: ReturnType<typeof useOrchestrationStore.getState>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const { sectionId, itemId } = intent.params;

    if (!sectionId || !itemId) {
      return {
        success: false,
        message: 'Please specify which section and item to delete.',
      };
    }

    const currentPhase = store.currentPhase;

    await store.deleteItem(currentPhase, sectionId, itemId);

    return {
      success: true,
      message: 'Item deleted successfully.',
    };
  }

  /**
   * View AI suggestions
   */
  private async viewSuggestions(
    intent: Intent,
    store: ReturnType<typeof useOrchestrationStore.getState>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const suggestions = store.suggestions;

    if (suggestions.length === 0) {
      return {
        success: true,
        message: 'There are currently no AI suggestions. Try generating PRD content first.',
      };
    }

    const suggestionSummary = suggestions
      .slice(0, 3)
      .map((s, idx) => `${idx + 1}. ${s.title}`)
      .join(', ');

    return {
      success: true,
      message: `You have ${suggestions.length} suggestions. Top suggestions: ${suggestionSummary}.`,
      data: { suggestions },
    };
  }

  /**
   * Set product idea
   */
  private async setIdea(
    intent: Intent,
    store: ReturnType<typeof useOrchestrationStore.getState>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const { idea } = intent.params;

    if (!idea) {
      return {
        success: false,
        message: 'Please provide a product idea.',
      };
    }

    store.setProductIdea(idea);

    return {
      success: true,
      message: `Product idea set to: "${idea}". Ready to start building your PRD!`,
      data: { idea },
    };
  }
}
