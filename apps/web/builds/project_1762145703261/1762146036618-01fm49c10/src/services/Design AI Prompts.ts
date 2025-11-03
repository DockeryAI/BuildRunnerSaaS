/**
 * @fileoverview Service for generating and managing AI prompts
 */

type PromptTemplate = {
  id: string;
  name: string;
  template: string;
  variables: string[];
  category: string;
  created: Date;
  lastModified: Date;
};

type PromptVariables = Record<string, string>;

type GeneratedPrompt = {
  id: string;
  prompt: string;
  template: PromptTemplate;
  variables: PromptVariables;
  timestamp: Date;
};

/**
 * Service class for working with AI prompts
 */
export class PromptDesignService {
  private templates: Map<string, PromptTemplate>;
  private history: GeneratedPrompt[];

  constructor() {
    this.templates = new Map();
    this.history = [];
  }

  /**
   * Creates a new prompt template
   * @param template - The prompt template to create
   * @throws {Error} If template with same ID already exists
   * @returns The created template
   */
  public createTemplate(template: Omit<PromptTemplate, 'created' | 'lastModified'>): PromptTemplate {
    if (this.templates.has(template.id)) {
      throw new Error(`Template with ID ${template.id} already exists`);
    }

    const newTemplate: PromptTemplate = {
      ...template,
      created: new Date(),
      lastModified: new Date()
    };

    this.templates.set(template.id, newTemplate);
    return newTemplate;
  }

  /**
   * Updates an existing prompt template
   * @param id - ID of template to update
   * @param updates - Fields to update
   * @throws {Error} If template not found
   * @returns Updated template
   */
  public updateTemplate(
    id: string,
    updates: Partial<Omit<PromptTemplate, 'id' | 'created' | 'lastModified'>>
  ): PromptTemplate {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template with ID ${id} not found`);
    }

    const updatedTemplate: PromptTemplate = {
      ...template,
      ...updates,
      lastModified: new Date()
    };

    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  /**
   * Deletes a prompt template
   * @param id - ID of template to delete
   * @throws {Error} If template not found
   */
  public deleteTemplate(id: string): void {
    if (!this.templates.has(id)) {
      throw new Error(`Template with ID ${id} not found`);
    }
    this.templates.delete(id);
  }

  /**
   * Gets a prompt template by ID
   * @param id - Template ID
   * @throws {Error} If template not found
   * @returns The prompt template
   */
  public getTemplate(id: string): PromptTemplate {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template with ID ${id} not found`);
    }
    return template;
  }

  /**
   * Gets all prompt templates
   * @returns Array of all templates
   */
  public getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Generates a prompt from a template with variables
   * @param templateId - ID of template to use
   * @param variables - Variables to inject into template
   * @throws {Error} If template not found or missing required variables
   * @returns Generated prompt
   */
  public generatePrompt(templateId: string, variables: PromptVariables): GeneratedPrompt {
    const template = this.getTemplate(templateId);
    
    // Verify all required variables are provided
    const missingVars = template.variables.filter(v => !(v in variables));
    if (missingVars.length > 0) {
      throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
    }

    let prompt = template.template;
    
    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    const generated: GeneratedPrompt = {
      id: `${templateId}-${Date.now()}`,
      prompt,
      template,
      variables,
      timestamp: new Date()
    };

    this.history.push(generated);
    return generated;
  }

  /**
   * Gets prompt generation history
   * @param limit - Optional limit on number of history items
   * @returns Array of generated prompts
   */
  public getHistory(limit?: number): GeneratedPrompt[] {
    const history = [...this.history];
    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Clears prompt generation history
   */
  public clearHistory(): void {
    this.history = [];
  }

  /**
   * Validates a prompt template
   * @param template - Template to validate
   * @throws {Error} If template is invalid
   */
  private validateTemplate(template: PromptTemplate): void {
    if (!template.id || typeof template.id !== 'string') {
      throw new Error('Template must have valid ID');
    }

    if (!template.template || typeof template.template !== 'string') {
      throw new Error('Template must have valid template string');
    }

    if (!Array.isArray(template.variables)) {
      throw new Error('Template variables must be an array');
    }

    // Check that all variables in template string are declared
    const templateVars = template.template.match(/{{([^}]+)}}/g)?.map(v => v.slice(2, -2)) || [];
    const undeclaredVars = templateVars.filter(v => !template.variables.includes(v));
    
    if (undeclaredVars.length > 0) {
      throw new Error(`Template contains undeclared variables: ${undeclaredVars.join(', ')}`);
    }
  }
}