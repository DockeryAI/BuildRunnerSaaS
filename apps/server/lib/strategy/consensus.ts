import { SuggestionCardData } from '@/components/brainstorm/Card';

export interface StrategyConsensus {
  vision: {
    statement: string;
    target_users: string[];
    value_proposition: string;
    market_opportunity: string;
  };
  product: {
    core_features: string[];
    differentiators: string[];
    technical_approach: string;
    user_experience: string;
  };
  monetization: {
    pricing_model: string;
    revenue_streams: string[];
    pricing_tiers: Array<{
      name: string;
      price: string;
      features: string[];
    }>;
    target_metrics: {
      arr_target: string;
      customer_acquisition_cost: string;
      lifetime_value: string;
    };
  };
  go_to_market: {
    target_segments: string[];
    marketing_channels: string[];
    sales_strategy: string;
    launch_timeline: string;
    success_metrics: string[];
  };
  competitive_positioning: {
    direct_competitors: string[];
    indirect_competitors: string[];
    competitive_advantages: string[];
    market_gaps: string[];
    differentiation_strategy: string;
  };
  roadmap: {
    phases: Array<{
      name: string;
      duration: string;
      objectives: string[];
      key_features: string[];
      success_criteria: string[];
    }>;
    dependencies: string[];
    risk_mitigation: string[];
  };
  success_metrics: {
    business_metrics: string[];
    product_metrics: string[];
    user_metrics: string[];
    financial_metrics: string[];
  };
  next_steps: {
    immediate_actions: string[];
    week_1_goals: string[];
    month_1_goals: string[];
    quarter_1_goals: string[];
  };
}

export interface CompetitorData {
  name: string;
  category: 'direct' | 'indirect' | 'adjacent';
  features: string[];
  pricing: string;
  target_market: string;
  strengths: string[];
  weaknesses: string[];
  market_share: string;
  funding: string;
  differentiation_opportunities: string[];
}

export interface RoadmapPhase {
  id: string;
  name: string;
  duration_weeks: number;
  start_date?: Date;
  end_date?: Date;
  objectives: string[];
  key_features: string[];
  dependencies: string[];
  success_criteria: string[];
  effort_estimate: 'low' | 'medium' | 'high';
  business_value: number; // 1-10
  technical_complexity: number; // 1-10
  risk_level: number; // 1-10
}

/**
 * Generate strategy consensus from accepted brainstorm suggestions
 */
