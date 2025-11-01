# Project Migration Feature - Design Specification

## Overview

Allow users to import existing projects into BuildRunner SaaS by analyzing their codebase, generating a PRD from existing code, and populating the feature registry with what's already built.

## User Flow

```
1. User clicks "Import Existing Project"
   ↓
2. Choose import method:
   - Local directory picker
   - GitHub repository URL
   - Zip file upload
   ↓
3. Project analysis begins:
   - Scan file structure
   - Analyze code and dependencies
   - Parse documentation
   - Review git history
   ↓
4. AI generates PRD from code:
   - Extracts existing features
   - Identifies tech stack
   - Documents functionality
   - Creates user stories
   ↓
5. User reviews and edits generated PRD
   ↓
6. Import confirmed:
   - Creates project in BuildRunner
   - Populates feature registry
   - Marks existing features as "completed"
   - Sets up orchestration for future work
   ↓
7. User can continue building from where they left off
```

## Features to Build

### 1. Project Import Wizard Component

**Location**: `components/import/ProjectImportWizard.tsx`

**Steps**:
1. **Import Method Selection**
   - Local directory (read-only analysis)
   - GitHub repository (clone or analyze via API)
   - Zip file upload
   - Git URL (any Git provider)

2. **Project Scanning**
   - Display progress (files scanned, analyzing...)
   - Show project structure tree
   - List detected technologies
   - Show estimated completion time

3. **PRD Generation Preview**
   - Show AI-generated PRD
   - Allow inline editing
   - Suggest features based on code
   - Map code files to features

4. **Feature Mapping**
   - List all detected features
   - Mark as "Completed", "In Progress", or "Planned"
   - Link code files to features
   - Add missing features manually

5. **Import Confirmation**
   - Review summary
   - Confirm import
   - Track import progress

### 2. Backend API Routes

#### **POST /api/import/scan**
Scan a project directory or repository

**Input**:
```typescript
{
  method: 'local' | 'github' | 'zip' | 'git',
  path?: string,           // Local directory path
  repoUrl?: string,        // GitHub/Git URL
  branch?: string,         // Git branch
  uploadId?: string,       // For zip uploads
}
```

**Output**:
```typescript
{
  projectInfo: {
    name: string,
    description: string,
    techStack: string[],
    fileCount: number,
    linesOfCode: number,
    lastModified: Date,
  },
  fileStructure: FileNode[],
  dependencies: Dependency[],
  detectedFeatures: Feature[],
  documentation: {
    readme: string,
    docs: DocumentFile[],
  },
  gitInfo?: {
    commits: number,
    contributors: string[],
    recentActivity: Commit[],
  }
}
```

#### **POST /api/import/analyze**
Deep analysis using AI to understand codebase

**Input**:
```typescript
{
  scanResults: ScanResults,
  analysisLevel: 'quick' | 'standard' | 'deep',
}
```

**Output**:
```typescript
{
  generatedPRD: {
    executiveSummary: string,
    problemStatement: string,
    targetAudience: string,
    valueProposition: string,
    features: Feature[],
    technicalArchitecture: string,
    dataModel: string,
  },
  featureMapping: {
    featureId: string,
    name: string,
    status: 'completed' | 'in_progress' | 'planned',
    codeFiles: string[],
    confidence: number,
  }[],
  recommendations: string[],
}
```

#### **POST /api/import/execute**
Execute the import and populate BuildRunner

**Input**:
```typescript
{
  scanResults: ScanResults,
  generatedPRD: GeneratedPRD,
  featureMapping: FeatureMapping[],
  userEdits: any,
}
```

**Output**:
```typescript
{
  projectId: string,
  featuresImported: number,
  prdSectionsCreated: number,
  registryPopulated: boolean,
}
```

### 3. Code Analysis Engine

**Location**: `lib/import/code-analyzer.ts`

**Capabilities**:

