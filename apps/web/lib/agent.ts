/**
 * Build Agent
 * Individual agent that builds components in parallel with pattern library awareness
 *
 * Each agent:
 * - Has unique ID for lock management
 * - Checks pattern library first (instant generation)
 * - Generates with appropriate model
 * - Validates design tokens
 * - Reports errors with full context
 */

import type { LockManager } from './lock-manager';
import type { BuildContext } from './context-builder';
import type { AIComponentGenerator } from './ai-component-generator';
import type { DesignPolisher } from './design-polisher';
import { DesignTokenValidator } from './design-token-validator';

export type AgentStatus = 'idle' | 'checking_patterns' | 'generating' | 'polishing' | 'validating' | 'writing' | 'complete' | 'error';

export interface AgentConfig {
  id: string;
  lockManager: LockManager;
  aiGenerator: AIComponentGenerator;
  designPolisher: DesignPolisher;
  fileWriter?: any;
}

export interface ComponentTask {
  component: any; // Component from build plan
  buildContext: BuildContext;
  filePath: string;
  priority: number; // Higher = more important
}

export interface AgentResult {
  agentId: string;
  componentName: string;
  success: boolean;
  code?: string;
  filePath?: string;
  duration: number;
  fromPattern: boolean; // Was it from pattern library?
  quality?: any;
  error?: Error;
  status: AgentStatus;
}

export interface AgentProgress {
  agentId: string;
  componentName: string;
  status: AgentStatus;
  progress: number; // 0-100
  startTime: number;
  currentStep: string;
}

export class BuildAgent {
  private config: AgentConfig;
  private currentTask: ComponentTask | null = null;
  private status: AgentStatus = 'idle';
  private progress: number = 0;
  private startTime: number = 0;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Get agent ID
   */
  getId(): string {
    return this.config.id;
  }

  /**
   * Get current agent status
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Get current progress
   */
  getProgress(): AgentProgress | null {
    if (!this.currentTask) {
      return null;
    }

    return {
      agentId: this.config.id,
      componentName: this.currentTask.component.name,
      status: this.status,
      progress: this.progress,
      startTime: this.startTime,
      currentStep: this.getStepDescription(),
    };
  }

  /**
   * Check if agent is available
   */
  isAvailable(): boolean {
    return this.status === 'idle' || this.status === 'complete' || this.status === 'error';
  }

  /**
   * Build a component
   */
  async buildComponent(task: ComponentTask): Promise<AgentResult> {
    this.currentTask = task;
    this.status = 'checking_patterns';
    this.progress = 0;
    this.startTime = Date.now();

    const { component, buildContext, filePath } = task;

    try {
      // Step 1: Acquire lock on file path
      const lockAcquired = await this.config.lockManager.acquireLock({
        resourceId: filePath,
        resourceType: 'file',
        agentId: this.config.id,
        timeout: 5000, // 5 second timeout
      });

      if (!lockAcquired) {
        throw new Error(`Could not acquire lock on ${filePath} - another agent is working on it`);
      }

      this.progress = 10;

      // Step 2: Check pattern library (TODO: integrate with existing pattern library)
      this.status = 'checking_patterns';
      const patternMatch = await this.checkPatternLibrary(component);
      this.progress = 20;

      let code: string;
      let fromPattern = false;

      if (patternMatch && patternMatch.confidence > 0.7) {
        // Use pattern library (instant generation)
        code = patternMatch.code;
        fromPattern = true;
        this.progress = 70; // Skip generation step
        console.log(`✅ Agent ${this.config.id}: Using pattern library for ${component.name}`);
      } else {
        // Generate with AI
        this.status = 'generating';
        this.progress = 30;

        const generationResult = await this.config.aiGenerator.generateComponent(buildContext);
        code = generationResult.code;
        this.progress = 50;

        // Step 3: Polish the component
        this.status = 'polishing';
        const polishResult = await this.config.designPolisher.polishComponent(
          { code, name: component.name, type: component.type },
          buildContext.design
        );
        code = polishResult.polishedCode;
        this.progress = 70;
      }

      // Step 4: Validate design tokens
      this.status = 'validating';
      const validationResult = DesignTokenValidator.validateComponent(
        code,
        buildContext.profile
      );

      if (!validationResult.isValid && validationResult.fixedCode) {
        code = validationResult.fixedCode;
        console.log(`🔧 Agent ${this.config.id}: Auto-fixed ${validationResult.violations.length} design token violations`);
      }

      this.progress = 80;

      // Step 5: Write file
      if (this.config.fileWriter) {
        this.status = 'writing';
        await this.config.fileWriter.writeFile(filePath, code);
        this.progress = 90;
      }

      // Step 6: Release lock
      this.config.lockManager.releaseLock('file', filePath, this.config.id);

      // Complete
      this.status = 'complete';
      this.progress = 100;

      const duration = Date.now() - this.startTime;

      return {
        agentId: this.config.id,
        componentName: component.name,
        success: true,
        code,
        filePath,
        duration,
        fromPattern,
        status: this.status,
      };

    } catch (error) {
      // Release lock on error
      this.config.lockManager.releaseLock('file', filePath, this.config.id);

      this.status = 'error';
      this.progress = 0;

      const duration = Date.now() - this.startTime;

      return {
        agentId: this.config.id,
        componentName: component.name,
        success: false,
        duration,
        fromPattern: false,
        error: error instanceof Error ? error : new Error(String(error)),
        status: this.status,
      };
    } finally {
      this.currentTask = null;
    }
  }

  /**
   * Check pattern library for matching component
   */
  private async checkPatternLibrary(component: any): Promise<{ code: string; confidence: number } | null> {
    // TODO: Integrate with actual pattern library
    // For now, return null (no pattern match)
    // In the future, this will check the 10MB patterns-library.json

    // Placeholder for pattern library integration
    // const patterns = await PatternLibrary.find({
    //   componentType: component.type,
    //   features: component.relatedFeatures,
    // });
    //
    // if (patterns.length > 0) {
    //   const bestMatch = patterns[0];
    //   if (bestMatch.confidence > 0.7) {
    //     return {
    //       code: bestMatch.code,
    //       confidence: bestMatch.confidence,
    //     };
    //   }
    // }

    return null;
  }

  /**
   * Get human-readable step description
   */
  private getStepDescription(): string {
    switch (this.status) {
      case 'idle':
        return 'Waiting for task';
      case 'checking_patterns':
        return 'Checking pattern library';
      case 'generating':
        return 'Generating with AI';
      case 'polishing':
        return 'Polishing component';
      case 'validating':
        return 'Validating design tokens';
      case 'writing':
        return 'Writing file';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error occurred';
      default:
        return 'Unknown';
    }
  }

  /**
   * Reset agent to idle state
   */
  reset(): void {
    // Release all locks held by this agent
    this.config.lockManager.releaseAllLocks(this.config.id);

    this.currentTask = null;
    this.status = 'idle';
    this.progress = 0;
    this.startTime = 0;
  }

  /**
   * Get agent statistics
   */
  getStats(): {
    id: string;
    status: AgentStatus;
    currentTask: string | null;
    locksHeld: number;
  } {
    return {
      id: this.config.id,
      status: this.status,
      currentTask: this.currentTask?.component.name || null,
      locksHeld: this.config.lockManager.getAgentLocks(this.config.id).length,
    };
  }
}