export async function generateStrategyConsensus(
  acceptedSuggestions: SuggestionCardData[],
  competitorData: CompetitorData[] = [],
  roadmapPhases: RoadmapPhase[] = []
): Promise<StrategyConsensus> {
  
  // Group suggestions by category
  const suggestionsByCategory = acceptedSuggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = [];
    }
    acc[suggestion.category].push(suggestion);
    return acc;
  }, {} as Record<string, SuggestionCardData[]>);

  // Extract vision elements
  const visionSuggestions = suggestionsByCategory.strategy || [];
  const vision = {
    statement: extractVisionStatement(visionSuggestions),
    target_users: extractTargetUsers(visionSuggestions),
    value_proposition: extractValueProposition(visionSuggestions),
    market_opportunity: extractMarketOpportunity(visionSuggestions),
  };

  // Extract product elements
  const productSuggestions = suggestionsByCategory.product || [];
  const product = {
    core_features: extractCoreFeatures(productSuggestions),
    differentiators: extractDifferentiators(productSuggestions),
    technical_approach: extractTechnicalApproach(productSuggestions),
    user_experience: extractUserExperience(productSuggestions),
  };

  // Extract monetization elements
  const monetizationSuggestions = suggestionsByCategory.monetization || [];
  const monetization = {
    pricing_model: extractPricingModel(monetizationSuggestions),
    revenue_streams: extractRevenueStreams(monetizationSuggestions),
    pricing_tiers: extractPricingTiers(monetizationSuggestions),
    target_metrics: extractTargetMetrics(monetizationSuggestions),
  };

  // Extract go-to-market elements
  const gtmSuggestions = suggestionsByCategory.gtm || [];
  const go_to_market = {
    target_segments: extractTargetSegments(gtmSuggestions),
    marketing_channels: extractMarketingChannels(gtmSuggestions),
    sales_strategy: extractSalesStrategy(gtmSuggestions),
    launch_timeline: extractLaunchTimeline(gtmSuggestions),
    success_metrics: extractGTMMetrics(gtmSuggestions),
  };

  // Extract competitive positioning
  const competitorSuggestions = suggestionsByCategory.competitor || [];
  const competitive_positioning = {
    direct_competitors: competitorData.filter(c => c.category === 'direct').map(c => c.name),
    indirect_competitors: competitorData.filter(c => c.category === 'indirect').map(c => c.name),
    competitive_advantages: extractCompetitiveAdvantages(competitorSuggestions, competitorData),
    market_gaps: extractMarketGaps(competitorSuggestions, competitorData),
    differentiation_strategy: extractDifferentiationStrategy(competitorSuggestions, competitorData),
  };

  // Generate roadmap from phases
  const roadmap = {
    phases: roadmapPhases.map(phase => ({
      name: phase.name,
      duration: `${phase.duration_weeks} weeks`,
      objectives: phase.objectives,
      key_features: phase.key_features,
      success_criteria: phase.success_criteria,
    })),
    dependencies: extractRoadmapDependencies(roadmapPhases),
    risk_mitigation: extractRiskMitigation(acceptedSuggestions),
  };

  // Aggregate success metrics
  const success_metrics = {
    business_metrics: extractBusinessMetrics(acceptedSuggestions),
    product_metrics: extractProductMetrics(acceptedSuggestions),
    user_metrics: extractUserMetrics(acceptedSuggestions),
    financial_metrics: extractFinancialMetrics(acceptedSuggestions),
  };

  // Generate next steps
  const next_steps = {
    immediate_actions: extractImmediateActions(acceptedSuggestions),
    week_1_goals: extractWeek1Goals(acceptedSuggestions),
    month_1_goals: extractMonth1Goals(acceptedSuggestions),
    quarter_1_goals: extractQuarter1Goals(acceptedSuggestions),
  };

  return {
    vision,
    product,
    monetization,
    go_to_market,
    competitive_positioning,
    roadmap,
    success_metrics,
    next_steps,
  };
}

// Helper functions for extracting specific elements

function extractVisionStatement(suggestions: SuggestionCardData[]): string {
  const visionSuggestions = suggestions.filter(s => 
    s.title.toLowerCase().includes('vision') || 
    s.summary.toLowerCase().includes('vision') ||
    s.reasoning.toLowerCase().includes('vision')
  );
  
  if (visionSuggestions.length > 0) {
    return visionSuggestions[0].summary;
  }
  
  return "BuildRunner SaaS: Empowering developers with intelligent, automated build and deployment solutions that scale with their ambitions.";
}

function extractTargetUsers(suggestions: SuggestionCardData[]): string[] {
  const users = new Set<string>();
  
  suggestions.forEach(s => {
    const content = `${s.title} ${s.summary} ${s.reasoning}`.toLowerCase();
    
    if (content.includes('developer')) users.add('Software Developers');
    if (content.includes('devops')) users.add('DevOps Engineers');
    if (content.includes('startup')) users.add('Startup Teams');
    if (content.includes('enterprise')) users.add('Enterprise Development Teams');
    if (content.includes('freelancer')) users.add('Freelance Developers');
    if (content.includes('agency')) users.add('Development Agencies');
  });
  
  return Array.from(users);
}

function extractValueProposition(suggestions: SuggestionCardData[]): string {
  const valueProps = suggestions.filter(s => 
    s.reasoning.toLowerCase().includes('value') ||
    s.summary.toLowerCase().includes('benefit') ||
    s.title.toLowerCase().includes('advantage')
  );
  
  if (valueProps.length > 0) {
    return valueProps[0].reasoning;
  }
  
  return "Reduce deployment complexity by 80% while increasing reliability and speed through intelligent automation and best-practice enforcement.";
}

