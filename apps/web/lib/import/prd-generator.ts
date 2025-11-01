/**
 * PRD Generator
 *
 * Generates comprehensive Product Requirements Documents from code analysis
 */

import { ProjectScan, DetectedFeature, TechStack, GeneratedPRD, PRDFeature } from './types';
import { llmGateway } from '../orchestration/llm-gateway';

export class PRDGenerator {
  /**
   * Generate PRD from project analysis
   */
  public async generatePRD(
    scan: ProjectScan,
    features: DetectedFeature[],
    techStack: TechStack
  ): Promise<GeneratedPRD> {
    console.log('📝 Generating PRD from codebase...');

    const prompt = this.buildPRDPrompt(scan, features, techStack);

    try {
      const response = await llmGateway.request({
        task_type: 'reasoning',
        prompt,
        require_json: true,
      });

      const prd = JSON.parse(response.content);
      return this.enrichPRD(prd, features, techStack);
    } catch (error) {
      console.error('PRD generation failed:', error);
      // Return a basic PRD as fallback
      return this.generateFallbackPRD(scan, features, techStack);
    }
  }

  /**
   * Build PRD generation prompt
   */
  private buildPRDPrompt(
    scan: ProjectScan,
    features: DetectedFeature[],
    techStack: TechStack
  ): string {
    const { projectInfo, documentation, dependencies } = scan;

    const frontendTech = techStack.frontend.map(t => t.name).join(', ');
    const backendTech = techStack.backend.map(t => t.name).join(', ');
    const databaseTech = techStack.database.map(t => t.name).join(', ');

    return `You are a senior product manager analyzing an existing codebase to generate a comprehensive Product Requirements Document (PRD).

PROJECT INFORMATION:
Name: ${projectInfo.name}
Description: ${projectInfo.description || 'Not provided'}
Tech Stack: ${frontendTech} | ${backendTech} | ${databaseTech}
Files: ${projectInfo.fileCount}
Lines of Code: ${projectInfo.linesOfCode}

README:
${documentation.readme || 'No README found'}

DETECTED FEATURES (${features.length}):
${features.map(f => `
- ${f.name} (${f.status}, confidence: ${f.confidence})
  ${f.description}
  Files: ${f.codeFiles.slice(0, 3).join(', ')}${f.codeFiles.length > 3 ? '...' : ''}
`).join('\n')}

KEY DEPENDENCIES:
${dependencies.slice(0, 30).map(d => `- ${d.name}@${d.version}`).join('\n')}

TASK:
Generate a comprehensive Product Requirements Document that captures what this application does, who it's for, and what problems it solves. Be specific and detailed.

Return JSON with this exact structure:
{
  "executiveSummary": "Brief 2-3 sentence summary of what this application does and its value proposition",
  "problemStatement": "What problem does this application solve? What pain points does it address?",
  "targetAudience": "Who are the target users? Be specific about demographics, roles, or use cases",
  "valueProposition": "What unique value does this provide? How does it make users' lives better?",
  "features": [
    {
      "id": "feature-1",
      "name": "Feature Name",
      "description": "Detailed description of what this feature does",
      "userStory": "As a [user type], I want [goal] so that [benefit]",
      "acceptanceCriteria": [
        "Criterion 1",
        "Criterion 2"
      ],
      "technicalNotes": "Technical implementation details observed in code",
      "dependencies": ["Other features this depends on"],
      "status": "completed|in_progress|planned",
      "phase": 1|2|3|4
    }
  ],
  "technicalArchitecture": "High-level description of the technical architecture, key components, and how they interact",
  "dataModel": "Description of the data models, relationships, and storage strategy",
  "apiEndpoints": [
    {
      "method": "GET|POST|PUT|DELETE",
      "path": "/api/...",
      "description": "What this endpoint does",
      "authentication": true|false
    }
  ],
  "userFlows": [
    {
      "name": "User Flow Name",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "screens": ["Screen 1", "Screen 2"]
    }
  ]
}

IMPORTANT:
- Be comprehensive and detailed
- Base everything on actual code evidence
- Mark features as "completed" if they exist in code, "in_progress" if partially implemented, "planned" if mentioned in docs but not implemented
- Organize features into phases: 1=Context (core value), 2=Shape (features), 3=Evidence (metrics/tech), 4=Launch (deployment)
- Use professional product management language
- Focus on user value, not just technical details`;
  }

