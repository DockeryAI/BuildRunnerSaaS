/**
 * Task List Generator V2
 * Generates optimized task lists from PRD for Claude builds
 */

export interface PRDData {
  productName: string;
  productIdea: string;
  features?: Array<{ name: string; description: string; priority?: string }>;
  technicalRequirements?: string[];
  userFlows?: Array<{ name: string; steps: string[] }>;
}

export interface BuildTask {
  id: string;
  description: string;
  type: 'setup' | 'component' | 'page' | 'api' | 'integration' | 'test' | 'quality';
  dependencies: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';
  prompt?: string;
}

export class TaskListGeneratorV2 {

  /**
   * Generate task list from PRD
   */
  generate(prd: PRDData): BuildTask[] {
    const tasks: BuildTask[] = [];

    // Phase 1: Project Setup
    tasks.push({
      id: 'setup-001',
      description: 'Initialize project structure and dependencies',
      type: 'setup',
      dependencies: [],
      estimatedComplexity: 'low',
      priority: 1,
      status: 'pending',
      prompt: `Initialize the Next.js project structure with all required dependencies. Ensure package.json includes:
- React 18
- Next.js 14 (App Router)
- Tailwind CSS 4
- TypeScript
- shadcn/ui components
- Framer Motion

Create the basic directory structure (app/, components/, lib/).`
    });

    // Phase 2: Design System Setup
    tasks.push({
      id: 'setup-002',
      description: 'Configure design system and Tailwind',
      type: 'setup',
      dependencies: ['setup-001'],
      estimatedComplexity: 'medium',
      priority: 2,
      status: 'pending',
      prompt: `Set up the design system from DESIGN_SYSTEM.md:
1. Configure Tailwind with design tokens
2. Create global styles
3. Set up color palette as Tailwind theme
4. Configure typography scale
5. Add CSS variables for consistent theming

Reference DESIGN_SYSTEM.md for all color codes, spacing, and typography.`
    });

    // Phase 3: Core Layout
    tasks.push({
      id: 'layout-001',
      description: 'Create root layout with navigation',
      type: 'component',
      dependencies: ['setup-002'],
      estimatedComplexity: 'medium',
      priority: 3,
      status: 'pending',
      prompt: `Create the root layout (app/layout.tsx) with:
1. Navigation header with logo and menu
2. Footer
3. Proper HTML structure
4. Font loading
5. Metadata configuration

Follow design system for styling. Use shadcn/ui components where applicable.`
    });

    // Phase 4: Features from PRD
    if (prd.features && prd.features.length > 0) {
      prd.features.forEach((feature, index) => {
        const featureId = `feature-${String(index + 1).padStart(3, '0')}`;

        // Component task
        tasks.push({
          id: `${featureId}-component`,
          description: `Build ${feature.name} component`,
          type: 'component',
          dependencies: ['layout-001'],
          estimatedComplexity: this.estimateComplexity(feature.description),
          priority: feature.priority === 'high' ? 4 : feature.priority === 'low' ? 6 : 5,
          status: 'pending',
          prompt: `Build the ${feature.name} component:

**Description:** ${feature.description}

**Requirements:**
1. Use shadcn/ui components from COMPONENT_CATALOG.md
2. Follow DESIGN_SYSTEM.md for all styling
3. Make it responsive (mobile-first)
4. Add proper TypeScript types
5. Include loading and error states
6. Add smooth animations with Framer Motion

**Quality Standard:** Linear/Stripe level polish - clean, modern, professional.`
        });

        // API task (if needed)
        if (this.needsAPI(feature.description)) {
          tasks.push({
            id: `${featureId}-api`,
            description: `Create API endpoint for ${feature.name}`,
            type: 'api',
            dependencies: [`${featureId}-component`],
            estimatedComplexity: 'medium',
            priority: 5,
            status: 'pending',
            prompt: `Create API route for ${feature.name}:

**Feature:** ${feature.description}

**Requirements:**
1. Create Next.js API route in app/api/
2. Add proper error handling
3. TypeScript types for request/response
4. Input validation
5. Return consistent JSON structure

Follow Next.js 14 App Router patterns.`
          });
        }

        // Integration task
        tasks.push({
          id: `${featureId}-integration`,
          description: `Integrate ${feature.name} into main flow`,
          type: 'integration',
          dependencies: [
            `${featureId}-component`,
            ...(this.needsAPI(feature.description) ? [`${featureId}-api`] : [])
          ],
          estimatedComplexity: 'low',
          priority: 6,
          status: 'pending',
          prompt: `Integrate ${feature.name} into the application:
1. Add navigation/routing if needed
2. Connect API endpoints to components
3. Test user flow end-to-end
4. Verify responsive behavior
5. Check accessibility`
        });
      });
    }

    // Phase 5: Pages from user flows
    if (prd.userFlows && prd.userFlows.length > 0) {
      prd.userFlows.forEach((flow, index) => {
        const flowId = `page-${String(index + 1).padStart(3, '0')}`;

        tasks.push({
          id: flowId,
          description: `Create ${flow.name} page`,
          type: 'page',
          dependencies: ['layout-001'],
          estimatedComplexity: 'medium',
          priority: 4,
          status: 'pending',
          prompt: `Create the ${flow.name} page:

**User Flow Steps:**
${flow.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Requirements:**
1. Create page component in app/
2. Implement all user flow steps
3. Use existing components where possible
4. Follow design system consistently
5. Add proper metadata and SEO
6. Make fully responsive

Reference COMPONENT_CATALOG.md for available components.`
        });
      });
    }

    // Phase 6: Quality & Polish
    const allFeatureTasks = tasks.filter(t => t.type === 'feature' || t.type === 'integration');
    const allFeatureIds = allFeatureTasks.map(t => t.id);

    tasks.push({
      id: 'quality-001',
      description: 'TypeScript and ESLint verification',
      type: 'quality',
      dependencies: allFeatureIds.length > 0 ? allFeatureIds : ['layout-001'],
      estimatedComplexity: 'low',
      priority: 7,
      status: 'pending',
      prompt: `Run quality checks:
1. Fix all TypeScript errors
2. Fix all ESLint warnings
3. Ensure strict mode compliance
4. Check for any console.log statements
5. Verify all imports are used`
    });

    tasks.push({
      id: 'quality-002',
      description: 'Responsive design verification',
      type: 'quality',
      dependencies: ['quality-001'],
      estimatedComplexity: 'medium',
      priority: 8,
      status: 'pending',
      prompt: `Verify responsive design:
1. Test on mobile (375px)
2. Test on tablet (768px)
3. Test on desktop (1440px)
4. Fix any layout issues
5. Ensure touch targets are 44x44px minimum
6. Verify text is readable at all sizes`
    });

    tasks.push({
      id: 'quality-003',
      description: 'Accessibility audit',
      type: 'quality',
      dependencies: ['quality-002'],
      estimatedComplexity: 'medium',
      priority: 9,
      status: 'pending',
      prompt: `Accessibility audit:
1. Add ARIA labels where needed
2. Verify keyboard navigation
3. Check color contrast (WCAG AA)
4. Add focus indicators
5. Test with screen reader
6. Semantic HTML validation`
    });

    tasks.push({
      id: 'test-001',
      description: 'End-to-end testing',
      type: 'test',
      dependencies: ['quality-003'],
      estimatedComplexity: 'medium',
      priority: 10,
      status: 'pending',
      prompt: `End-to-end testing:
1. Test all user flows
2. Test all API endpoints
3. Test error states
4. Test loading states
5. Test form validation
6. Document any issues found`
    });

    return tasks;
  }