function extractMarketOpportunity(suggestions: SuggestionCardData[]): string {
  const marketSuggestions = suggestions.filter(s => 
    s.reasoning.toLowerCase().includes('market') ||
    s.summary.toLowerCase().includes('opportunity') ||
    s.title.toLowerCase().includes('market')
  );
  
  if (marketSuggestions.length > 0) {
    return marketSuggestions[0].reasoning;
  }
  
  return "The DevOps automation market is projected to reach $25B by 2026, driven by increasing cloud adoption and developer productivity demands.";
}

function extractCoreFeatures(suggestions: SuggestionCardData[]): string[] {
  const features = new Set<string>();
  
  suggestions.forEach(s => {
    if (s.title.toLowerCase().includes('feature') || s.category === 'product') {
      features.add(s.title);
    }
  });
  
  return Array.from(features);
}

function extractDifferentiators(suggestions: SuggestionCardData[]): string[] {
  const differentiators = new Set<string>();
  
  suggestions.forEach(s => {
    if (s.reasoning.toLowerCase().includes('unique') || 
        s.reasoning.toLowerCase().includes('different') ||
        s.reasoning.toLowerCase().includes('advantage')) {
      differentiators.add(s.summary);
    }
  });
  
  return Array.from(differentiators);
}

function extractTechnicalApproach(suggestions: SuggestionCardData[]): string {
  const techSuggestions = suggestions.filter(s => 
    s.reasoning.toLowerCase().includes('technical') ||
    s.summary.toLowerCase().includes('architecture') ||
    s.title.toLowerCase().includes('tech')
  );
  
  if (techSuggestions.length > 0) {
    return techSuggestions[0].reasoning;
  }
  
  return "Cloud-native architecture with microservices, containerization, and AI-powered automation for scalable, reliable deployments.";
}

function extractUserExperience(suggestions: SuggestionCardData[]): string {
  const uxSuggestions = suggestions.filter(s => 
    s.reasoning.toLowerCase().includes('user') ||
    s.summary.toLowerCase().includes('experience') ||
    s.title.toLowerCase().includes('ux')
  );
  
  if (uxSuggestions.length > 0) {
    return uxSuggestions[0].reasoning;
  }
  
  return "Intuitive, developer-first interface with powerful CLI tools, comprehensive dashboards, and seamless integrations.";
}

function extractPricingModel(suggestions: SuggestionCardData[]): string {
  const pricingSuggestions = suggestions.filter(s => 
    s.title.toLowerCase().includes('pricing') ||
    s.summary.toLowerCase().includes('price') ||
    s.reasoning.toLowerCase().includes('monetiz')
  );
  
  if (pricingSuggestions.length > 0) {
    return pricingSuggestions[0].summary;
  }
  
  return "Freemium SaaS model with usage-based pricing for builds and deployments, plus premium features for teams and enterprises.";
}

function extractRevenueStreams(suggestions: SuggestionCardData[]): string[] {
  const streams = new Set<string>();
  
  suggestions.forEach(s => {
    const content = `${s.title} ${s.summary} ${s.reasoning}`.toLowerCase();
    
    if (content.includes('subscription')) streams.add('Subscription Revenue');
    if (content.includes('usage')) streams.add('Usage-Based Revenue');
    if (content.includes('enterprise')) streams.add('Enterprise Licensing');
    if (content.includes('support')) streams.add('Professional Services');
    if (content.includes('marketplace')) streams.add('Marketplace Commissions');
  });
  
  return Array.from(streams);
}

function extractPricingTiers(suggestions: SuggestionCardData[]): Array<{name: string; price: string; features: string[]}> {
  // Default pricing tiers based on common SaaS patterns
  return [
    {
      name: "Free",
      price: "$0/month",
      features: ["5 builds/month", "Basic CI/CD", "Community support"]
    },
    {
      name: "Pro",
      price: "$29/month",
      features: ["Unlimited builds", "Advanced CI/CD", "Priority support", "Team collaboration"]
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: ["Custom integrations", "SLA guarantees", "Dedicated support", "Advanced security"]
    }
  ];
}

