/**
 * AI Suggestions Generator
 * Analyzes feedback patterns and generates PRD improvement suggestions
 */

import type { FeedbackItem } from '@/app/api/build/feedback/route';
import type { PRDFeature } from './prd-updater';
import { PRDUpdater } from './prd-updater';

interface AnalysisContext {
  projectId: string;
  buildId: string;
  prd?: string;
  implementedFeatures: string[];
  feedback: FeedbackItem[];
}

interface SuggestionRule {
  name: string;
  condition: (context: AnalysisContext) => boolean;
  generate: (context: AnalysisContext) => PRDFeature[];
}

export class AISuggestionsGenerator {
  private prdUpdater: PRDUpdater;
  private rules: SuggestionRule[];

  constructor() {
    this.prdUpdater = new PRDUpdater();
    this.rules = this.initializeRules();
  }

  /**
   * Generate AI suggestions based on context
   */
  async generateSuggestions(context: AnalysisContext): Promise<PRDFeature[]> {
    const suggestions: PRDFeature[] = [];

    // Run all rules that match
    for (const rule of this.rules) {
      if (rule.condition(context)) {
        const ruleSuggestions = rule.generate(context);
        suggestions.push(...ruleSuggestions);
      }
    }

    // Analyze feedback patterns
    const feedbackSuggestions = this.analyzeFeedbackPatterns(context);
    suggestions.push(...feedbackSuggestions);

    // Generate feature gap suggestions
    const gapSuggestions = await this.analyzeFeatureGaps(context);
    suggestions.push(...gapSuggestions);

    // Deduplicate and prioritize
    return this.deduplicate(suggestions);
  }

