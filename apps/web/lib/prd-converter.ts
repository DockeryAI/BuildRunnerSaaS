/**
 * PRD Converter
 *
 * Converts UI prdSections format to internal PRD format
 * Ensures all PRD fields are properly populated from user-created sections
 */

export interface PRDItem {
  id: string;
  title: string;
  description: string;
  citations?: string[];
  status?: 'approved' | 'pending' | 'rejected';
}

export interface PRDSection {
  id: string;
  title: string;
  items: PRDItem[];
}

export interface PRDSectionsMap {
  [phase: number]: PRDSection[];
}

export interface PRD {
  projectName: string;
  description: string;
  features: string[];
  targetAudience: string;
  valueProposition: string;
  technicalRequirements: string[];
  successMetrics?: string[];
  userStories?: string[];
  constraints?: string[];
  assumptions?: string[];
  risks?: string[];
  industry?: string;
  brandPersonality?: string;
  generatedAt: string;
  source: 'user-created' | 'auto-generated-from-prompt' | 'enhanced';
}

/**
 * Convert prdSections from UI to complete PRD object
 */
export function convertPRDSectionsToPRD(
  prdSections: PRDSectionsMap,
  productName: string,
  productIdea: string
): PRD {
  const allSections: PRDSection[] = [];

  // Flatten all phases into single array
  for (const phase in prdSections) {
    allSections.push(...prdSections[phase]);
  }

  // Extract data from sections by section ID patterns
  const features: string[] = [];
  const requirements: string[] = [];
  const metrics: string[] = [];
  const userStories: string[] = [];
  const constraints: string[] = [];
  const assumptions: string[] = [];
  const risks: string[] = [];

  let description = productIdea;
  let targetAudience = '';
  let valueProposition = '';
  let industry = '';
  let brandPersonality = '';

  for (const section of allSections) {
    const sectionId = section.id.toLowerCase();
    const sectionTitle = section.title.toLowerCase();

    // Executive Summary / Problem Statement
    if (sectionId.includes('executive') || sectionId.includes('problem') ||
        sectionId.includes('summary') || sectionId.includes('overview')) {
      const summaryText = section.items.map(item =>
        `${item.title}: ${item.description}`
      ).join('\n\n');
      if (summaryText) {
        description = summaryText;
      }
    }

    // Features & Functionality
    if (sectionId.includes('feature') || sectionId.includes('functionality') ||
        sectionId.includes('capabilities') || sectionTitle.includes('feature')) {
      section.items.forEach(item => {
        features.push(`${item.title}: ${item.description}`);
      });
    }

    // Target Audience / Users
    if (sectionId.includes('audience') || sectionId.includes('user') ||
        sectionId.includes('persona') || sectionTitle.includes('audience')) {
      targetAudience = section.items.map(item =>
        `${item.title}: ${item.description}`
      ).join('\n');
    }

    // Value Proposition / Benefits
    if (sectionId.includes('value') || sectionId.includes('benefit') ||
        sectionId.includes('advantage') || sectionTitle.includes('value')) {
      valueProposition = section.items.map(item =>
        `${item.title}: ${item.description}`
      ).join('\n');
    }

    // Technical Requirements
    if (sectionId.includes('technical') || sectionId.includes('requirement') ||
        sectionId.includes('specification') || sectionTitle.includes('technical')) {
      section.items.forEach(item => {
        requirements.push(`${item.title}: ${item.description}`);
      });
    }

    // Success Metrics / KPIs
    if (sectionId.includes('metric') || sectionId.includes('kpi') ||
        sectionId.includes('success') || sectionId.includes('measurement')) {
      section.items.forEach(item => {
        metrics.push(`${item.title}: ${item.description}`);
      });
    }

    // User Stories
    if (sectionId.includes('story') || sectionId.includes('scenario') ||
        sectionId.includes('journey') || sectionTitle.includes('story')) {
      section.items.forEach(item => {
        userStories.push(`${item.title}: ${item.description}`);
      });
    }

    // Constraints
    if (sectionId.includes('constraint') || sectionId.includes('limitation') ||
        sectionTitle.includes('constraint')) {
      section.items.forEach(item => {
        constraints.push(`${item.title}: ${item.description}`);
      });
    }

    // Assumptions
    if (sectionId.includes('assumption') || sectionTitle.includes('assumption')) {
      section.items.forEach(item => {
        assumptions.push(`${item.title}: ${item.description}`);
      });
    }

    // Risks
    if (sectionId.includes('risk') || sectionTitle.includes('risk')) {
      section.items.forEach(item => {
        risks.push(`${item.title}: ${item.description}`);
      });
    }

    // Industry
    if (sectionId.includes('industry') || sectionId.includes('market') ||
        sectionId.includes('sector')) {
      industry = section.items.map(item => item.description).join('; ');
    }

    // Brand Personality
    if (sectionId.includes('brand') || sectionId.includes('personality') ||
        sectionId.includes('tone') || sectionId.includes('voice')) {
      brandPersonality = section.items.map(item => item.description).join('; ');
    }
  }

  // Build complete PRD
  const prd: PRD = {
    projectName: productName,
    description: description || productIdea,
    features: features.length > 0 ? features : [productIdea],
    targetAudience: targetAudience || 'General users',
    valueProposition: valueProposition || 'Solve user problems efficiently',
    technicalRequirements: requirements,
    successMetrics: metrics.length > 0 ? metrics : undefined,
    userStories: userStories.length > 0 ? userStories : undefined,
    constraints: constraints.length > 0 ? constraints : undefined,
    assumptions: assumptions.length > 0 ? assumptions : undefined,
    risks: risks.length > 0 ? risks : undefined,
    industry: industry || undefined,
    brandPersonality: brandPersonality || undefined,
    generatedAt: new Date().toISOString(),
    source: 'user-created',
  };

  return prd;
}

/**
 * Get a formatted PRD summary for logging/debugging
 */
export function getPRDSummary(prd: PRD): string {
  return `
PRD Summary:
- Project: ${prd.projectName}
- Description: ${prd.description.substring(0, 100)}...
- Features: ${prd.features.length}
- Target Audience: ${prd.targetAudience ? 'Defined' : 'Not defined'}
- Value Proposition: ${prd.valueProposition ? 'Defined' : 'Not defined'}
- Technical Requirements: ${prd.technicalRequirements?.length || 0}
- Source: ${prd.source}
`.trim();
}