function extractTargetMetrics(suggestions: SuggestionCardData[]): {arr_target: string; customer_acquisition_cost: string; lifetime_value: string} {
  return {
    arr_target: "$10M ARR by Year 3",
    customer_acquisition_cost: "<$200",
    lifetime_value: ">$2000"
  };
}

function extractTargetSegments(suggestions: SuggestionCardData[]): string[] {
  const segments = new Set<string>();
  
  suggestions.forEach(s => {
    const content = `${s.title} ${s.summary} ${s.reasoning}`.toLowerCase();
    
    if (content.includes('startup')) segments.add('Early-stage Startups');
    if (content.includes('smb')) segments.add('Small-Medium Businesses');
    if (content.includes('enterprise')) segments.add('Enterprise Organizations');
    if (content.includes('agency')) segments.add('Development Agencies');
  });
  
  return Array.from(segments);
}

function extractMarketingChannels(suggestions: SuggestionCardData[]): string[] {
  const channels = new Set<string>();
  
  suggestions.forEach(s => {
    const content = `${s.title} ${s.summary} ${s.reasoning}`.toLowerCase();
    
    if (content.includes('content')) channels.add('Content Marketing');
    if (content.includes('social')) channels.add('Social Media');
    if (content.includes('seo')) channels.add('SEO/SEM');
    if (content.includes('community')) channels.add('Developer Communities');
    if (content.includes('partner')) channels.add('Partner Channels');
  });
  
  return Array.from(channels);
}

function extractSalesStrategy(suggestions: SuggestionCardData[]): string {
  const salesSuggestions = suggestions.filter(s => 
    s.reasoning.toLowerCase().includes('sales') ||
    s.summary.toLowerCase().includes('sell') ||
    s.title.toLowerCase().includes('sales')
  );
  
  if (salesSuggestions.length > 0) {
    return salesSuggestions[0].reasoning;
  }
  
  return "Product-led growth with self-service onboarding, supported by inside sales for enterprise accounts and partner channel development.";
}

function extractLaunchTimeline(suggestions: SuggestionCardData[]): string {
  return "MVP launch in 6 months, followed by iterative feature releases every 2-4 weeks based on user feedback and market demands.";
}

function extractGTMMetrics(suggestions: SuggestionCardData[]): string[] {
  return [
    "Customer Acquisition Cost (CAC)",
    "Monthly Recurring Revenue (MRR)",
    "User Activation Rate",
    "Net Promoter Score (NPS)",
    "Churn Rate"
  ];
}

function extractCompetitiveAdvantages(suggestions: SuggestionCardData[], competitors: CompetitorData[]): string[] {
  const advantages = new Set<string>();
  
  suggestions.forEach(s => {
    if (s.reasoning.toLowerCase().includes('advantage') ||
        s.reasoning.toLowerCase().includes('better') ||
        s.reasoning.toLowerCase().includes('superior')) {
      advantages.add(s.summary);
    }
  });
  
  return Array.from(advantages);
}

function extractMarketGaps(suggestions: SuggestionCardData[], competitors: CompetitorData[]): string[] {
  const gaps = new Set<string>();
  
  suggestions.forEach(s => {
    if (s.reasoning.toLowerCase().includes('gap') ||
        s.reasoning.toLowerCase().includes('missing') ||
        s.reasoning.toLowerCase().includes('lack')) {
      gaps.add(s.summary);
    }
  });
  
  return Array.from(gaps);
}

