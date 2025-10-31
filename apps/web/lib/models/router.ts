import { ModelProfilesStorage, ProjectModelSettingsStorage } from './storage';

export type TaskType = 'planner' | 'builder' | 'qa' | 'explain' | 'rescope' | 'arbitrate';

export interface ModelSelection {
  modelName: string;
  provider: string;
  fallbackModel?: string;
  confidence: number;
  reason: string;
}

export interface RouterContext {
  projectId?: string;
  taskType: TaskType;
  complexity?: 'low' | 'medium' | 'high';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  budget?: number;
  qualityThreshold?: number;
}

/**
 * Model Router - Selects the best model for a given task type
 */
export class ModelRouter {
  private static defaultMappings: Record<TaskType, string[]> = {
    planner: ['gpt-4', 'claude-3-sonnet'],
    builder: ['gpt-3.5-turbo', 'claude-3-haiku', 'gpt-4'],
    qa: ['gpt-3.5-turbo', 'claude-3-haiku'],
    explain: ['gpt-4', 'claude-3-sonnet'],
    rescope: ['gpt-3.5-turbo', 'gpt-4'],
    arbitrate: ['gpt-4', 'claude-3-sonnet'],
  };

  /**
   * Select the best model for a given context
   */
  static async selectModel(context: RouterContext): Promise<ModelSelection> {
    try {
      // Get project-specific settings if available
      let projectSettings = null;
      if (context.projectId) {
        const settings = await ProjectModelSettingsStorage.getByProject(context.projectId);
        projectSettings = settings.find(s => s.taskType === context.taskType);
      }

      // Use project-specific model if configured
      if (projectSettings?.preferredModel) {
        const modelProfile = await this.getModelProfile(projectSettings.preferredModel);
        if (modelProfile && modelProfile.enabled) {
          return {
            modelName: projectSettings.preferredModel,
            provider: modelProfile.provider,
            fallbackModel: projectSettings.fallbackModel,
            confidence: 0.9,
            reason: 'Project-specific configuration',
          };
        }
      }

      // Get available models for this task type
      const availableModels = await ModelProfilesStorage.getByTaskType(context.taskType);
      
      if (availableModels.length === 0) {
        // Fallback to default mapping
        const defaultModels = this.defaultMappings[context.taskType] || ['gpt-4'];
        return {
          modelName: defaultModels[0],
          provider: 'openai',
          confidence: 0.5,
          reason: 'Default fallback - no models configured for task type',
        };
      }

      // Score models based on context
      const scoredModels = availableModels.map(model => ({
        model,
        score: this.scoreModel(model, context),
      }));

      // Sort by score (highest first)
      scoredModels.sort((a, b) => b.score - a.score);

      const bestModel = scoredModels[0].model;
      const fallbackModel = scoredModels[1]?.model;

      return {
        modelName: bestModel.name,
        provider: bestModel.provider,
        fallbackModel: fallbackModel?.name,
        confidence: Math.min(scoredModels[0].score / 100, 1.0),
        reason: this.getSelectionReason(bestModel, context),
      };
    } catch (error) {
      console.error('Model selection failed:', error);
      
      // Emergency fallback
      const defaultModels = this.defaultMappings[context.taskType] || ['gpt-4'];
      return {
        modelName: defaultModels[0],
        provider: 'openai',
        confidence: 0.3,
        reason: 'Emergency fallback due to selection error',
      };
    }
  }

  /**
   * Score a model based on context
   */
  private static scoreModel(model: any, context: RouterContext): number {
    let score = 0;

    // Base quality score (0-40 points)
    score += model.qualityRating * 4;

    // Speed consideration (0-20 points)
    if (context.priority === 'urgent') {
      score += model.speedRating * 2;
    } else {
      score += model.speedRating;
    }

    // Cost consideration (0-20 points)
    if (context.budget) {
      const estimatedCost = this.estimateCost(model, context);
      if (estimatedCost <= context.budget) {
        score += 20;
      } else {
        score += Math.max(0, 20 - (estimatedCost - context.budget) * 10);
      }
    } else {
      // Prefer lower cost models when no budget specified
      const costScore = Math.max(0, 20 - (model.costPerInputToken * 1000000));
      score += costScore;
    }

    // Complexity matching (0-10 points)
    if (context.complexity === 'high' && model.qualityRating >= 8) {
      score += 10;
    } else if (context.complexity === 'low' && model.speedRating >= 8) {
      score += 10;
    } else if (context.complexity === 'medium') {
      score += 5;
    }

    // Function calling support (0-10 points)
    if (model.supportsFunctionCalling && ['planner', 'builder'].includes(context.taskType)) {
      score += 10;
    }

    return score;
  }

