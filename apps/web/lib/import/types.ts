/**
 * Project Import System - TypeScript Types
 */

// Import Methods
export type ImportMethod = 'local' | 'github' | 'zip' | 'git';

// Project Information
export interface ProjectInfo {
  name: string;
  description: string;
  path: string;
  techStack: string[];
  frameworks: string[];
  languages: string[];
  fileCount: number;
  linesOfCode: number;
  lastModified: Date;
  size: number; // in bytes
}

// File Structure
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  children?: FileNode[];
  ignored?: boolean;
}

// Dependencies
export interface Dependency {
  name: string;
  version: string;
  type: 'production' | 'development';
  source: 'npm' | 'pip' | 'gem' | 'go' | 'other';
}

// Git Information
export interface GitInfo {
  commits: number;
  contributors: string[];
  branches: string[];
  currentBranch: string;
  recentCommits: GitCommit[];
  remoteUrl?: string;
}

export interface GitCommit {
  hash: string;
  author: string;
  date: Date;
  message: string;
}

// Documentation
export interface Documentation {
  readme?: string;
  changelog?: string;
  contributing?: string;
  docs: DocumentFile[];
}

export interface DocumentFile {
  path: string;
  content: string;
  type: 'markdown' | 'text' | 'other';
}

// Project Scan Results
export interface ProjectScan {
  projectInfo: ProjectInfo;
  fileStructure: FileNode;
  dependencies: Dependency[];
  gitInfo?: GitInfo;
  documentation: Documentation;
  packageManagers: PackageManager[];
  configFiles: ConfigFile[];
}

export interface PackageManager {
  type: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'poetry' | 'go' | 'cargo';
  configFile: string;
  lockFile?: string;
}

export interface ConfigFile {
  type: string;
  path: string;
  content: any;
}

// Detected Features
export interface DetectedFeature {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in_progress' | 'planned';
  confidence: number; // 0-1
  codeFiles: string[];
  category: FeatureCategory;
  complexity: 'low' | 'medium' | 'high';
  evidence: string[];
}

export type FeatureCategory =
  | 'authentication'
  | 'authorization'
  | 'database'
  | 'api'
  | 'ui'
  | 'business-logic'
  | 'integration'
  | 'infrastructure'
  | 'testing'
  | 'other';

// Analysis Levels
export type AnalysisLevel = 'quick' | 'standard' | 'deep';

// Generated PRD
export interface GeneratedPRD {
  executiveSummary: string;
  problemStatement: string;
  targetAudience: string;
  valueProposition: string;
  features: PRDFeature[];
  technicalArchitecture: string;
  dataModel: string;
  apiEndpoints: APIEndpoint[];
  userFlows: UserFlow[];
}

export interface PRDFeature {
  id: string;
  name: string;
  description: string;
  userStory: string;
  acceptanceCriteria: string[];
  technicalNotes: string;
  dependencies: string[];
  status: 'completed' | 'in_progress' | 'planned';
  phase: 1 | 2 | 3 | 4;
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestBody?: any;
  responseBody?: any;
  authentication: boolean;
}

export interface UserFlow {
  name: string;
  steps: string[];
  screens: string[];
}

// Feature Mapping
export interface FeatureMapping {
  featureId: string;
  name: string;
  status: 'completed' | 'in_progress' | 'planned';
  codeFiles: string[];
  confidence: number;
  userOverride?: boolean;
}

// Import Request
export interface ImportRequest {
  method: ImportMethod;
  path?: string;
  repoUrl?: string;
  branch?: string;
  uploadId?: string;
  analysisLevel?: AnalysisLevel;
}

// Import Result
export interface ImportResult {
  projectId: string;
  projectName: string;
  featuresImported: number;
  prdSectionsCreated: number;
  registryPopulated: boolean;
  completedFeatures: number;
  inProgressFeatures: number;
  plannedFeatures: number;
}

// Analysis Progress
export interface AnalysisProgress {
  stage: 'scanning' | 'analyzing' | 'generating' | 'complete';
  progress: number; // 0-100
  currentFile?: string;
  filesScanned?: number;
  totalFiles?: number;
  message?: string;
}

// Tech Stack Detection
export interface TechStack {
  frontend: Technology[];
  backend: Technology[];
  database: Technology[];
  infrastructure: Technology[];
  tools: Technology[];
}

export interface Technology {
  name: string;
  version?: string;
  category: string;
  confidence: number;
  evidence: string[];
}

// Analysis Context
export interface AnalysisContext {
  scan: ProjectScan;
  detectedFeatures: DetectedFeature[];
  techStack: TechStack;
  codePatterns: CodePattern[];
}

export interface CodePattern {
  type: string;
  pattern: string;
  occurrences: number;
  files: string[];
  description: string;
}

// Import State
export interface ImportState {
  step: 1 | 2 | 3 | 4 | 5;
  importRequest?: ImportRequest;
  scanResults?: ProjectScan;
  analysisResults?: {
    detectedFeatures: DetectedFeature[];
    generatedPRD: GeneratedPRD;
    techStack: TechStack;
  };
  featureMapping?: FeatureMapping[];
  userEdits?: any;
  isProcessing: boolean;
  error?: string;
}