function extractDifferentiationStrategy(suggestions: SuggestionCardData[], competitors: CompetitorData[]): string {
  const diffSuggestions = suggestions.filter(s => 
    s.reasoning.toLowerCase().includes('differentiat') ||
    s.summary.toLowerCase().includes('unique') ||
    s.title.toLowerCase().includes('different')
  );
  
  if (diffSuggestions.length > 0) {
    return diffSuggestions[0].reasoning;
  }
  
  return "Focus on developer experience, AI-powered automation, and seamless integrations to create a platform that's both powerful and intuitive.";
}

function extractRoadmapDependencies(phases: RoadmapPhase[]): string[] {
  const dependencies = new Set<string>();
  
  phases.forEach(phase => {
    phase.dependencies.forEach(dep => dependencies.add(dep));
  });
  
  return Array.from(dependencies);
}

function extractRiskMitigation(suggestions: SuggestionCardData[]): string[] {
  const risks = new Set<string>();
  
  suggestions.forEach(s => {
    if (s.risks) {
      s.risks.forEach(risk => risks.add(`Mitigate: ${risk}`));
    }
  });
  
  return Array.from(risks);
}

function extractBusinessMetrics(suggestions: SuggestionCardData[]): string[] {
  const metrics = new Set<string>();
  
  suggestions.forEach(s => {
    if (s.metrics) {
      s.metrics.forEach(metric => {
        if (metric.toLowerCase().includes('revenue') ||
            metric.toLowerCase().includes('growth') ||
            metric.toLowerCase().includes('customer')) {
          metrics.add(metric);
        }
      });
    }
  });
  
  return Array.from(metrics);
}

function extractProductMetrics(suggestions: SuggestionCardData[]): string[] {
  const metrics = new Set<string>();
  
  suggestions.forEach(s => {
    if (s.metrics) {
      s.metrics.forEach(metric => {
        if (metric.toLowerCase().includes('usage') ||
            metric.toLowerCase().includes('feature') ||
            metric.toLowerCase().includes('performance')) {
          metrics.add(metric);
        }
      });
    }
  });
  
  return Array.from(metrics);
}

function extractUserMetrics(suggestions: SuggestionCardData[]): string[] {
  const metrics = new Set<string>();
  
  suggestions.forEach(s => {
    if (s.metrics) {
      s.metrics.forEach(metric => {
        if (metric.toLowerCase().includes('user') ||
            metric.toLowerCase().includes('engagement') ||
            metric.toLowerCase().includes('satisfaction')) {
          metrics.add(metric);
        }
      });
    }
  });
  
  return Array.from(metrics);
}

function extractFinancialMetrics(suggestions: SuggestionCardData[]): string[] {
  return [
    "Monthly Recurring Revenue (MRR)",
    "Annual Recurring Revenue (ARR)",
    "Customer Lifetime Value (CLV)",
    "Customer Acquisition Cost (CAC)",
    "Gross Revenue Retention",
    "Net Revenue Retention"
  ];
}

function extractImmediateActions(suggestions: SuggestionCardData[]): string[] {
  const actions = suggestions
    .filter(s => s.implementation_effort === 'low' && s.impact_score >= 7)
    .map(s => s.title)
    .slice(0, 5);
  
  return actions.length > 0 ? actions : [
    "Set up development environment",
    "Create initial project structure",
    "Define MVP feature set",
    "Begin market research",
    "Establish team communication"
  ];
}

function extractWeek1Goals(suggestions: SuggestionCardData[]): string[] {
  return [
    "Complete technical architecture design",
    "Finalize MVP feature specifications",
    "Set up CI/CD pipeline",
    "Begin core development",
    "Establish user feedback channels"
  ];
}

function extractMonth1Goals(suggestions: SuggestionCardData[]): string[] {
  return [
    "Complete MVP development",
    "Conduct initial user testing",
    "Refine product based on feedback",
    "Prepare go-to-market materials",
    "Establish key partnerships"
  ];
}

function extractQuarter1Goals(suggestions: SuggestionCardData[]): string[] {
  return [
    "Launch MVP to early adopters",
    "Achieve product-market fit indicators",
    "Scale development team",
    "Implement user feedback loop",
    "Prepare for Series A funding"
  ];
}
