/**
 * Feature Extractor
 *
 * Extracts features from code using AI analysis
 */

import { ProjectScan, DetectedFeature, FeatureCategory, TechStack } from './types';
import { llmGateway } from '../orchestration/llm-gateway';

export class FeatureExtractor {
  /**
   * Extract features from project scan
   */
  public async extractFeatures(scan: ProjectScan, techStack: TechStack): Promise<DetectedFeature[]> {
    console.log('🔍 Extracting features from codebase...');

    const features: DetectedFeature[] = [];

    // Extract features from file structure
    features.push(...this.extractFromStructure(scan));

    // Extract features from dependencies
    features.push(...this.extractFromDependencies(scan));

    // Extract features using AI
    const aiFeatures = await this.extractWithAI(scan, techStack);
    features.push(...aiFeatures);

    // Deduplicate and merge
    return this.deduplicateFeatures(features);
  }

  /**
   * Extract features from file structure
   */
  private extractFromStructure(scan: ProjectScan): DetectedFeature[] {
    const features: DetectedFeature[] = [];
    const fileStructure = scan.fileStructure;

    // Look for authentication-related files
    if (this.findFiles(fileStructure, ['auth', 'login', 'register', 'signin']).length > 0) {
      features.push({
        id: `feature-auth-${Date.now()}`,
        name: 'User Authentication',
        description: 'User authentication and authorization system',
        status: 'completed',
        confidence: 0.9,
        codeFiles: this.findFiles(fileStructure, ['auth', 'login', 'register', 'signin']),
        category: 'authentication',
        complexity: 'high',
        evidence: ['Auth-related files detected in codebase'],
      });
    }

    // Look for API routes
    const apiFiles = this.findFiles(fileStructure, ['api', 'route', 'endpoint']);
    if (apiFiles.length > 0) {
      features.push({
        id: `feature-api-${Date.now()}`,
        name: 'API Endpoints',
        description: `RESTful API with ${apiFiles.length} endpoints`,
        status: 'completed',
        confidence: 0.95,
        codeFiles: apiFiles,
        category: 'api',
        complexity: 'medium',
        evidence: [`${apiFiles.length} API files detected`],
      });
    }

    // Look for dashboard/admin
    if (this.findFiles(fileStructure, ['dashboard', 'admin']).length > 0) {
      features.push({
        id: `feature-dashboard-${Date.now()}`,
        name: 'Dashboard',
        description: 'User dashboard interface',
        status: 'completed',
        confidence: 0.9,
        codeFiles: this.findFiles(fileStructure, ['dashboard', 'admin']),
        category: 'ui',
        complexity: 'medium',
        evidence: ['Dashboard files detected'],
      });
    }

    // Look for settings
    if (this.findFiles(fileStructure, ['settings', 'preferences', 'config']).length > 0) {
      features.push({
        id: `feature-settings-${Date.now()}`,
        name: 'Settings Management',
        description: 'User settings and preferences',
        status: 'completed',
        confidence: 0.85,
        codeFiles: this.findFiles(fileStructure, ['settings', 'preferences']),
        category: 'ui',
        complexity: 'low',
        evidence: ['Settings files detected'],
      });
    }

    return features;
  }

  /**
   * Extract features from dependencies
   */
  private extractFromDependencies(scan: ProjectScan): DetectedFeature[] {
    const features: DetectedFeature[] = [];
    const { dependencies } = scan;

    // Check for payment integrations
    if (dependencies.some(d => d.name.includes('stripe') || d.name.includes('payment'))) {
      features.push({
        id: `feature-payment-${Date.now()}`,
        name: 'Payment Processing',
        description: 'Payment gateway integration',
        status: 'completed',
        confidence: 0.9,
        codeFiles: [],
        category: 'integration',
        complexity: 'high',
        evidence: ['Payment library detected in dependencies'],
      });
    }

    // Check for email
    if (dependencies.some(d => d.name.includes('nodemailer') || d.name.includes('sendgrid') || d.name.includes('resend'))) {
      features.push({
        id: `feature-email-${Date.now()}`,
        name: 'Email Notifications',
        description: 'Email sending and notification system',
        status: 'completed',
        confidence: 0.85,
        codeFiles: [],
        category: 'integration',
        complexity: 'medium',
        evidence: ['Email library detected in dependencies'],
      });
    }

    // Check for file upload
    if (dependencies.some(d => d.name.includes('multer') || d.name.includes('formidable') || d.name.includes('upload'))) {
      features.push({
        id: `feature-upload-${Date.now()}`,
        name: 'File Upload',
        description: 'File upload and management',
        status: 'completed',
        confidence: 0.85,
        codeFiles: [],
        category: 'business-logic',
        complexity: 'medium',
        evidence: ['File upload library detected'],
      });
    }

    return features;
  }

