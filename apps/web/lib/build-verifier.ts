/**
 * Build Verification System
 * Verifies build completeness against PRD requirements
 */

import { EventEmitter } from 'events';
import { ClaudeCLIEngine } from './claude-cli-engine';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface VerificationGap {
  feature: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestedTasks: string[];
}

export interface VerificationResult {
  complete: boolean;
  gaps: VerificationGap[];
  confidence: number;
  analysis: string;
}

export class BuildVerifier extends EventEmitter {
  constructor(
    private claudeEngine: ClaudeCLIEngine,
    private projectPath: string
  ) {
    super();
  }

  async verifyAgainstPRD(prd: any): Promise<VerificationResult> {
    this.emit('verification:started', { featureCount: prd.features?.length || 0 });

    try {
      const buildState = await this.loadBuildState();
      const prompt = this.buildVerificationPrompt(prd, buildState);

      const response = await this.claudeEngine.executeTask({
        id: 'verify-completeness',
        type: 'quality',
        description: 'Verify build against PRD',
        prompt,
        priority: 10,
        dependencies: [],
        estimatedComplexity: 'low',
        status: 'pending'
      });

      const result = this.parseVerificationResponse(response.output);
      this.emit('verification:completed', result);

      return result;
    } catch (error) {
      return {
        complete: false,
        gaps: [],
        confidence: 0,
        analysis: `Verification failed: ${error}`
      };
    }
  }

  private buildVerificationPrompt(prd: any, buildState: any): string {
    return `# Build Completeness Verification

Verify this build against PRD requirements.

## PRD Features
${JSON.stringify(prd.features || [], null, 2)}

## Build State
- Tasks Completed: ${buildState.completedTasks?.length || 0}
- Files Created: ${buildState.filesCreated?.length || 0}

## Instructions
Analyze if all PRD features are implemented. Respond with JSON:

{
  "complete": true/false,
  "confidence": 0-100,
  "gaps": [{
    "feature": "Feature Name",
    "description": "What's missing",
    "severity": "critical|high|medium|low",
    "suggestedTasks": ["Task 1", "Task 2"]
  }],
  "analysis": "Overall assessment"
}`;
  }

  private parseVerificationResponse(output: string): VerificationResult {
    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      // Parsing failed
    }

    return {
      complete: false,
      gaps: [],
      confidence: 0,
      analysis: 'Could not parse verification response'
    };
  }

  private async loadBuildState(): Promise<any> {
    try {
      const statePath = path.join(this.projectPath, 'build-state.json');
      const content = await fs.readFile(statePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return {
        completedTasks: [],
        filesCreated: []
      };
    }
  }
}
