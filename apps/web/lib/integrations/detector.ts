/**
 * Smart Integration Detector
 *
 * Analyzes project requirements and determines which integrations are needed
 */

import type {
  IntegrationType,
  ProjectIntegrationRequirement,
  IntegrationPrompt,
} from './types';
import { AVAILABLE_INTEGRATIONS } from './types';
import type { Feature } from '../orchestration';

export class IntegrationDetector {
  /**
   * Analyze project features and determine required integrations
   */
  detectRequirements(
    features: Feature[],
    projectDescription: string,
    prdSections?: any
  ): ProjectIntegrationRequirement[] {
    const requirements: ProjectIntegrationRequirement[] = [];

    // GitHub is always required for code projects
    requirements.push({
      integration: 'github',
      reason: 'Store and version control your code',
      required: true,
      features: ['All features'],
      alternatives: ['gitlab', 'bitbucket'],
    });

    // Check for database needs
    if (this.needsDatabase(features, projectDescription)) {
      requirements.push({
        integration: 'supabase',
        reason: 'Database, authentication, and storage',
        required: false,
        features: this.getDatabaseFeatures(features),
        alternatives: ['firebase', 'postgres', 'mongodb'],
      });
    }

    // Check for AI/LLM needs
    if (this.needsAI(features, projectDescription)) {
      requirements.push({
        integration: 'openrouter',
        reason: 'AI-powered code generation and assistance',
        required: true,
        features: this.getAIFeatures(features),
      });
    }

    // Check for deployment needs
    if (this.needsDeployment(features, projectDescription)) {
      requirements.push({
        integration: 'vercel',
        reason: 'Automatic deployment and hosting',
        required: false,
        features: ['Deployment', 'Hosting'],
        alternatives: ['netlify', 'aws', 'railway'],
      });
    }

    return requirements;
  }

  /**
   * Generate user-friendly prompts for missing integrations
   */
  generatePrompts(
    requirements: ProjectIntegrationRequirement[],
    connectedIntegrations: IntegrationType[]
  ): IntegrationPrompt[] {
    const prompts: IntegrationPrompt[] = [];

    for (const req of requirements) {
      // Skip if already connected
      if (connectedIntegrations.includes(req.integration)) {
        continue;
      }

      const integration = AVAILABLE_INTEGRATIONS.find(
        (i) => i.type === req.integration
      );

      if (!integration) continue;

      prompts.push({
        integration: req.integration,
        title: `Connect ${integration.name}`,
        message: this.getPromptMessage(req, integration),
        ctaText: integration.usesOAuth ? 'Connect with OAuth' : 'Add API Key',
        skipable: !req.required,
        onConnect: async () => {
          // Will be implemented by the UI
        },
        onSkip: req.required
          ? undefined
          : () => {
              console.log(`Skipped ${integration.name}`);
            },
      });
    }

    return prompts;
  }

  /**
   * Detect when to prompt user during project workflow
   */
  getPromptTiming(integration: IntegrationType): 'immediate' | 'on_demand' | 'before_build' {
    switch (integration) {
      case 'github':
        return 'immediate'; // Prompt right after PRD is created
      case 'openrouter':
        return 'immediate'; // Need for AI features
      case 'supabase':
        return 'on_demand'; // When user tries to create database tables
      case 'vercel':
        return 'before_build'; // When user wants to deploy
      default:
        return 'on_demand';
    }
  }

  // =========================================================================
  // Helper Methods
  // =========================================================================

  private needsDatabase(features: Feature[], description: string): boolean {
    const dbKeywords = [
      'database',
      'db',
      'data storage',
      'persist',
      'sql',
      'authentication',
      'auth',
      'user management',
      'login',
      'signup',
      'crud',
    ];

    // Check description
    const descLower = description.toLowerCase();
    if (dbKeywords.some((kw) => descLower.includes(kw))) {
      return true;
    }

    // Check features
    for (const feature of features) {
      const featureLower = (feature.name + ' ' + feature.description).toLowerCase();
      if (dbKeywords.some((kw) => featureLower.includes(kw))) {
        return true;
      }

      // Check for data-related dependencies
      if (feature.dependencies?.required_packages) {
        const packages = feature.dependencies.required_packages.join(' ').toLowerCase();
        if (packages.includes('database') || packages.includes('sql') || packages.includes('orm')) {
          return true;
        }
      }
    }

    return false;
  }

  private needsAI(features: Feature[], description: string): boolean {
    const aiKeywords = [
      'ai',
      'ml',
      'machine learning',
      'gpt',
      'llm',
      'natural language',
      'chatbot',
      'assistant',
      'recommendation',
      'prediction',
    ];

    const text = (description + ' ' + features.map((f) => f.name + ' ' + f.description).join(' ')).toLowerCase();

    return aiKeywords.some((kw) => text.includes(kw));
  }

  private needsDeployment(features: Feature[], description: string): boolean {
    // Always suggest deployment for production projects
    return features.length > 0;
  }

  private getDatabaseFeatures(features: Feature[]): string[] {
    return features
      .filter((f) => {
        const text = (f.name + ' ' + f.description).toLowerCase();
        return (
          text.includes('database') ||
          text.includes('auth') ||
          text.includes('user') ||
          text.includes('crud') ||
          text.includes('data')
        );
      })
      .map((f) => f.name);
  }

  private getAIFeatures(features: Feature[]): string[] {
    return features
      .filter((f) => {
        const text = (f.name + ' ' + f.description).toLowerCase();
        return text.includes('ai') || text.includes('ml') || text.includes('smart') || text.includes('chat');
      })
      .map((f) => f.name);
  }

  private getPromptMessage(
    req: ProjectIntegrationRequirement,
    integration: any
  ): string {
    if (req.required) {
      return `${integration.name} is required for: ${req.reason}. The following features need this integration: ${req.features.slice(0, 3).join(', ')}${req.features.length > 3 ? '...' : ''}`;
    }

    return `${integration.name} is recommended for: ${req.reason}. This will help with: ${req.features.slice(0, 3).join(', ')}${req.features.length > 3 ? ` and ${req.features.length - 3} more` : ''}`;
  }
}

export const integrationDetector = new IntegrationDetector();
