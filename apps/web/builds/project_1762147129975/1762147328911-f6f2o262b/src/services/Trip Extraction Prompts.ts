/**
 * @fileoverview Trip extraction prompts service
 * Contains reusable prompts and text templates for trip data extraction
 */

export interface TripPromptConfig {
  includeLocation: boolean;
  includeDates: boolean;
  includeActivities: boolean;
  maxLength?: number;
}

export interface TripPromptResult {
  prompt: string;
  error?: string;
}

export class TripExtractionPrompts {
  private static readonly DEFAULT_MAX_LENGTH = 500;
  
  private static readonly PROMPT_TEMPLATES = {
    base: "Please extract trip details from the following text:",
    location: "Include location information like cities, countries, and specific places visited.",
    dates: "Include dates and duration of the trip.", 
    activities: "Include activities, experiences and points of interest.",
    format: "Format the response as a structured JSON object."
  };

  /**
   * Generates a prompt for extracting trip information based on config
   * @param config - Configuration options for the prompt
   * @returns Formatted prompt string and any errors
   */
  public static generatePrompt(config: TripPromptConfig): TripPromptResult {
    try {
      const promptParts: string[] = [this.PROMPT_TEMPLATES.base];

      if (config.includeLocation) {
        promptParts.push(this.PROMPT_TEMPLATES.location);
      }

      if (config.includeDates) {
        promptParts.push(this.PROMPT_TEMPLATES.dates);
      }

      if (config.includeActivities) {
        promptParts.push(this.PROMPT_TEMPLATES.activities); 
      }

      promptParts.push(this.PROMPT_TEMPLATES.format);

      const prompt = promptParts.join(" ");
      
      if (config.maxLength && prompt.length > config.maxLength) {
        throw new Error(`Prompt exceeds maximum length of ${config.maxLength} characters`);
      }

      return {
        prompt
      };

    } catch (error) {
      return {
        prompt: this.PROMPT_TEMPLATES.base,
        error: error instanceof Error ? error.message : 'Unknown error generating prompt'
      };
    }
  }

  /**
   * Validates a prompt configuration
   * @param config - Configuration to validate
   * @returns True if valid, throws error if invalid
   */
  public static validateConfig(config: TripPromptConfig): boolean {
    if (!config) {
      throw new Error('Prompt configuration is required');
    }

    if (typeof config.includeLocation !== 'boolean' ||
        typeof config.includeDates !== 'boolean' ||
        typeof config.includeActivities !== 'boolean') {
      throw new Error('Invalid prompt configuration flags');
    }

    if (config.maxLength && (typeof config.maxLength !== 'number' || config.maxLength <= 0)) {
      throw new Error('maxLength must be a positive number');
    }

    return true;
  }

  /**
   * Gets the default prompt configuration
   * @returns Default configuration object
   */
  public static getDefaultConfig(): TripPromptConfig {
    return {
      includeLocation: true,
      includeDates: true,
      includeActivities: true,
      maxLength: this.DEFAULT_MAX_LENGTH
    };
  }

  /**
   * Formats a prompt response for display
   * @param prompt - The prompt string to format
   * @returns Formatted prompt string
   */
  public static formatPrompt(prompt: string): string {
    try {
      return prompt.trim()
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ');
    } catch (error) {
      return '';
    }
  }
}

export default TripExtractionPrompts;