```typescript
class CodeAnalyzer {
  // Scan project structure
  async scanProject(path: string): Promise<ProjectScan> {
    // Read file system
    // Detect tech stack (package.json, requirements.txt, etc.)
    // Count files, lines of code
    // Parse git history
    // Read documentation
  }

  // Extract features from code
  async extractFeatures(scan: ProjectScan): Promise<Feature[]> {
    // Analyze file structure (routes/, components/, models/)
    // Parse API endpoints
    // Identify database models
    // Find UI components
    // Detect business logic
    // Use AI to understand feature boundaries
  }

  // Generate PRD from code
  async generatePRD(features: Feature[], scan: ProjectScan): Promise<PRD> {
    // Use Claude Opus 4 for comprehensive analysis
    // Understand what the app does
    // Extract user stories from code
    // Document existing functionality
    // Identify gaps and next steps
  }

  // Map code files to features
  async mapCodeToFeatures(scan: ProjectScan, features: Feature[]): Promise<Mapping[]> {
    // Analyze imports and dependencies
    // Group related files
    // Link to feature definitions
  }
}
```

### 4. Tech Stack Detection

**Detect and Extract**:

- **JavaScript/TypeScript**:
  - Parse `package.json`
  - Detect framework (React, Next.js, Vue, Angular)
  - Identify libraries and dependencies
  - Parse `tsconfig.json` for project structure

- **Python**:
  - Parse `requirements.txt`, `pyproject.toml`, `Pipfile`
  - Detect framework (Django, Flask, FastAPI)
  - Identify dependencies

- **Backend**:
  - Detect API routes
  - Parse database schemas
  - Identify authentication methods
  - Find middleware and services

- **Frontend**:
  - Identify components
  - Parse routing structure
  - Find state management (Redux, Zustand, Context)
  - Detect UI libraries (Tailwind, Material-UI, etc.)

- **Database**:
  - Parse schema files
  - Detect ORM (Prisma, SQLAlchemy, Mongoose)
  - Find migrations
  - Extract models and relationships

- **Infrastructure**:
  - Parse `Dockerfile`, `docker-compose.yml`
  - Find deployment configs (Vercel, Netlify, AWS)
  - Identify CI/CD (GitHub Actions, CircleCI)

### 5. AI-Powered Code Understanding

**Use Multi-LLM System**:

1. **Claude Opus 4** (Reasoning):
   - Understand overall project architecture
   - Identify main features and functionality
   - Generate executive summary

2. **Claude Sonnet 3.5** (Code Analysis):
   - Analyze code structure
   - Extract features from implementation
   - Map relationships between files

3. **GPT-4** (Documentation):
   - Parse existing docs
   - Generate missing documentation
   - Create user stories from code

4. **DeepSeek** (Code Understanding):
   - Analyze code patterns
   - Identify best practices
   - Suggest improvements

**Prompt Strategy**:

```typescript
const analysisPrompt = `
Analyze this codebase and generate a comprehensive Product Requirements Document.

PROJECT INFO:
- Name: ${projectName}
- Tech Stack: ${techStack.join(', ')}
- Files: ${fileCount}
- Dependencies: ${dependencies.length}

FILE STRUCTURE:
${fileStructure}

KEY FILES CONTENT:
${mainFiles}

EXISTING DOCUMENTATION:
${readme}

TASK:
1. Understand what this application does
2. Identify all major features
3. Extract user stories from the code
4. Generate a PRD with:
   - Executive Summary
   - Problem Statement
   - Target Audience
   - Value Proposition
   - Feature List (with implementation status)
   - Technical Architecture
   - Data Models

Format as JSON following this schema...
`;
```

## UI Components

### 1. Import Button in Header

```tsx
<button
  onClick={() => setShowImportWizard(true)}
  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
>
  <ArrowDownTrayIcon className="h-4 w-4 inline mr-2" />
  Import Project
</button>
```

### 2. Project Import Wizard Modal

**Step 1: Choose Import Method**