  /**
   * Initialize suggestion rules
   */
  private initializeRules(): SuggestionRule[] {
    return [
      // Analytics rule
      {
        name: 'analytics',
        condition: (ctx) =>
          !this.hasFeatureKeyword(ctx.implementedFeatures, 'analytics') &&
          !this.hasFeatureKeyword(ctx.implementedFeatures, 'tracking'),
        generate: () => [
          {
            title: 'Add Analytics Tracking',
            description: `Implement comprehensive analytics to track user behavior and feature usage.

**Why this matters:**
- Understand how users interact with your app
- Make data-driven product decisions
- Track feature adoption and usage patterns

**Suggested Implementation:**
- Event tracking for key user actions
- Page view analytics
- User journey tracking
- Performance metrics

**Tools to consider:**
- Google Analytics 4
- Mixpanel
- PostHog (open source)
- Amplitude`,
            type: 'new_feature',
            priority: 'medium',
            suggestedBy: 'ai',
            status: 'pending',
          },
        ],
      },

      // Error tracking rule
      {
        name: 'error-tracking',
        condition: (ctx) =>
          !this.hasFeatureKeyword(ctx.implementedFeatures, 'error') &&
          !this.hasFeatureKeyword(ctx.implementedFeatures, 'sentry') &&
          ctx.feedback.filter((f) => f.type === 'bug').length > 2,
        generate: (ctx) => [
          {
            title: 'Implement Error Tracking',
            description: `Add comprehensive error monitoring and tracking to catch issues before users report them.

**Why this matters:**
- ${ctx.feedback.filter((f) => f.type === 'bug').length} bugs have been reported
- Proactive error detection reduces user frustration
- Faster debugging with stack traces and context

**Suggested Implementation:**
- Error boundary components
- Automatic error reporting
- Source map support for debugging
- User context and breadcrumbs

**Tools to consider:**
- Sentry
- Rollbar
- Bugsnag
- LogRocket`,
            type: 'new_feature',
            priority: 'high',
            suggestedBy: 'ai',
            status: 'pending',
          },
        ],
      },

      // Onboarding rule
      {
        name: 'onboarding',
        condition: (ctx) =>
          !this.hasFeatureKeyword(ctx.implementedFeatures, 'onboarding') &&
          !this.hasFeatureKeyword(ctx.implementedFeatures, 'tutorial'),
        generate: () => [
          {
            title: 'Add User Onboarding Flow',
            description: `Create a guided onboarding experience for new users.

**Why this matters:**
- Reduce learning curve for first-time users
- Increase feature discovery
- Improve user retention and activation

**Suggested Implementation:**
- Welcome tour for first-time users
- Interactive tooltips for key features
- Progress tracking
- Skip option for experienced users

**Best practices:**
- Keep it short (3-5 steps max)
- Focus on core value proposition
- Allow users to skip
- Make it contextual`,
            type: 'new_feature',
            priority: 'medium',
            suggestedBy: 'ai',
            status: 'pending',
          },
        ],
      },

      // Multiple design issues rule
      {
        name: 'design-system',
        condition: (ctx) => ctx.feedback.filter((f) => f.type === 'design').length > 2,
        generate: (ctx) => [
          {
            title: 'Establish Design System',
            description: `Implement a unified design system to ensure consistency across the app.

**Why this matters:**
- ${ctx.feedback.filter((f) => f.type === 'design').length} design inconsistencies reported
- Faster development with reusable components
- Better user experience through consistency
- Easier maintenance and updates

**Suggested Implementation:**
- Component library (e.g., Radix UI, shadcn/ui)
- Design tokens (colors, spacing, typography)
- Documentation site
- Storybook for component development

**Benefits:**
- Consistent look and feel
- Faster feature development
- Easier to maintain
- Better accessibility`,
            type: 'enhancement',
            priority: 'medium',
            suggestedBy: 'ai',
            status: 'pending',
          },
        ],
      },

      // Performance rule
      {
        name: 'performance',
        condition: (ctx) =>
          ctx.feedback.filter((f) => f.type === 'performance').length > 1 &&
          !this.hasFeatureKeyword(ctx.implementedFeatures, 'performance'),
        generate: (ctx) => [
          {
            title: 'Performance Optimization',
            description: `Address performance issues reported by users.

**Why this matters:**
- ${ctx.feedback.filter((f) => f.type === 'performance').length} performance issues reported
- Slow apps lead to user frustration and abandonment
- Performance directly impacts conversion rates

**Suggested Areas:**
- Code splitting and lazy loading
- Image optimization
- Bundle size reduction
- Caching strategy
- Database query optimization
- API response time improvements

**Tools to measure:**
- Lighthouse
- Web Vitals
- Chrome DevTools
- Bundle analyzer`,
            type: 'enhancement',
            priority: 'high',
            suggestedBy: 'ai',
            status: 'pending',
          },
        ],
      },

      // Testing rule
      {
        name: 'testing',
        condition: (ctx) =>
          !this.hasFeatureKeyword(ctx.implementedFeatures, 'test') &&
          ctx.feedback.filter((f) => f.type === 'bug').length > 3,
        generate: (ctx) => [
          {
            title: 'Implement Automated Testing',
            description: `Add comprehensive test coverage to catch bugs before deployment.

**Why this matters:**
- ${ctx.feedback.filter((f) => f.type === 'bug').length} bugs reported by users
- Automated tests catch issues early
- Faster development with confidence
- Easier refactoring

**Suggested Testing Strategy:**
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Visual regression testing

**Tools to consider:**
- Jest for unit tests
- Playwright or Cypress for E2E
- Testing Library for React
- Vitest for modern projects`,
            type: 'enhancement',
            priority: 'high',
            suggestedBy: 'ai',
            status: 'pending',
          },
        ],
      },
    ];
  }