  /**
   * Extract features using AI
   */
  private async extractWithAI(scan: ProjectScan, techStack: TechStack): Promise<DetectedFeature[]> {
    try {
      const prompt = this.buildAnalysisPrompt(scan, techStack);

      const response = await llmGateway.request({
        task_type: 'extraction',
        prompt,
        require_json: true,
      });

      const parsed = JSON.parse(response.content);
      return parsed.features || [];
    } catch (error) {
      console.error('AI feature extraction failed:', error);
      return [];
    }
  }

  /**
   * Build AI analysis prompt
   */
  private buildAnalysisPrompt(scan: ProjectScan, techStack: TechStack): string {
    const { projectInfo, fileStructure, dependencies, documentation } = scan;

    return `Analyze this codebase and extract all implemented features.

PROJECT: ${projectInfo.name}
DESCRIPTION: ${projectInfo.description}
TECH STACK: ${techStack.frontend.map(t => t.name).join(', ')} | ${techStack.backend.map(t => t.name).join(', ')}

FILE STRUCTURE (top-level):
${this.summarizeFileStructure(fileStructure)}

KEY DEPENDENCIES:
${dependencies.slice(0, 20).map(d => `- ${d.name}@${d.version}`).join('\n')}

README EXCERPT:
${documentation.readme?.substring(0, 500) || 'No README found'}

TASK:
Extract all features that are implemented in this codebase. For each feature:
1. Determine if it's completed, in_progress, or just planned
2. Provide confidence score (0-1)
3. List relevant code files
4. Categorize the feature

Return JSON:
{
  "features": [
    {
      "id": "unique-id",
      "name": "Feature Name",
      "description": "What this feature does",
      "status": "completed|in_progress|planned",
      "confidence": 0.95,
      "codeFiles": ["path/to/file"],
      "category": "authentication|api|ui|business-logic|integration|database|testing|infrastructure|other",
      "complexity": "low|medium|high",
      "evidence": ["Why we think this feature exists"]
    }
  ]
}`;
  }

  /**
   * Deduplicate features
   */
  private deduplicateFeatures(features: DetectedFeature[]): DetectedFeature[] {
    const seen = new Map<string, DetectedFeature>();

    for (const feature of features) {
      const key = feature.name.toLowerCase();
      const existing = seen.get(key);

      if (!existing || feature.confidence > existing.confidence) {
        seen.set(key, feature);
      }
    }

    return Array.from(seen.values());
  }

  // Helper methods

  private findFiles(node: any, keywords: string[]): string[] {
    const files: string[] = [];

    const search = (n: any) => {
      if (n.type === 'file') {
        const nameLower = n.name.toLowerCase();
        const pathLower = n.path.toLowerCase();
        if (keywords.some(kw => nameLower.includes(kw) || pathLower.includes(kw))) {
          files.push(n.path);
        }
      } else if (n.children) {
        n.children.forEach((child: any) => search(child));
      }
    };

    search(node);
    return files;
  }

  private summarizeFileStructure(node: any, depth: number = 0, maxDepth: number = 3): string {
    if (depth > maxDepth) return '';

    let result = '';
    const indent = '  '.repeat(depth);

    if (node.type === 'directory') {
      result += `${indent}${node.name}/\n`;
      if (node.children) {
        for (const child of node.children.slice(0, 10)) {
          result += this.summarizeFileStructure(child, depth + 1, maxDepth);
        }
        if (node.children.length > 10) {
          result += `${indent}  ... (${node.children.length - 10} more)\n`;
        }
      }
    } else {
      result += `${indent}${node.name}\n`;
    }

    return result;
  }
}

export const featureExtractor = new FeatureExtractor();