```tsx
<ImportMethodSelector
  onSelect={(method) => {
    if (method === 'local') {
      // Show directory picker
    } else if (method === 'github') {
      // Show GitHub URL input
    } else if (method === 'zip') {
      // Show file upload
    }
  }}
/>
```

**Step 2: Scanning Progress**

```tsx
<ScanningProgress
  status="analyzing"
  progress={45}
  currentFile="/src/components/Dashboard.tsx"
  filesScanned={123}
  totalFiles={274}
/>
```

**Step 3: PRD Preview & Editing**

```tsx
<PRDPreview
  generatedPRD={prd}
  onEdit={(section, content) => updatePRD(section, content)}
  detectedFeatures={features}
/>
```

**Step 4: Feature Mapping**

```tsx
<FeatureMappingTable
  features={detectedFeatures}
  onUpdateStatus={(featureId, status) => updateFeatureStatus(featureId, status)}
  onLinkFiles={(featureId, files) => linkFilesToFeature(featureId, files)}
/>
```

**Step 5: Import Confirmation**

```tsx
<ImportSummary
  project={projectInfo}
  featuresCount={features.length}
  completedCount={completedFeatures.length}
  onConfirm={() => executeImport()}
/>
```

## Example: Importing a Next.js Project

### Input
```
/Users/user/Projects/MyApp/
├── package.json
├── README.md
├── app/
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── users/
│   │       └── posts/
├── components/
│   ├── Dashboard.tsx
│   ├── Sidebar.tsx
│   └── UserProfile.tsx
├── lib/
│   ├── auth.ts
│   └── db.ts
└── prisma/
    └── schema.prisma
```

### Analysis Output

**Detected Features**:
1. ✅ User Authentication (Completed)
   - Files: `lib/auth.ts`, `app/api/auth/`, `components/LoginForm.tsx`
   - Status: Implemented and working

2. ✅ User Dashboard (Completed)
   - Files: `app/(app)/dashboard/`, `components/Dashboard.tsx`
   - Status: Implemented and working

3. ✅ Settings Management (Completed)
   - Files: `app/(app)/settings/`, `components/Settings.tsx`
   - Status: Implemented and working

4. 🟡 Posts Management (In Progress)
   - Files: `app/api/posts/`, `components/PostList.tsx`
   - Status: API complete, UI partial

5. ⭐ Analytics Dashboard (Planned)
   - Files: None yet
   - Status: Mentioned in README but not implemented

**Generated PRD**:

```markdown
# Executive Summary
MyApp is a user management platform with dashboard functionality...

# Problem Statement
Users need a centralized platform to manage their profiles and content...

# Features
## 1. User Authentication
- User registration with email verification
- Login/logout functionality
- Password reset
- Session management
**Status**: ✅ Completed (Implemented in v1.0)

## 2. User Dashboard
- Overview of user activity
- Quick actions panel
- Recent updates feed
**Status**: ✅ Completed (Implemented in v1.0)

...
```

### Result in BuildRunner

**Feature Registry**:
- 3 features marked as "completed"
- 1 feature marked as "in_progress"
- 1 feature marked as "planned"

**PRD Sections**:
- All phases populated based on existing code
- Phase 1 (Context): Complete
- Phase 2 (Shape): Complete
- Phase 3 (Evidence): Partial (needs metrics)
- Phase 4 (Launch): Planned

**Orchestration**:
- Start building from "Analytics Dashboard" feature
- Agents can reference existing code patterns
- Continue where developers left off

## Implementation Plan

### Phase 1: Basic Import (Week 1)
- [ ] Import wizard UI component
- [ ] Local directory scanning
- [ ] Basic file structure analysis
- [ ] Simple PRD generation

### Phase 2: AI Analysis (Week 2)
- [ ] Integrate with Claude Opus 4
- [ ] Deep code analysis
- [ ] Feature extraction from code
- [ ] Tech stack detection

### Phase 3: Feature Mapping (Week 3)
- [ ] Feature mapping UI
- [ ] Code-to-feature linking
- [ ] Status management
- [ ] Import execution