  /**
   * Estimate task complexity from description
   */
  private estimateComplexity(description: string): 'low' | 'medium' | 'high' {
    const complexityKeywords = {
      high: ['authentication', 'payment', 'real-time', 'database', 'complex', 'integration'],
      medium: ['form', 'validation', 'api', 'state', 'navigation'],
      low: ['display', 'static', 'simple', 'basic']
    };

    const lowerDesc = description.toLowerCase();

    if (complexityKeywords.high.some(kw => lowerDesc.includes(kw))) {
      return 'high';
    }
    if (complexityKeywords.medium.some(kw => lowerDesc.includes(kw))) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Determine if feature needs API endpoint
   */
  private needsAPI(description: string): boolean {
    const apiKeywords = ['save', 'submit', 'create', 'update', 'delete', 'fetch', 'load', 'api', 'backend', 'database', 'store'];
    const lowerDesc = description.toLowerCase();
    return apiKeywords.some(kw => lowerDesc.includes(kw));
  }

  /**
   * Generate TASKS.md file content
   */
  generateTasksMarkdown(tasks: BuildTask[]): string {
    const byType = {
      setup: tasks.filter(t => t.type === 'setup'),
      component: tasks.filter(t => t.type === 'component'),
      page: tasks.filter(t => t.type === 'page'),
      api: tasks.filter(t => t.type === 'api'),
      integration: tasks.filter(t => t.type === 'integration'),
      quality: tasks.filter(t => t.type === 'quality'),
      test: tasks.filter(t => t.type === 'test')
    };

    let markdown = `# Build Tasks

**Total Tasks:** ${tasks.length}
**Completed:** ${tasks.filter(t => t.status === 'completed').length}
**In Progress:** ${tasks.filter(t => t.status === 'in_progress').length}
**Pending:** ${tasks.filter(t => t.status === 'pending').length}

---

`;

    const sections = [
      { key: 'setup', title: 'Setup & Configuration' },
      { key: 'component', title: 'Components' },
      { key: 'page', title: 'Pages' },
      { key: 'api', title: 'API Endpoints' },
      { key: 'integration', title: 'Integrations' },
      { key: 'quality', title: 'Quality Assurance' },
      { key: 'test', title: 'Testing' }
    ];

    sections.forEach(section => {
      const sectionTasks = byType[section.key as keyof typeof byType];
      if (sectionTasks.length === 0) return;

      markdown += `## ${section.title}\n\n`;

      sectionTasks.forEach(task => {
        const statusIcon = task.status === 'completed' ? '✅' :
                          task.status === 'in_progress' ? '🔄' :
                          task.status === 'failed' ? '❌' :
                          task.status === 'blocked' ? '🚫' : '⏳';

        markdown += `### ${statusIcon} ${task.description}\n\n`;
        markdown += `- **ID:** ${task.id}\n`;
        markdown += `- **Status:** ${task.status}\n`;
        markdown += `- **Complexity:** ${task.estimatedComplexity}\n`;
        markdown += `- **Dependencies:** ${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}\n\n`;
      });
    });

    markdown += `---\n\n*Last updated: ${new Date().toLocaleString()}*\n`;

    return markdown;
  }
}

export const taskListGeneratorV2 = new TaskListGeneratorV2();