  /**
   * Enrich PRD with additional context
   */
  private enrichPRD(
    prd: GeneratedPRD,
    features: DetectedFeature[],
    techStack: TechStack
  ): GeneratedPRD {
    // Ensure all features from detection are included
    const prdFeatureIds = new Set(prd.features.map(f => f.id));

    features.forEach(detectedFeature => {
      if (!prdFeatureIds.has(detectedFeature.id)) {
        prd.features.push({
          id: detectedFeature.id,
          name: detectedFeature.name,
          description: detectedFeature.description,
          userStory: `As a user, I want ${detectedFeature.name.toLowerCase()} so that I can benefit from this feature`,
          acceptanceCriteria: detectedFeature.evidence,
          technicalNotes: `Detected from: ${detectedFeature.codeFiles.slice(0, 3).join(', ')}`,
          dependencies: [],
          status: detectedFeature.status,
          phase: this.inferPhase(detectedFeature.category),
        });
      }
    });

    return prd;
  }

  /**
   * Generate fallback PRD if AI fails
   */
  private generateFallbackPRD(
    scan: ProjectScan,
    features: DetectedFeature[],
    techStack: TechStack
  ): GeneratedPRD {
    const { projectInfo, documentation } = scan;

    const frontendTech = techStack.frontend.map(t => t.name).join(', ');
    const backendTech = techStack.backend.map(t => t.name).join(', ');

    return {
      executiveSummary: `${projectInfo.name} is a ${frontendTech || 'web'} application${
        backendTech ? ` with ${backendTech} backend` : ''
      } that provides ${features.length} key features to users.`,
      problemStatement: documentation.readme
        ? 'Based on the project documentation: ' + documentation.readme.substring(0, 200) + '...'
        : 'This application solves problems for its target users through its implemented features.',
      targetAudience: 'Users who need the functionality provided by this application',
      valueProposition: `Provides ${features.length} implemented features to streamline user workflows`,
      features: features.map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        userStory: `As a user, I want ${f.name.toLowerCase()} so that I can achieve my goals`,
        acceptanceCriteria: f.evidence,
        technicalNotes: `Implemented in: ${f.codeFiles.slice(0, 3).join(', ')}`,
        dependencies: [],
        status: f.status,
        phase: this.inferPhase(f.category),
      })),
      technicalArchitecture: `Built with ${frontendTech}${backendTech ? ` and ${backendTech}` : ''}. ${
        techStack.database.length > 0
          ? `Uses ${techStack.database.map(t => t.name).join(', ')} for data persistence.`
          : ''
      }`,
      dataModel: techStack.database.length > 0
        ? `Application uses ${techStack.database[0].name} for data storage with models corresponding to the implemented features.`
        : 'Data model to be documented based on codebase analysis.',
      apiEndpoints: [],
      userFlows: [],
    };
  }

  /**
   * Infer PRD phase from feature category
   */
  private inferPhase(category: string): 1 | 2 | 3 | 4 {
    switch (category) {
      case 'authentication':
      case 'authorization':
        return 1; // Context - core functionality
      case 'ui':
      case 'api':
      case 'business-logic':
        return 2; // Shape - features
      case 'database':
      case 'testing':
        return 3; // Evidence - technical details
      case 'infrastructure':
      case 'integration':
        return 4; // Launch - deployment
      default:
        return 2;
    }
  }
}

export const prdGenerator = new PRDGenerator();
