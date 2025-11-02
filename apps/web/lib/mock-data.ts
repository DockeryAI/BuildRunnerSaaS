import { addDays } from 'date-fns';
import {
  ConsensusResult,
  ModelVote,
} from '@/components/ai-consensus/ConsensusPanel';
import {
  AgentEvent,
  CoordinationProblem,
  AgentType,
  AgentActivity,
} from '@/components/ai-coordination/CoordinationMonitor';
import { Milestone } from '@/components/plan-editor/VisualPlanEditor';
import { ModelUsage } from '@/components/cost/CostOptimizationDashboard';
import { PRDTemplate } from '@/components/templates/PRDTemplateLibrary';

/**
 * Generate mock consensus results for AI voting
 */
export function generateMockConsensusResults(count: number): ConsensusResult[] {
  const results: ConsensusResult[] = [];
  const models = ['claude-sonnet-4.5', 'deepseek-v3', 'gemini-2.5-pro', 'gpt-4-turbo'];
  const votes: Array<'approve' | 'reject' | 'abstain'> = ['approve', 'reject', 'abstain'];
  const consensusTypes: Array<'approve' | 'reject' | 'needs_review'> = ['approve', 'reject', 'needs_review'];

  for (let i = 0; i < count; i++) {
    const modelVotes: ModelVote[] = models.map((modelId) => ({
      modelId,
      vote: votes[Math.floor(Math.random() * votes.length)],
      confidence: Math.floor(Math.random() * 40) + 60,
      reasoning: `Model ${modelId} reasoning for suggestion ${i + 1}`,
      processingTime: Math.floor(Math.random() * 2000) + 500,
      cost: parseFloat((Math.random() * 0.05).toFixed(4)),
    }));

    results.push({
      suggestionId: `suggestion-${i + 1}`,
      suggestionTitle: `Feature Suggestion ${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      modelVotes,
      consensus: consensusTypes[Math.floor(Math.random() * consensusTypes.length)],
      totalCost: parseFloat((modelVotes.reduce((sum, v) => sum + v.cost, 0)).toFixed(4)),
      totalTime: modelVotes.reduce((sum, v) => sum + v.processingTime, 0),
    });
  }

  return results;
}

/**
 * Generate mock agent events for coordination monitoring
 */
export function generateMockAgentEvents(count: number): AgentEvent[] {
  const events: AgentEvent[] = [];
  const agents: AgentType[] = ['StrategyGPT', 'CodeGPT', 'TestGPT', 'ProductGPT', 'MonetizationGPT'];
  const activities: AgentActivity[] = ['analyzing', 'generating', 'reviewing', 'consulting_peer', 'resolving_conflict'];
  const messages = [
    'Analyzing PRD requirements for feasibility',
    'Generating authentication module',
    'Reviewing test coverage',
    'Consulting with peer agents on architecture',
    'Resolving feature priority conflict',
    'Processing user feedback analysis',
    'Optimizing database queries',
    'Reviewing security implementation',
    'Coordinating feature dependencies',
  ];
  const statuses: Array<'in_progress' | 'completed' | 'failed'> = ['in_progress', 'completed', 'failed'];

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 3600000);
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    events.push({
      id: `event-${i + 1}`,
      timestamp,
      agentType: agents[Math.floor(Math.random() * agents.length)],
      activity: activities[Math.floor(Math.random() * activities.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      details: `Additional details for event ${i + 1}`,
      status,
      processingTime: Math.floor(Math.random() * 2000) + 300,
      cost: parseFloat((Math.random() * 0.02).toFixed(4)),
      relatedAgents: Math.random() > 0.7 ? [agents[Math.floor(Math.random() * agents.length)]] : undefined,
    });
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Generate mock coordination problems
 */
export function generateMockCoordinationProblems(): CoordinationProblem[] {
  return [
    {
      id: 'p1',
      title: 'API Rate Limit Approaching',
      description: 'DeepSeek V3 requests approaching rate limit (450/500 per minute)',
      severity: 'medium',
      detectedAt: new Date(Date.now() - 120000),
      status: 'resolving',
      involvedAgents: ['CodeGPT', 'StrategyGPT'],
      resolutionSteps: [
        'Switching to DeepSeek R1 for non-critical tasks',
        'Implementing request queue with exponential backoff',
        'Monitoring rate limit recovery',
      ],
      autoResolved: false,
    },
    {
      id: 'p2',
      title: 'Dependency Conflict Detected',
      description: 'Two features require incompatible versions of React Router',
      severity: 'high',
      detectedAt: new Date(Date.now() - 300000),
      resolvedAt: new Date(Date.now() - 60000),
      status: 'resolved',
      involvedAgents: ['CodeGPT'],
      resolutionSteps: [
        'Analyzed dependency trees',
        'Upgraded React Router to v6.20',
        'Updated all route definitions',
        'Ran integration tests',
      ],
      autoResolved: true,
    },
    {
      id: 'p3',
      title: 'Test Coverage Below Threshold',
      description: 'Unit test coverage dropped below 80% threshold after recent changes',
      severity: 'low',
      detectedAt: new Date(Date.now() - 600000),
      status: 'open',
      involvedAgents: ['TestGPT', 'CodeGPT'],
      resolutionSteps: [
        'Identifying uncovered code paths',
        'Generating additional test cases',
      ],
      autoResolved: false,
    },
  ];
}

/**
 * Generate mock milestones for a project
 */
export function generateMockMilestones(projectId: string): Milestone[] {
  const today = new Date();

  return [
    {
      id: 'm1',
      title: 'Project Setup & Foundation',
      startDate: today,
      endDate: addDays(today, 7),
      status: 'completed',
      progress: 100,
      tasks: [
        { id: 't1', title: 'Initialize repository', completed: true },
        { id: 't2', title: 'Setup development environment', completed: true },
        { id: 't3', title: 'Configure CI/CD pipeline', completed: true },
      ],
    },
    {
      id: 'm2',
      title: 'Authentication & User Management',
      startDate: addDays(today, 7),
      endDate: addDays(today, 21),
      status: 'in_progress',
      progress: 60,
      tasks: [
        { id: 't4', title: 'Implement JWT authentication', completed: true },
        { id: 't5', title: 'Build user registration flow', completed: true },
        { id: 't6', title: 'Add OAuth providers', completed: false },
        { id: 't7', title: 'Create role-based access control', completed: false },
      ],
    },
    {
      id: 'm3',
      title: 'Core Features Development',
      startDate: addDays(today, 21),
      endDate: addDays(today, 49),
      status: 'pending',
      progress: 0,
      tasks: [
        { id: 't8', title: 'Build dashboard UI', completed: false },
        { id: 't9', title: 'Implement data visualization', completed: false },
        { id: 't10', title: 'Add real-time notifications', completed: false },
        { id: 't11', title: 'Create API endpoints', completed: false },
      ],
    },
    {
      id: 'm4',
      title: 'Testing & Deployment',
      startDate: addDays(today, 49),
      endDate: addDays(today, 63),
      status: 'pending',
      progress: 0,
      tasks: [
        { id: 't12', title: 'Write unit tests', completed: false },
        { id: 't13', title: 'Perform integration testing', completed: false },
        { id: 't14', title: 'Security audit', completed: false },
        { id: 't15', title: 'Deploy to production', completed: false },
      ],
    },
  ];
}

/**
 * Generate mock model usage data for cost tracking
 */
export function generateMockModelUsage(): ModelUsage[] {
  return [
    {
      modelId: 'deepseek-v3',
      modelName: 'DeepSeek V3',
      requests: 15420,
      tokens: {
        input: 8234567,
        output: 2345678,
        total: 10580245,
      },
      cost: {
        input: 0.82,
        output: 0.44,
        total: 1.26,
      },
      averageLatency: 487,
      errorRate: 0.3,
      lastUsed: new Date(Date.now() - 120000),
    },
    {
      modelId: 'deepseek-r1',
      modelName: 'DeepSeek R1',
      requests: 8934,
      tokens: {
        input: 4567890,
        output: 1234567,
        total: 5802457,
      },
      cost: {
        input: 0.46,
        output: 0.25,
        total: 0.71,
      },
      averageLatency: 1243,
      errorRate: 0.1,
      lastUsed: new Date(Date.now() - 300000),
    },
    {
      modelId: 'claude-sonnet-4.5',
      modelName: 'Claude Sonnet 4.5',
      requests: 12456,
      tokens: {
        input: 6789012,
        output: 1890123,
        total: 8679135,
      },
      cost: {
        input: 20.37,
        output: 60.48,
        total: 80.85,
      },
      averageLatency: 623,
      errorRate: 0.05,
      lastUsed: new Date(Date.now() - 60000),
    },
    {
      modelId: 'gemini-2.5-pro',
      modelName: 'Gemini 2.5 Pro',
      requests: 5678,
      tokens: {
        input: 2345678,
        output: 789012,
        total: 3134690,
      },
      cost: {
        input: 2.93,
        output: 11.84,
        total: 14.77,
      },
      averageLatency: 845,
      errorRate: 0.2,
      lastUsed: new Date(Date.now() - 180000),
    },
    {
      modelId: 'gpt-4-turbo',
      modelName: 'GPT-4 Turbo',
      requests: 3421,
      tokens: {
        input: 1234567,
        output: 456789,
        total: 1691356,
      },
      cost: {
        input: 12.35,
        output: 45.68,
        total: 58.03,
      },
      averageLatency: 934,
      errorRate: 0.1,
      lastUsed: new Date(Date.now() - 240000),
    },
  ];
}

/**
 * Generate mock PRD templates
 */
export function generateMockTemplates(): PRDTemplate[] {
  return [
    {
      id: 'saas-mvp',
      name: 'SaaS MVP Template',
      category: 'saas',
      description: 'Complete PRD template for building a SaaS MVP with authentication, billing, and core features',
      industry: ['B2B SaaS', 'Enterprise Software'],
      estimatedTime: '8-12 weeks',
      complexity: 'moderate',
      rating: 4.8,
      usageCount: 1247,
      isFavorite: false,
      tags: ['saas', 'mvp', 'authentication', 'billing', 'stripe'],
      techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Auth0'],
      sections: [
        {
          id: '1',
          title: 'Executive Summary',
          content: 'High-level overview of the SaaS product vision and market opportunity',
          order: 1,
        },
        {
          id: '2',
          title: 'User Authentication',
          content: 'Email/password login, OAuth, SSO integration, role-based access control',
          order: 2,
        },
        {
          id: '3',
          title: 'Subscription Management',
          content: 'Tiered pricing, Stripe integration, usage tracking, billing portal',
          order: 3,
        },
      ],
    },
    {
      id: 'mobile-app',
      name: 'Mobile App Template',
      category: 'mobile',
      description: 'Cross-platform mobile app with offline support and push notifications',
      industry: ['Consumer Apps', 'Social Media'],
      estimatedTime: '12-16 weeks',
      complexity: 'advanced',
      rating: 4.6,
      usageCount: 892,
      isFavorite: false,
      tags: ['react-native', 'mobile', 'offline-first', 'push-notifications'],
      techStack: ['React Native', 'Firebase', 'Redux', 'AsyncStorage'],
      sections: [
        {
          id: '1',
          title: 'App Architecture',
          content: 'Cross-platform architecture, offline-first design, state management',
          order: 1,
        },
        {
          id: '2',
          title: 'User Experience',
          content: 'Onboarding flow, navigation structure, accessibility features',
          order: 2,
        },
      ],
    },
    {
      id: 'api-platform',
      name: 'API Platform Template',
      category: 'backend',
      description: 'RESTful API with authentication, rate limiting, and documentation',
      industry: ['Platform', 'Developer Tools'],
      estimatedTime: '6-8 weeks',
      complexity: 'moderate',
      rating: 4.9,
      usageCount: 1534,
      isFavorite: true,
      tags: ['api', 'rest', 'graphql', 'authentication', 'documentation'],
      techStack: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Swagger'],
      sections: [
        {
          id: '1',
          title: 'API Design',
          content: 'RESTful endpoints, versioning strategy, data models',
          order: 1,
        },
        {
          id: '2',
          title: 'Security',
          content: 'API key management, OAuth 2.0, rate limiting, CORS',
          order: 2,
        },
      ],
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Platform',
      category: 'ecommerce',
      description: 'Full-featured e-commerce platform with cart, checkout, and payment processing',
      industry: ['Retail', 'E-commerce'],
      estimatedTime: '16-20 weeks',
      complexity: 'advanced',
      rating: 4.7,
      usageCount: 1089,
      isFavorite: false,
      tags: ['ecommerce', 'stripe', 'inventory', 'shipping', 'analytics'],
      techStack: ['Next.js', 'Shopify API', 'Stripe', 'PostgreSQL', 'Redis'],
      sections: [
        {
          id: '1',
          title: 'Product Catalog',
          content: 'Product management, categories, search, filtering, recommendations',
          order: 1,
        },
        {
          id: '2',
          title: 'Checkout Flow',
          content: 'Shopping cart, payment processing, order management, shipping integration',
          order: 2,
        },
      ],
    },
  ];
}