  /**
   * Analyze feedback patterns for common issues
   */
  private analyzeFeedbackPatterns(context: AnalysisContext): PRDFeature[] {
    const suggestions: PRDFeature[] = [];
    const { feedback } = context;

    // Group similar feedback
    const grouped = this.groupSimilarFeedback(feedback);

    // Suggest features for common patterns (3+ similar items)
    for (const [pattern, items] of Object.entries(grouped)) {
      if (items.length >= 3) {
        suggestions.push({
          title: `Address: ${this.extractPatternTitle(items)}`,
          description: `Multiple users have reported similar feedback (${items.length} reports).

**User Feedback:**
${items.slice(0, 3).map((item) => `- ${item.description}`).join('\n')}

**Suggested Action:**
Investigate this pattern and consider implementing a solution or enhancement.`,
          type: 'enhancement',
          priority: items.length >= 5 ? 'high' : 'medium',
          suggestedBy: 'ai',
          status: 'pending',
        });
      }
    }

    return suggestions;
  }

  /**
   * Analyze feature gaps based on PRD
   */
  private async analyzeFeatureGaps(
    context: AnalysisContext
  ): Promise<PRDFeature[]> {
    const suggestions: PRDFeature[] = [];

    // Common missing features to check for
    const commonFeatures = [
      {
        keyword: 'auth',
        title: 'User Authentication',
        description: 'Implement user authentication and authorization',
      },
      {
        keyword: 'search',
        title: 'Search Functionality',
        description: 'Add search capability to help users find content',
      },
      {
        keyword: 'export',
        title: 'Data Export',
        description: 'Allow users to export their data',
      },
      {
        keyword: 'notification',
        title: 'Notifications System',
        description: 'Implement user notifications for important events',
      },
      {
        keyword: 'mobile',
        title: 'Mobile Responsiveness',
        description: 'Ensure app works well on mobile devices',
      },
    ];

    for (const feature of commonFeatures) {
      if (!this.hasFeatureKeyword(context.implementedFeatures, feature.keyword)) {
        // Check if users are asking for it
        const relatedFeedback = context.feedback.filter((f) =>
          f.description.toLowerCase().includes(feature.keyword)
        );

        if (relatedFeedback.length > 0) {
          suggestions.push({
            title: feature.title,
            description: `${feature.description}

**User demand:** ${relatedFeedback.length} related feedback items`,
            type: 'new_feature',
            priority: relatedFeedback.length >= 2 ? 'high' : 'medium',
            suggestedBy: 'ai',
            status: 'pending',
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Check if implemented features include keyword
   */
  private hasFeatureKeyword(features: string[], keyword: string): boolean {
    return features.some((f) => f.toLowerCase().includes(keyword.toLowerCase()));
  }

  /**
   * Group similar feedback items
   */
  private groupSimilarFeedback(
    feedback: FeedbackItem[]
  ): Record<string, FeedbackItem[]> {
    const grouped: Record<string, FeedbackItem[]> = {};

    for (const item of feedback) {
      // Simple grouping by first 50 characters (in production, use ML/NLP)
      const key = item.description.toLowerCase().substring(0, 50);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    }

    return grouped;
  }

  /**
   * Extract title from pattern
   */
  private extractPatternTitle(items: FeedbackItem[]): string {
    // Get most common words from descriptions
    const firstItem = items[0];
    const words = firstItem.description.split(' ').slice(0, 5);
    return words.join(' ') + '...';
  }

  /**
   * Deduplicate suggestions
   */
  private deduplicate(suggestions: PRDFeature[]): PRDFeature[] {
    const seen = new Set<string>();
    const unique: PRDFeature[] = [];

    for (const suggestion of suggestions) {
      const key = suggestion.title.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(suggestion);
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return unique.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }

  /**
   * Trigger generation via API
   */
  async triggerGeneration(
    projectId: string,
    buildId: string,
    feedback: FeedbackItem[]
  ): Promise<PRDFeature[]> {
    try {
      const response = await fetch('/api/prd/update-from-preview/generate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          buildId,
          feedback,
        }),
      });

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Error triggering AI suggestions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const aiSuggestionsGenerator = new AISuggestionsGenerator();
