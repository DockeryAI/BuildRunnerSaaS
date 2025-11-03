```typescript
/**
 * @fileoverview Service for generating mental health conversation prompts
 */

type Mood = 'anxious' | 'depressed' | 'stressed' | 'overwhelmed' | 'neutral' | 'positive';

type PromptCategory = 'self_reflection' | 'coping_strategies' | 'emotional_awareness' | 'goal_setting' | 'gratitude';

interface Prompt {
  id: string;
  text: string;
  category: PromptCategory;
  recommendedMoods: Mood[];
}

/**
 * Service class for managing and generating mental health conversation prompts
 */
export class MentalHealthPromptService {
  private prompts: Map<string, Prompt>;

  constructor() {
    this.prompts = new Map();
    this.initializePrompts();
  }

  /**
   * Initializes the default set of prompts
   * @private
   */
  private initializePrompts(): void {
    const defaultPrompts: Prompt[] = [
      {
        id: 'sr-1',
        text: 'What emotions have you been experiencing most strongly today?',
        category: 'self_reflection',
        recommendedMoods: ['anxious', 'depressed', 'overwhelmed']
      },
      {
        id: 'cs-1',
        text: 'What coping strategies have worked well for you in the past?',
        category: 'coping_strategies',
        recommendedMoods: ['anxious', 'stressed']
      },
      {
        id: 'ea-1',
        text: 'Where in your body do you feel tension or stress right now?',
        category: 'emotional_awareness',
        recommendedMoods: ['stressed', 'overwhelmed']
      },
      {
        id: 'gs-1', 
        text: 'What small step could you take today toward feeling better?',
        category: 'goal_setting',
        recommendedMoods: ['depressed', 'neutral']
      },
      {
        id: 'gr-1',
        text: 'What are three things you feel grateful for in this moment?',
        category: 'gratitude',
        recommendedMoods: ['neutral', 'positive']
      }
    ];

    defaultPrompts.forEach(prompt => {
      this.prompts.set(prompt.id, prompt);
    });
  }

  /**
   * Gets a random prompt appropriate for the given mood
   * @param mood - Current mood to match prompts against
   * @returns A relevant conversation prompt
   * @throws Error if no matching prompts are found
   */
  public getPromptForMood(mood: Mood): Prompt {
    const matchingPrompts = Array.from(this.prompts.values())
      .filter(prompt => prompt.recommendedMoods.includes(mood));

    if (matchingPrompts.length === 0) {
      throw new Error(`No prompts found for mood: ${mood}`);
    }

    const randomIndex = Math.floor(Math.random() * matchingPrompts.length);
    return matchingPrompts[randomIndex];
  }

  /**
   * Gets all prompts for a specific category
   * @param category - The prompt category to filter by
   * @returns Array of prompts in the requested category
   */
  public getPromptsByCategory(category: PromptCategory): Prompt[] {
    return Array.from(this.prompts.values())
      .filter(prompt => prompt.category === category);
  }

  /**
   * Adds a new custom prompt
   * @param prompt - The prompt to add
   * @throws Error if prompt with same ID already exists
   */
  public addPrompt(prompt: Prompt): void {
    if (this.prompts.has(prompt.id)) {
      throw new Error(`Prompt with ID ${prompt.id} already exists`);
    }
    this.prompts.set(prompt.id, prompt);
  }

  /**
   * Updates an existing prompt
   * @param promptId - ID of prompt to update
   * @param updatedPrompt - New prompt data
   * @throws Error if prompt does not exist
   */
  public updatePrompt(promptId: string, updatedPrompt: Prompt): void {
    if (!this.prompts.has(promptId)) {
      throw new Error(`Prompt with ID ${promptId} not found`);
    }
    this.prompts.set(promptId, updatedPrompt);
  }

  /**
   * Deletes a prompt
   * @param promptId - ID of prompt to delete
   * @throws Error if prompt does not exist
   */
  public deletePrompt(promptId: string): void {
    if (!this.prompts.has(promptId)) {
      throw new Error(`Prompt with ID ${promptId} not found`);
    }
    this.prompts.delete(promptId);
  }

  /**
   * Gets all available prompts
   * @returns Array of all prompts
   */
  public getAllPrompts(): Prompt[] {
    return Array.from(this.prompts.values());
  }
}

export default MentalHealthPromptService;
```