### Phase 4: Advanced Features (Week 4)
- [ ] GitHub integration
- [ ] Git history analysis
- [ ] Multiple import methods
- [ ] Export and re-import

## Benefits

### For Users
✅ **Fast Onboarding**: Import existing project in minutes
✅ **No Manual Work**: AI generates PRD automatically
✅ **Continue Building**: Start where you left off
✅ **Preserve History**: Git history and context maintained
✅ **Multi-Project**: Import multiple projects easily

### For BuildRunner
✅ **User Adoption**: Lower barrier to entry
✅ **Data Quality**: Real codebases provide better training data
✅ **Use Cases**: Learn from existing projects
✅ **Retention**: Users more likely to stay if projects imported

## Technical Considerations

### Security
- ⚠️ Never upload actual code to cloud (analyze locally)
- ⚠️ Only send file structure and metadata to AI
- ⚠️ Respect `.gitignore` and `.buildrunnierignore`
- ⚠️ Sanitize sensitive data (API keys, passwords)

### Performance
- 🚀 Stream analysis progress to UI
- 🚀 Parallelize file scanning
- 🚀 Cache analysis results
- 🚀 Batch API calls to LLMs

### Compatibility
- ✅ Support major frameworks (React, Next.js, Vue, Angular)
- ✅ Support multiple languages (JS, TS, Python, Go)
- ✅ Detect various architectures (monorepo, microservices)
- ✅ Parse different config formats (JSON, YAML, TOML)

## Example: Quick Import Flow

```typescript
// 1. User clicks Import
const project = await importWizard.selectProject();

// 2. Scan project
const scan = await codeAnalyzer.scanProject(project.path);

// 3. Generate PRD with AI
const prd = await codeAnalyzer.generatePRD(scan);

// 4. User reviews and edits
const editedPRD = await showPRDEditor(prd);

// 5. Execute import
const result = await executeImport({
  project: scan,
  prd: editedPRD,
  featureMapping: scan.features,
});

// 6. Navigate to project
router.push(`/projects/${result.projectId}`);
```

## Mockup: Import Wizard UI

```
┌─────────────────────────────────────────────────────────────────┐
│  Import Existing Project                                    [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1 of 5: Choose Import Method                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  📁 Local    │  │  🔗 GitHub   │  │  📦 Upload   │         │
│  │  Directory   │  │  Repository  │  │  Zip File    │         │
│  │              │  │              │  │              │         │
│  │  Browse your │  │  Import from │  │  Upload a    │         │
│  │  computer    │  │  GitHub URL  │  │  zip file    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Selected: /Users/user/Projects/MyApp                    │  │
│  │  [Browse...]                                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [ Cancel ]                                   [ Next: Scan → ]  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Scanning Project...                                        [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 2 of 5: Analyzing Codebase                              │
│                                                                  │
│  🔍 Scanning files: 274 / 274                                  │
│  📊 Analyzing structure...                                      │
│  🤖 AI understanding code...                                    │
│                                                                  │
│  [████████████████████████████████████] 100%                    │
│                                                                  │
│  ✅ Detected Tech Stack:                                       │
│     • Next.js 14.0.0                                           │
│     • TypeScript 5.2.2                                         │
│     • React 18.2.0                                             │
│     • Prisma ORM                                               │
│     • Tailwind CSS                                             │
│                                                                  │
│  ✅ Found 5 features                                           │
│  ✅ Read 1 README file                                         │
│  ✅ Analyzed 125 components                                    │
│                                                                  │
│                                           [ Next: Review PRD → ] │
└─────────────────────────────────────────────────────────────────┘
```

## Next Steps

Would you like me to:

1. **Build the Import Wizard UI** - Complete React component with all steps
2. **Implement Code Analyzer** - Backend service to scan and analyze projects
3. **Create API Routes** - `/api/import/*` endpoints
4. **Add to Main App** - Integrate into existing BuildRunner UI

This would be a game-changer feature for user onboarding! 🚀
