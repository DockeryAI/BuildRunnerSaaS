import { PRDDocument, createDefaultPRD, PRD_PHASES } from './schema';

export class PRDBuilder {
  private prd: PRDDocument;
  private currentPhase: number = 1;

  constructor(title: string = "", owner: string = "product@buildrunner.cloud") {
    this.prd = createDefaultPRD(title, owner);
  }

  // Initialize PRD from product idea
  initializeFromIdea(productIdea: string): void {
    this.prd.meta.title = this.extractTitleFromIdea(productIdea);
    this.prd.executive_summary = this.generateExecutiveSummary(productIdea);
    this.prd.problem.user_pain = this.extractUserPain(productIdea);
    this.prd.value_prop.statement = this.generateValueProp(productIdea);
  }

  // Phase 1: Context - Fill executive summary, problem, value prop, personas
  fillContext(data: {
    executive_summary?: string;
    user_pain?: string;
    value_proposition?: string;
    personas?: Array<{name: string; jtbd: string; environments?: string[]; segments?: string[]}>;
    root_causes?: string[];
    current_workaround?: string;
  }): void {
    if (data.executive_summary) {
      this.prd.executive_summary = data.executive_summary;
    }
    
    if (data.user_pain) {
      this.prd.problem.user_pain = data.user_pain;
    }
    
    if (data.value_proposition) {
      this.prd.value_prop.statement = data.value_proposition;
    }
    
    if (data.personas) {
      this.prd.audience.personas = data.personas.map(p => ({
        name: p.name,
        jtbd: p.jtbd,
        environments: p.environments || ["web"],
        segments: p.segments || ["SMB"]
      }));
    }
    
    if (data.root_causes) {
      this.prd.problem.root_causes = data.root_causes;
    }
    
    if (data.current_workaround) {
      this.prd.problem.current_workaround = data.current_workaround;
    }
  }