  /**
   * Estimate cost for a model given context
   */
  private static estimateCost(model: any, context: RouterContext): number {
    // Rough estimation based on task type
    const tokenEstimates = {
      planner: { input: 2000, output: 1000 },
      builder: { input: 1500, output: 800 },
      qa: { input: 1000, output: 500 },
      explain: { input: 1500, output: 1200 },
      rescope: { input: 1200, output: 600 },
      arbitrate: { input: 3000, output: 800 },
    };

    const estimate = tokenEstimates[context.taskType] || { input: 1000, output: 500 };
    
    return (
      estimate.input * model.costPerInputToken +
      estimate.output * model.costPerOutputToken
    );
  }

  /**
   * Get human-readable reason for model selection
   */
  private static getSelectionReason(model: any, context: RouterContext): string {
    const reasons = [];

    if (model.qualityRating >= 9) {
      reasons.push('highest quality');
    } else if (model.qualityRating >= 8) {
      reasons.push('high quality');
    }

    if (model.speedRating >= 9) {
      reasons.push('fastest response');
    } else if (model.speedRating >= 8) {
      reasons.push('fast response');
    }

    if (model.costPerInputToken < 0.000005) {
      reasons.push('cost-effective');
    }

    if (model.supportsFunctionCalling && ['planner', 'builder'].includes(context.taskType)) {
      reasons.push('function calling support');
    }

    if (context.complexity === 'high' && model.qualityRating >= 8) {
      reasons.push('suitable for complex tasks');
    }

    if (context.priority === 'urgent' && model.speedRating >= 8) {
      reasons.push('optimized for urgent requests');
    }

    return reasons.length > 0 
      ? `Selected for: ${reasons.join(', ')}`
      : 'Best available option for this task type';
  }

  /**
   * Get model profile by name
   */
  private static async getModelProfile(modelName: string) {
    const profiles = await ModelProfilesStorage.getAll();
    return profiles.find(p => p.name === modelName);
  }

  /**
   * Get recommended models for a task type
   */
  static async getRecommendedModels(taskType: TaskType): Promise<{
    primary: string[];
    fallback: string[];
    reasoning: Record<string, string>;
  }> {
    try {
      const availableModels = await ModelProfilesStorage.getByTaskType(taskType);
      
      const scoredModels = availableModels.map(model => ({
        model,
        score: this.scoreModel(model, { taskType }),
      }));

      scoredModels.sort((a, b) => b.score - a.score);

      const primary = scoredModels.slice(0, 2).map(sm => sm.model.name);
      const fallback = scoredModels.slice(2, 4).map(sm => sm.model.name);

      const reasoning: Record<string, string> = {};
      scoredModels.forEach(({ model }) => {
        reasoning[model.name] = this.getSelectionReason(model, { taskType });
      });

      return { primary, fallback, reasoning };
    } catch (error) {
      console.error('Failed to get recommended models:', error);
      
      const defaultModels = this.defaultMappings[taskType] || ['gpt-4'];
      return {
        primary: defaultModels,
        fallback: [],
        reasoning: { [defaultModels[0]]: 'Default recommendation' },
      };
    }
  }

  /**
   * Validate model selection for a task type
   */
  static async validateModelForTask(modelName: string, taskType: TaskType): Promise<{
    isValid: boolean;
    reason: string;
    alternatives?: string[];
  }> {
    try {
      const model = await this.getModelProfile(modelName);
      
      if (!model) {
        return {
          isValid: false,
          reason: 'Model not found',
          alternatives: this.defaultMappings[taskType],
        };
      }

      if (!model.enabled) {
        return {
          isValid: false,
          reason: 'Model is disabled',
          alternatives: this.defaultMappings[taskType],
        };
      }

      if (!model.taskTypes.includes(taskType)) {
        return {
          isValid: false,
          reason: `Model not configured for task type: ${taskType}`,
          alternatives: this.defaultMappings[taskType],
        };
      }

      return {
        isValid: true,
        reason: 'Model is valid for this task type',
      };
    } catch (error) {
      console.error('Model validation failed:', error);
      
      return {
        isValid: false,
        reason: 'Validation error',
        alternatives: this.defaultMappings[taskType],
      };
    }
  }
}
