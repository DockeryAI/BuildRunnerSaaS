/**
 * PRD Updater - Manages PRD updates from preview feedback
 */

export interface PRDFeature {
  title: string;
  description: string;
  type: 'new_feature' | 'enhancement' | 'bug_fix';
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestedBy: 'user' | 'ai';
  status: 'pending' | 'approved' | 'implemented';
}

export class PRDUpdater {
  /**
   * Generate PRD feature square from feedback
   */
  generateFeatureSquare(feedback: {
    description: string;
    type: string;
    priority: string;
    context?: any;
  }): PRDFeature {
    // Determine if it's a new feature or enhancement
    const featureType = this.classifyFeatureType(feedback.description);

    return {
      title: this.generateFeatureTitle(feedback.description),
      description: this.enhanceDescription(feedback.description, feedback.context),
      type: featureType,
      priority: feedback.priority as any,
      suggestedBy: 'user',
      status: 'pending',
    };
  }

  /**
   * Generate feature from AI suggestion
   */
  generateAISuggestion(suggestion: {
    title: string;
    description: string;
    reasoning: string;
    impact: string;
  }): PRDFeature {
    return {
      title: suggestion.title,
      description: `${suggestion.description}\n\n**AI Reasoning**: ${suggestion.reasoning}\n**Expected Impact**: ${suggestion.impact}`,
      type: 'new_feature',
      priority: 'medium',
      suggestedBy: 'ai',
      status: 'pending',
    };
  }

  /**
   * Format feature as PRD markdown
   */
  formatAsPRDMarkdown(feature: PRDFeature): string {
    const priorityEmoji = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    }[feature.priority];

    const typeLabel = {
      new_feature: '✨ New Feature',
      enhancement: '⚡ Enhancement',
      bug_fix: '🐛 Bug Fix',
    }[feature.type];

    const suggestedLabel = feature.suggestedBy === 'ai'
      ? '🤖 AI Suggested'
      : '👤 User Requested';