  // Phase 2: Shape - Propose features, scope
  fillShape(data: {
    features?: Array<{
      id: string;
      name: string;
      description: string;
      user_story?: string;
      acceptance_criteria?: string[];
      plan_gate?: "free" | "pro" | "enterprise";
    }>;
    in_scope?: string[];
    out_of_scope?: string[];
    objectives?: Array<{objective: string; kpi: string; target: string; source: string}>;
  }): void {
    if (data.features) {
      this.prd.features = data.features.map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        user_story: f.user_story || `As a user, I want ${f.name.toLowerCase()} so that I can achieve my goals.`,
        acceptance_criteria: f.acceptance_criteria || [],
        ux_notes: ["empty", "loading", "error"],
        telemetry: {
          events: [{
            name: `${f.name.toLowerCase().replace(/\s+/g, '_')}_used`,
            properties: ["user_id", "project_id"]
          }]
        },
        performance: {
          p95_latency_ms: 1500,
          max_payload_kb: 256
        },
        plan_gate: f.plan_gate || "free"
      }));
    }
    
    if (data.in_scope) {
      this.prd.scope.in_scope = data.in_scope;
    }
    
    if (data.out_of_scope) {
      this.prd.scope.out_of_scope = data.out_of_scope;
    }
    
    if (data.objectives) {
      this.prd.objectives = data.objectives;
    }
  }

  // Phase 3: Evidence & Metrics - Add analytics and success criteria
  fillEvidence(data: {
    north_star?: string;
    events?: Array<{name: string; properties: string[]}>;
    experiments?: Array<{name: string; variant_allocation: Record<string, number>; success_metric: string}>;
    qualitative_evidence?: string[];
    quantitative_evidence?: string[];
  }): void {
    if (data.north_star) {
      this.prd.analytics.north_star = data.north_star;
    }
    
    if (data.events) {
      this.prd.analytics.events = data.events;
    }
    
    if (data.experiments) {
      this.prd.analytics.experiments = data.experiments;
    }
    
    if (data.qualitative_evidence) {
      this.prd.problem.evidence.qualitative = data.qualitative_evidence;
    }
    
    if (data.quantitative_evidence) {
      this.prd.problem.evidence.quantitative = data.quantitative_evidence;
    }
  }

  // Phase 4: Delivery - Technical requirements and acceptance criteria
  fillDelivery(data: {
    performance_slo?: string;
    rate_limits?: {rpm: number};
    dependencies?: {internal: string[]; external: string[]; feature_flags: string[]};
    risks?: Array<{risk: string; likelihood: "Low" | "Med" | "High"; impact: "Low" | "Med" | "High"; mitigation: string}>;
    acceptance_criteria?: Record<string, string[]>; // feature_id -> criteria
  }): void {
    if (data.performance_slo) {
      this.prd.non_functional.performance.slo = data.performance_slo;
    }
    
    if (data.rate_limits) {
      this.prd.non_functional.performance.rate_limits = data.rate_limits;
    }
    
    if (data.dependencies) {
      this.prd.dependencies = data.dependencies;
    }
    
    if (data.risks) {
      this.prd.risks = data.risks;
    }
    
    if (data.acceptance_criteria) {
      this.prd.features = this.prd.features.map(feature => ({
        ...feature,
        acceptance_criteria: data.acceptance_criteria![feature.id] || feature.acceptance_criteria
      }));
    }
  }

  // Phase 5: Commercialization - Pricing and business model
  fillCommercialization(data: {
    pricing_model?: string;
    meter_unit?: string;
    plan_matrix?: Array<{plan: string; limits: Record<string, any>; features: string[]}>;
    entitlements?: Array<{feature_id: string; min_plan: string}>;
  }): void {
    if (data.pricing_model) {
      this.prd.monetization.pricing_model = data.pricing_model;
    }
    
    if (data.meter_unit) {
      this.prd.monetization.meter_unit = data.meter_unit;
    }
    
    if (data.plan_matrix) {
      this.prd.monetization.plan_matrix = data.plan_matrix;
    }
    
    if (data.entitlements) {
      this.prd.monetization.entitlements = data.entitlements;
    }
  }

  // Phase 6: Launch - Rollout plan and go-to-market
  fillLaunch(data: {
    phases?: Array<{name: string; criteria: string[]}>;
    rollback_plan?: string;
    open_questions?: Array<{question: string; owner: string; due: string}>;
    decisions?: Array<{decision: string; owner: string; date: string; context: string}>;
  }): void {
    if (data.phases) {
      this.prd.rollout.phases = data.phases;
    }
    
    if (data.rollback_plan) {
      this.prd.rollout.rollback_plan = data.rollback_plan;
    }
    
    if (data.open_questions) {
      this.prd.open_questions = data.open_questions;
    }
    
    if (data.decisions) {
      this.prd.decisions = data.decisions;
    }
  }

  // Utility methods
  private extractTitleFromIdea(idea: string): string {
    // Extract a concise title from the product idea
    const words = idea.split(' ').slice(0, 6);
    return words.join(' ').replace(/[^\w\s]/g, '').trim();
  }

  private generateExecutiveSummary(idea: string): string {
    return `This PRD outlines the development of ${this.extractTitleFromIdea(idea)}, addressing the need for ${idea.toLowerCase()}.`;
  }

  private extractUserPain(idea: string): string {
    return `Users currently struggle with manual processes related to ${idea.toLowerCase()}.`;
  }

  private generateValueProp(idea: string): string {
    return `Automate and streamline ${idea.toLowerCase()} to save time and improve efficiency.`;
  }

  // Getters
  getPRD(): PRDDocument {
    return { ...this.prd };
  }

  getCurrentPhase(): number {
    return this.currentPhase;
  }

  getPhaseInfo(phaseId: number) {
    return PRD_PHASES.find(p => p.id === phaseId);
  }

  getAllPhases() {
    return PRD_PHASES;
  }

  // Phase management
  setPhase(phaseId: number): void {
    if (phaseId >= 1 && phaseId <= PRD_PHASES.length) {
      this.currentPhase = phaseId;
    }
  }

  nextPhase(): boolean {
    if (this.currentPhase < PRD_PHASES.length) {
      this.currentPhase++;
      return true;
    }
    return false;
  }

  // Get sections for current phase
  getCurrentPhaseSections(): string[] {
    const phaseInfo = PRD_PHASES.find(p => p.id === this.currentPhase);
    return phaseInfo?.sections || [];
  }

  // Get completion status for current phase
  getCurrentPhaseCompletion(): { completed: string[], total: string[] } {
    const sections = this.getCurrentPhaseSections();
    const completed = sections.filter(section => this.isSectionCompleted(section));
    return { completed, total: sections };
  }

  // Check if a section is completed
  private isSectionCompleted(sectionId: string): boolean {
    switch (sectionId) {
      case 'metadata':
        return !!this.prd.meta.title;
      case 'executive_summary':
        return !!this.prd.executive_summary;
      case 'problem_statement':
        return !!this.prd.problem.user_pain;
      case 'target_audience':
        return this.prd.audience.personas.length > 0;
      case 'value_proposition':
        return !!this.prd.value_prop.statement;
      case 'objectives':
        return this.prd.objectives.length > 0;
      case 'scope':
        return this.prd.scope.in_scope.length > 0;
      case 'features':
        return this.prd.features.length > 0;
      case 'non_functional':
        return !!this.prd.non_functional.performance.slo;
      case 'dependencies':
        return this.prd.dependencies.internal.length > 0 || this.prd.dependencies.external.length > 0;
      case 'risks':
        return this.prd.risks.length > 0;
      case 'analytics':
        return !!this.prd.analytics.north_star;
      case 'monetization':
        return !!this.prd.monetization.pricing_model;
      case 'rollout':
        return this.prd.rollout.phases.length > 0;
      case 'open_questions':
        return true; // Optional section
      default:
        return false;
    }
  }

  // Update metadata
  updateMetadata(updates: Partial<PRDDocument['meta']>): void {
    this.prd.meta = { ...this.prd.meta, ...updates, updated_at: new Date().toISOString() };
  }

  // Export as JSON
  toJSON(): string {
    return JSON.stringify(this.prd, null, 2);
  }

  // Export as Markdown
  toMarkdown(): string {
    return this.generateMarkdown();
  }

  private generateMarkdown(): string {
    const prd = this.prd;
    
    return `# ${prd.meta.title}

**Version:** ${prd.meta.version} | **Status:** ${prd.meta.status} | **Priority:** ${prd.meta.priority}
**Owner:** ${prd.meta.owner.join(', ')} | **Updated:** ${prd.meta.updated_at}

## 1) Executive Summary

${prd.executive_summary}

## 2) Problem Statement

**User Pain:** ${prd.problem.user_pain}

**Current Workaround:** ${prd.problem.current_workaround}

**Root Causes:**
${prd.problem.root_causes.map(cause => `- ${cause}`).join('\n')}

## 3) Target Audience & Personas

${prd.audience.personas.map(persona => `
**${persona.name}**
- JTBD: ${persona.jtbd}
- Environments: ${persona.environments.join(', ')}
- Segments: ${persona.segments.join(', ')}
`).join('\n')}

## 4) Value Proposition

${prd.value_prop.statement}

**Differentiators:**
${prd.value_prop.differentiators.map(diff => `- ${diff}`).join('\n')}

## 5) Objectives & Success Metrics

| Objective | KPI | Target | Source |
|-----------|-----|--------|--------|
${prd.objectives.map(obj => `| ${obj.objective} | ${obj.kpi} | ${obj.target} | ${obj.source} |`).join('\n')}

## 6) Scope

**In Scope:**
${prd.scope.in_scope.map(item => `- ${item}`).join('\n')}

**Out of Scope:**
${prd.scope.out_of_scope.map(item => `- ${item}`).join('\n')}

## 7) Features & Functional Requirements

${prd.features.map(feature => `
### ${feature.id}: ${feature.name}

**Description:** ${feature.description}

**User Story:** ${feature.user_story}

**Acceptance Criteria:**
${feature.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

**Plan Gate:** ${feature.plan_gate}
`).join('\n')}

## 8) Non-Functional Requirements

**Performance:** ${prd.non_functional.performance.slo}
**Security:** ${prd.non_functional.security.auth}, ${prd.non_functional.security.pii}
**Accessibility:** ${prd.non_functional.accessibility.wcag}

## 9) Monetization & Packaging

**Pricing Model:** ${prd.monetization.pricing_model}
**Meter Unit:** ${prd.monetization.meter_unit}

${prd.monetization.plan_matrix.map(plan => `
**${plan.plan} Plan**
- Limits: ${JSON.stringify(plan.limits)}
- Features: ${plan.features.join(', ')}
`).join('\n')}

## 10) Dependencies

**Internal:** ${prd.dependencies.internal.join(', ')}
**External:** ${prd.dependencies.external.join(', ')}
**Feature Flags:** ${prd.dependencies.feature_flags.join(', ')}

## 11) Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
${prd.risks.map(risk => `| ${risk.risk} | ${risk.likelihood} | ${risk.impact} | ${risk.mitigation} |`).join('\n')}

## 12) Analytics & Experimentation

**North Star:** ${prd.analytics.north_star}

**Events:**
${prd.analytics.events.map(event => `- ${event.name}: ${event.properties.join(', ')}`).join('\n')}

## 13) Rollout & GTM

${prd.rollout.phases.map(phase => `
**${phase.name}**
- Criteria: ${phase.criteria.join(', ')}
`).join('\n')}

**Rollback Plan:** ${prd.rollout.rollback_plan}

## 14) Open Questions

${prd.open_questions.map(q => `- ${q.question} (Owner: ${q.owner}, Due: ${q.due})`).join('\n')}

## 15) Decisions

${prd.decisions.map(d => `- ${d.decision} (${d.owner}, ${d.date}): ${d.context}`).join('\n')}
`;
  }
}