    return `
### ${priorityEmoji} ${feature.title}

**Type**: ${typeLabel}
**Source**: ${suggestedLabel}
**Priority**: ${feature.priority.toUpperCase()}
**Status**: ${feature.status}

${feature.description}

---
`;
  }

  /**
   * Add feature to PRD document
   */
  async addFeatureToPRD(
    projectId: string,
    feature: PRDFeature
  ): Promise<{ success: boolean; updatedPRD: string }> {
    try {
      // Read current PRD from database
      const currentPRD = await this.fetchPRD(projectId);

      // Find insertion point
      const insertionPoint = this.findInsertionPoint(currentPRD, feature.type);

      // Format feature
      const featureMarkdown = this.formatAsPRDMarkdown(feature);

      // Insert into PRD
      const updatedPRD = this.insertFeature(currentPRD, featureMarkdown, insertionPoint);

      // Save updated PRD
      await this.savePRD(projectId, updatedPRD);

      return { success: true, updatedPRD };
    } catch (error) {
      console.error('Failed to update PRD:', error);
      return { success: false, updatedPRD: '' };
    }
  }

  /**
   * Generate AI feature suggestions based on current app
   */
  async generateAISuggestions(
    prd: string,
    implementedFeatures: string[],
    userFeedback: any[]
  ): Promise<PRDFeature[]> {
    // Analyze what's missing
    const suggestions: PRDFeature[] = [];

    // Common patterns to suggest
    if (!this.hasFeature(implementedFeatures, 'analytics')) {
      suggestions.push(this.generateAISuggestion({
        title: 'Add Analytics Tracking',
        description: 'Track user interactions and behavior to improve UX',
        reasoning: 'No analytics found in current implementation. This would provide valuable insights.',
        impact: 'Better understanding of user behavior and feature usage',
      }));
    }

    if (!this.hasFeature(implementedFeatures, 'error tracking')) {
      suggestions.push(this.generateAISuggestion({
        title: 'Add Error Tracking',
        description: 'Implement error monitoring with Sentry or similar service',
        reasoning: 'Proactive error detection would improve app stability',
        impact: 'Faster bug detection and resolution',
      }));
    }

    if (!this.hasFeature(implementedFeatures, 'onboarding')) {
      suggestions.push(this.generateAISuggestion({
        title: 'Add User Onboarding Flow',
        description: 'Create guided tour for first-time users',
        reasoning: 'Improve new user experience and reduce learning curve',
        impact: 'Higher user engagement and retention',
      }));
    }

    // Suggestions based on feedback patterns
    const commonIssues = this.analyzeCommonIssues(userFeedback);
    for (const issue of commonIssues) {
      suggestions.push(this.generateAISuggestion({
        title: `Fix: ${issue.title}`,
        description: issue.description,
        reasoning: `${issue.count} similar feedback items reported`,
        impact: 'Addresses common user pain point',
      }));
    }

    return suggestions;
  }

  /**
   * Classify if feedback is new feature or enhancement
   */
  private classifyFeatureType(description: string): PRDFeature['type'] {
    const lower = description.toLowerCase();

    if (lower.includes('bug') || lower.includes('fix') || lower.includes('error')) {
      return 'bug_fix';
    }

    if (lower.includes('add') || lower.includes('create') || lower.includes('new')) {
      return 'new_feature';
    }

    return 'enhancement';
  }

  /**
   * Generate concise feature title from description
   */
  private generateFeatureTitle(description: string): string {
    // Take first sentence or first 50 chars
    const firstSentence = description.split(/[.!?]/)[0];
    const title = firstSentence.length > 50
      ? firstSentence.substring(0, 50) + '...'
      : firstSentence;

    return title.trim();
  }

  /**
   * Enhance description with context
   */
  private enhanceDescription(description: string, context?: any): string {
    let enhanced = description;

    if (context) {
      enhanced += '\n\n**Context:**';
      if (context.route) enhanced += `\n- Page: ${context.route}`;
      if (context.component) enhanced += `\n- Component: ${context.component}`;
      if (context.deviceType) enhanced += `\n- Device: ${context.deviceType}`;
    }

    return enhanced;
  }

  /**
   * Find where to insert feature in PRD
   */
  private findInsertionPoint(prd: string, type: PRDFeature['type']): number {
    // Look for section headers
    const sections = {
      new_feature: /## Features|## Functionality|## Requirements/i,
      enhancement: /## Enhancements|## Improvements/i,
      bug_fix: /## Bug Fixes|## Known Issues/i,
    };

    const sectionMatch = prd.match(sections[type]);
    if (sectionMatch && sectionMatch.index !== undefined) {
      // Insert after section header
      return sectionMatch.index + sectionMatch[0].length;
    }

    // Default: insert before "Technical Requirements" or at end
    const techMatch = prd.match(/## Technical Requirements/i);
    if (techMatch && techMatch.index !== undefined) {
      return techMatch.index;
    }

    return prd.length;
  }

  /**
   * Insert feature at position
   */
  private insertFeature(prd: string, feature: string, position: number): string {
    return prd.slice(0, position) + '\n' + feature + '\n' + prd.slice(position);
  }

  /**
   * Check if feature exists
   */
  private hasFeature(features: string[], keyword: string): boolean {
    return features.some(f => f.toLowerCase().includes(keyword));
  }

  /**
   * Analyze common issues from feedback
   */
  private analyzeCommonIssues(feedback: any[]): Array<{title: string; description: string; count: number}> {
    const issueMap = new Map<string, {description: string; count: number}>();

    for (const item of feedback) {
      const key = item.description.toLowerCase().substring(0, 50);
      const existing = issueMap.get(key);

      if (existing) {
        existing.count++;
      } else {
        issueMap.set(key, {
          description: item.description,
          count: 1,
        });
      }
    }

    // Return issues with count > 1
    const commonIssues = Array.from(issueMap.entries())
      .filter(([_, data]) => data.count > 1)
      .map(([key, data]) => ({
        title: this.generateFeatureTitle(data.description),
        description: data.description,
        count: data.count,
      }));

    return commonIssues;
  }

  /**
   * Fetch PRD from database (placeholder)
   */
  private async fetchPRD(projectId: string): Promise<string> {
    // TODO: Implement actual database fetch
    // For now, return empty PRD template
    return `# Project Requirements Document

## Overview
[Project description]

## Features

## Technical Requirements

## Timeline
`;
  }

  /**
   * Save PRD to database (placeholder)
   */
  private async savePRD(projectId: string, prd: string): Promise<void> {
    // TODO: Implement actual database save
    console.log(`Saving PRD for project ${projectId}`);
  }
}
