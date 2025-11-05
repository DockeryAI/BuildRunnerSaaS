# Intelligent Design System: Self-Learning Design Profile Engine

## The Vision

Build a system that:
1. **Auto-detects** app characteristics (not just industry)
2. **Builds profiles** on-the-fly for new app types
3. **Learns continuously** from user feedback and interactions
4. **Improves automatically** with every build
5. **Manages profiles** through an admin interface

---

## Core Problem: Industry is Too Limiting

### Current Limitation:
```
App → Industry (nutrition) → Preset colors/fonts → Done
```

### Why This Fails:
- **Too broad**: "Social media" covers Instagram (photos) AND LinkedIn (professional)
- **Too rigid**: Fitness tracker for kids needs different design than one for athletes
- **Misses nuance**: Luxury travel app vs budget backpacking app
- **Can't adapt**: New app types (AI companion, crypto wallet) have no preset

---

## The New Approach: Multi-Dimensional Design Profiling

Instead of just "industry," detect **multiple characteristics**:

### Design Dimensions to Detect:

```typescript
interface DesignProfile {
  // WHAT (Primary Purpose)
  primaryPurpose: 'productivity' | 'entertainment' | 'commerce' | 'social' | 'utility' | 'health';
  
  // WHO (Target Audience)
  audience: {
    demographic: 'children' | 'teens' | 'adults' | 'seniors' | 'professionals' | 'general';
    techLevel: 'beginner' | 'intermediate' | 'advanced';
    economicLevel: 'budget' | 'mid-market' | 'premium' | 'luxury';
  };
  
  // HOW (Usage Pattern)
  usagePattern: {
    frequency: 'daily' | 'weekly' | 'occasional' | 'one-time';
    duration: 'quick-tasks' | 'extended-sessions';
    context: 'mobile-first' | 'desktop-primary' | 'cross-device';
  };
  
  // FEEL (Emotional Tone)
  emotionalTone: {
    energy: 'calm' | 'neutral' | 'energetic' | 'intense';
    formality: 'casual' | 'professional' | 'formal';
    personality: 'playful' | 'serious' | 'aspirational' | 'trustworthy' | 'innovative';
  };
  
  // INDUSTRY (Context)
  industry: {
    primary: string; // 'healthcare', 'finance', 'education', etc.
    vertical: string; // 'telemedicine', 'investment', 'k-12', etc.
    niche: string; // 'pediatric urgent care', 'robo-advisor', 'homeschool', etc.
  };
  
  // STYLE (Visual Language)
  visualStyle: {
    aesthetic: 'minimal' | 'bold' | 'playful' | 'elegant' | 'technical' | 'organic';
    modernity: 'classic' | 'contemporary' | 'cutting-edge';
    density: 'spacious' | 'balanced' | 'compact';
  };
}
```

---

## System Architecture

### 1. Design Intelligence Engine

**NEW FILE**: `apps/web/lib/design-intelligence/profile-detector.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { createEmbedding } from './embeddings';
import { vectorDB } from './vector-store';

export class DesignProfileDetector {
  private anthropic: Anthropic;
  private profileCache: Map<string, DesignProfile>;
  
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
    this.profileCache = new Map();
  }

  /**
   * Core method: Analyze PRD and detect all design dimensions
   */
  async detectProfile(prd: {
    projectName: string;
    description: string;
    features: string[];
    targetUsers?: string;
  }): Promise<DesignProfile> {
    
    // STEP 1: Check if we've seen something similar before
    const similarProfile = await this.findSimilarProfile(prd);
    if (similarProfile && similarProfile.confidence > 0.85) {
      console.log(`✅ Found similar profile: ${similarProfile.name}`);
      return similarProfile.profile;
    }
    
    // STEP 2: Deep analysis with Claude
    const profile = await this.analyzeWithClaude(prd);
    
    // STEP 3: Enrich with reference apps
    const enriched = await this.enrichWithReferences(profile);
    
    // STEP 4: Save for future learning
    await this.saveProfile(prd, enriched);
    
    return enriched;
  }

  private async analyzeWithClaude(prd: any): Promise<DesignProfile> {
    const prompt = `You are a world-class product designer and UX researcher.

Analyze this app concept and detect ALL design-relevant characteristics:

APP DETAILS:
Name: ${prd.projectName}
Description: ${prd.description}
Features: ${prd.features?.join(', ') || 'Not specified'}
Target Users: ${prd.targetUsers || 'Not specified'}

YOUR TASK: Multi-dimensional analysis

1. PRIMARY PURPOSE
What's the core function? (productivity, entertainment, commerce, social, utility, health, education, finance)

2. TARGET AUDIENCE
- Demographics: Who uses this? (children, teens, adults, seniors, professionals)
- Tech level: (beginner, intermediate, advanced)
- Economic level: (budget, mid-market, premium, luxury)

3. USAGE PATTERN
- Frequency: How often? (daily, weekly, occasional, one-time)
- Duration: How long per session? (quick-tasks, extended-sessions)
- Context: Where? (mobile-first, desktop-primary, cross-device)

4. EMOTIONAL TONE
- Energy level: (calm, neutral, energetic, intense)
- Formality: (casual, professional, formal)
- Personality: (playful, serious, aspirational, trustworthy, innovative)

5. INDUSTRY CLASSIFICATION
- Primary industry: (healthcare, finance, travel, etc.)
- Vertical/sub-category
- Niche if applicable

6. VISUAL STYLE
- Aesthetic: (minimal, bold, playful, elegant, technical, organic)
- Modernity: (classic, contemporary, cutting-edge)
- Density: (spacious, balanced, compact)

7. REFERENCE APPS (3-5 apps)
Find real successful apps with SIMILAR:
- Purpose
- Audience
- Emotional tone
- Visual style

Don't just match industry - match the FEEL and USE CASE.

Examples:
- "Fitness tracker for seniors" → Reference apps with senior-friendly UX (NOT just fitness apps)
- "Luxury travel planner" → Reference apps with premium feel (NOT all travel apps)
- "Kids educational game" → Reference playful, colorful apps (NOT corporate education)

8. COLOR PSYCHOLOGY
Based on ALL the above dimensions, suggest:
- Primary color (hex + reasoning)
- Secondary color (hex + reasoning)
- Accent color (hex + reasoning)
- Background palette
- Emotional impact of these choices

9. TYPOGRAPHY STRATEGY
- Font personality (modern, classic, playful, technical)
- Specific font recommendations
- Scale and hierarchy approach

10. COMPONENT PATTERNS
- Card style (minimal, detailed, image-heavy)
- Button style (bold, subtle, playful)
- Navigation (bottom tabs, sidebar, top nav)
- Content density

Return detailed JSON following the DesignProfile interface.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  private async findSimilarProfile(prd: any): Promise<{
    profile: DesignProfile;
    name: string;
    confidence: number;
  } | null> {
    // Create embedding of this PRD
    const prdText = `${prd.projectName} ${prd.description} ${prd.features?.join(' ')}`;
    const embedding = await createEmbedding(prdText);
    
    // Search vector DB for similar apps
    const similar = await vectorDB.query({
      vector: embedding,
      topK: 3,
      includeMetadata: true
    });
    
    if (similar.matches.length === 0) return null;
    
    const best = similar.matches[0];
    if (best.score < 0.85) return null; // Not similar enough
    
    return {
      profile: best.metadata.designProfile,
      name: best.metadata.appName,
      confidence: best.score
    };
  }

  private async enrichWithReferences(profile: DesignProfile): Promise<DesignProfile> {
    // Get detailed design specs from reference apps
    const enrichedRefs = await Promise.all(
      profile.referenceApps.map(async (app) => {
        return await this.analyzeReferenceApp(app);
      })
    );
    
    return {
      ...profile,
      referenceAppDetails: enrichedRefs
    };
  }

  private async analyzeReferenceApp(appName: string) {
    const prompt = `Analyze the design of ${appName}.

Extract:
1. Exact color palette (hex codes)
2. Typography choices (font families, weights, scales)
3. Spacing system (padding, margins, gaps)
4. Component styles (buttons, cards, forms)
5. Micro-interactions (hover, transitions, animations)
6. Layout patterns (grid, flexbox, spacing)
7. Visual hierarchy approach
8. Dark mode implementation

Return detailed design specs.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.5,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  private async saveProfile(prd: any, profile: DesignProfile) {
    // Save to database
    await db.designProfiles.create({
      data: {
        appName: prd.projectName,
        prdSummary: prd.description,
        profile: profile,
        embedding: await createEmbedding(`${prd.projectName} ${prd.description}`),
        successScore: 0, // Will be updated based on user feedback
        usageCount: 1,
        createdAt: new Date()
      }
    });
    
    // Add to vector DB for similarity search
    await vectorDB.upsert({
      id: `profile-${prd.projectName}`,
      values: await createEmbedding(`${prd.projectName} ${prd.description}`),
      metadata: {
        appName: prd.projectName,
        designProfile: profile
      }
    });
  }
}
```

---

### 2. Learning System

**NEW FILE**: `apps/web/lib/design-intelligence/learning-engine.ts`

```typescript
export class DesignLearningEngine {
  /**
   * Learn from user feedback on designs
   */
  async learnFromFeedback(feedback: {
    projectId: string;
    profileId: string;
    userRating: number; // 1-10
    changes: string[]; // What did user modify?
    kept: string[]; // What did user keep?
    timeToFirstEdit: number; // How long before first change?
  }) {
    
    // STEP 1: Update profile success score
    await this.updateProfileScore(feedback.profileId, feedback.userRating);
    
    // STEP 2: Analyze what worked and what didn't
    const insights = await this.analyzeUserBehavior(feedback);
    
    // STEP 3: Update profile with learnings
    await this.refineProfile(feedback.profileId, insights);
    
    // STEP 4: Create micro-variants for A/B testing
    await this.createVariants(feedback.profileId, insights);
  }

  private async analyzeUserBehavior(feedback: any) {
    const prompt = `Analyze user behavior to improve design profiles.

USER FEEDBACK:
Rating: ${feedback.userRating}/10
Time to first edit: ${feedback.timeToFirstEdit}s
User changed: ${feedback.changes.join(', ')}
User kept: ${feedback.kept.join(', ')}

INSIGHTS NEEDED:
1. What design elements worked well? (kept items)
2. What elements failed? (changed items)
3. Why did they change these specific things?
4. What does the edit speed tell us? (fast edit = bad defaults)
5. What patterns emerge across similar feedback?
6. How should we adjust the profile?

Return actionable insights.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.5,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  private async refineProfile(profileId: string, insights: any) {
    // Get current profile
    const profile = await db.designProfiles.findUnique({
      where: { id: profileId }
    });
    
    // Apply refinements
    const refined = {
      ...profile.profile,
      // Adjust based on insights
      colorScheme: insights.colorAdjustments ? 
        { ...profile.profile.colorScheme, ...insights.colorAdjustments } :
        profile.profile.colorScheme,
      
      // Update confidence scores
      confidence: {
        colors: this.updateConfidence(profile.confidence?.colors, insights.colorSuccess),
        typography: this.updateConfidence(profile.confidence?.typography, insights.typographySuccess),
        layout: this.updateConfidence(profile.confidence?.layout, insights.layoutSuccess),
      }
    };
    
    // Save refined version
    await db.designProfiles.update({
      where: { id: profileId },
      data: {
        profile: refined,
        version: profile.version + 1,
        lastRefinedAt: new Date()
      }
    });
  }

  /**
   * Track design element performance across all builds
   */
  async trackDesignMetrics() {
    const metrics = await db.designProfiles.aggregate({
      groupBy: ['profile.primaryPurpose', 'profile.audience.demographic'],
      avg: {
        successScore: true,
        userRating: true
      },
      count: true
    });
    
    // Identify top-performing patterns
    const bestPatterns = metrics
      .filter(m => m.avg.userRating > 8)
      .sort((a, b) => b.avg.userRating - a.avg.userRating);
    
    // Update system defaults
    await this.updateSystemDefaults(bestPatterns);
  }
}
```

---

### 3. Profile Management Dashboard

**NEW FILE**: `apps/web/app/(app)/admin/design-profiles/page.tsx`

```typescript
export default function DesignProfilesPage() {
  const [profiles, setProfiles] = useState<DesignProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Design Profile Management</h1>
        <button onClick={createNewProfile}>+ New Profile</button>
      </div>

      {/* Profile Library */}
      <div className="grid grid-cols-3 gap-6">
        {profiles.map(profile => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onClick={() => setSelectedProfile(profile.id)}
          />
        ))}
      </div>

      {/* Profile Editor */}
      {selectedProfile && (
        <ProfileEditor
          profileId={selectedProfile}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {/* Analytics */}
      <DesignAnalytics />
    </div>
  );
}

function ProfileCard({ profile, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-6 border rounded-lg hover:shadow-lg cursor-pointer"
    >
      {/* Preview of colors */}
      <div className="flex gap-2 mb-4">
        <div
          className="w-12 h-12 rounded"
          style={{ backgroundColor: profile.colorScheme.primary }}
        />
        <div
          className="w-12 h-12 rounded"
          style={{ backgroundColor: profile.colorScheme.secondary }}
        />
        <div
          className="w-12 h-12 rounded"
          style={{ backgroundColor: profile.colorScheme.accent }}
        />
      </div>

      <h3 className="font-semibold mb-2">{profile.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{profile.description}</p>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Success Rate</div>
          <div className="font-semibold">{profile.successScore}%</div>
        </div>
        <div>
          <div className="text-gray-500">Uses</div>
          <div className="font-semibold">{profile.usageCount}</div>
        </div>
        <div>
          <div className="text-gray-500">Avg Rating</div>
          <div className="font-semibold">{profile.avgRating}/10</div>
        </div>
        <div>
          <div className="text-gray-500">Last Used</div>
          <div className="font-semibold">{formatDate(profile.lastUsed)}</div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
          {profile.primaryPurpose}
        </span>
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
          {profile.audience.demographic}
        </span>
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
          {profile.emotionalTone.personality}
        </span>
      </div>
    </div>
  );
}

function DesignAnalytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Design Performance Analytics</h2>

      {/* Top Performing Profiles */}
      <div className="p-6 border rounded-lg">
        <h3 className="font-semibold mb-4">Top Performing Profiles</h3>
        <ProfileRankingTable />
      </div>

      {/* Color Performance */}
      <div className="p-6 border rounded-lg">
        <h3 className="font-semibold mb-4">Color Scheme Performance</h3>
        <ColorAnalytics />
      </div>

      {/* Reference App Success */}
      <div className="p-6 border rounded-lg">
        <h3 className="font-semibold mb-4">Reference App Effectiveness</h3>
        <ReferenceAppMetrics />
      </div>

      {/* User Behavior Insights */}
      <div className="p-6 border rounded-lg">
        <h3 className="font-semibold mb-4">User Modification Patterns</h3>
        <UserBehaviorInsights />
      </div>
    </div>
  );
}
```

---

### 4. Continuous Learning Pipeline

**NEW FILE**: `apps/web/lib/design-intelligence/continuous-learning.ts`

```typescript
export class ContinuousLearningPipeline {
  /**
   * Run nightly to improve design profiles
   */
  async runNightlyAnalysis() {
    console.log('🧠 Starting design learning pipeline...');

    // STEP 1: Analyze yesterday's builds
    const recentBuilds = await this.getRecentBuilds(24); // Last 24 hours
    
    // STEP 2: Identify patterns in user modifications
    const modificationPatterns = await this.analyzeModifications(recentBuilds);
    
    // STEP 3: Update profiles based on learnings
    await this.applyLearnings(modificationPatterns);
    
    // STEP 4: A/B test new variants
    await this.createABTestVariants();
    
    // STEP 5: Prune low-performing profiles
    await this.pruneProfiles();
    
    console.log('✅ Design learning complete');
  }

  private async analyzeModifications(builds: Build[]) {
    // Group by profile type
    const grouped = builds.reduce((acc, build) => {
      const key = build.designProfile.primaryPurpose;
      if (!acc[key]) acc[key] = [];
      acc[key].push(build);
      return acc;
    }, {});

    const insights = {};

    for (const [purpose, purposeBuilds] of Object.entries(grouped)) {
      // What did users change most?
      const changes = purposeBuilds.flatMap(b => b.userModifications);
      const changeFrequency = this.countFrequency(changes);
      
      // What got highest ratings?
      const highRatedBuilds = purposeBuilds.filter(b => b.rating >= 8);
      const commonTraits = this.findCommonTraits(highRatedBuilds);
      
      insights[purpose] = {
        mostChangedElements: changeFrequency.slice(0, 5),
        successfulPatterns: commonTraits,
        avgRating: this.average(purposeBuilds.map(b => b.rating)),
        buildCount: purposeBuilds.length
      };
    }

    return insights;
  }

  private async applyLearnings(insights: any) {
    for (const [purpose, data] of Object.entries(insights)) {
      // Find profiles for this purpose
      const profiles = await db.designProfiles.findMany({
        where: { 'profile.primaryPurpose': purpose }
      });

      for (const profile of profiles) {
        // If users consistently change something, update the default
        if (data.mostChangedElements.length > 0) {
          await this.updateProfileDefaults(profile.id, data.mostChangedElements);
        }

        // Incorporate successful patterns
        if (data.successfulPatterns.length > 0) {
          await this.mergeSuccessfulPatterns(profile.id, data.successfulPatterns);
        }
      }
    }
  }

  /**
   * Detect entirely new app types we haven't seen before
   */
  async detectNewAppType(prd: any) {
    // Check if this is genuinely new
    const existing = await vectorDB.query({
      vector: await createEmbedding(prd.description),
      topK: 5
    });

    // If nothing similar exists (score < 0.7), it's a new type
    if (!existing.matches || existing.matches[0]?.score < 0.7) {
      console.log('🆕 Detected new app type!');
      
      // Create new profile from scratch
      const newProfile = await this.createNewProfileType(prd);
      
      // Alert admin for review
      await this.alertAdminNewProfile(newProfile);
      
      return newProfile;
    }

    return null;
  }

  private async createNewProfileType(prd: any) {
    const prompt = `You've encountered a COMPLETELY NEW type of app we've never seen before.

APP: ${prd.projectName}
DESCRIPTION: ${prd.description}

This doesn't fit our existing profiles. Create a brand new design profile.

1. Analyze what makes this unique
2. Research similar successful apps (if any exist)
3. Create design principles for this new category
4. Define color psychology for this use case
5. Suggest typography and component patterns
6. Name this new app category

Return a complete new DesignProfile.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      temperature: 0.8, // Higher for creative new profiles
      messages: [{ role: 'user', content: prompt }]
    });

    const newProfile = JSON.parse(response.content[0].text);
    
    // Save as new profile type
    await db.designProfiles.create({
      data: {
        ...newProfile,
        isNewType: true,
        needsReview: true,
        confidence: 0.5 // Start with low confidence
      }
    });

    return newProfile;
  }
}
```

---

### 5. Integration with Build Flow

**MODIFY**: `apps/web/lib/build-orchestrator.ts`

```typescript
export class BuildOrchestrator {
  private profileDetector: DesignProfileDetector;
  private learningEngine: DesignLearningEngine;
  
  async buildProject(prd: PRD): Promise<BuildResult> {
    // STEP 1: Detect design profile (multi-dimensional)
    console.log('🔍 Analyzing app characteristics...');
    const profile = await this.profileDetector.detectProfile({
      projectName: prd.projectName,
      description: prd.description,
      features: prd.features,
      targetUsers: prd.targetUsers
    });
    
    console.log(`✨ Profile detected:`);
    console.log(`  Purpose: ${profile.primaryPurpose}`);
    console.log(`  Audience: ${profile.audience.demographic} (${profile.audience.techLevel})`);
    console.log(`  Feel: ${profile.emotionalTone.personality}, ${profile.emotionalTone.energy}`);
    console.log(`  References: ${profile.referenceApps.join(', ')}`);
    
    // STEP 2: Generate design system from profile
    const designSystem = await this.generateDesignSystem(profile);
    
    // STEP 3: Build components with design context
    const components = await this.buildComponents(prd, designSystem, profile);
    
    // STEP 4: Track for learning
    await this.trackBuild(prd.id, profile.id, designSystem);
    
    return {
      components,
      designSystem,
      profile,
      profileId: profile.id
    };
  }

  async handleUserFeedback(buildId: string, feedback: UserFeedback) {
    // Learn from user modifications
    await this.learningEngine.learnFromFeedback({
      projectId: buildId,
      profileId: feedback.profileId,
      userRating: feedback.rating,
      changes: feedback.modifications.map(m => m.element),
      kept: feedback.keptElements,
      timeToFirstEdit: feedback.timeToFirstEdit
    });
  }
}
```

---

## Expected Behavior

### Example 1: Kids Educational Game

**Input:**
```
Name: "Math Quest Adventures"
Description: "Fun math game for 6-10 year olds with colorful characters"
```

**Auto-Detection:**
```json
{
  "primaryPurpose": "education",
  "audience": {
    "demographic": "children",
    "techLevel": "beginner",
    "economicLevel": "mid-market"
  },
  "emotionalTone": {
    "energy": "energetic",
    "formality": "casual",
    "personality": "playful"
  },
  "referenceApps": ["Duolingo", "Khan Academy Kids", "PBS Kids Games"],
  "colorScheme": {
    "primary": "#FF6B6B", // Playful red
    "secondary": "#4ECDC4", // Fun teal
    "accent": "#FFE66D" // Sunny yellow
  }
}
```

### Example 2: Luxury Travel Planner

**Input:**
```
Name: "Nomade"
Description: "Curated luxury travel experiences for discerning travelers"
```

**Auto-Detection:**
```json
{
  "primaryPurpose": "commerce",
  "audience": {
    "demographic": "adults",
    "techLevel": "intermediate",
    "economicLevel": "luxury"
  },
  "emotionalTone": {
    "energy": "calm",
    "formality": "professional",
    "personality": "aspirational"
  },
  "referenceApps": ["Airbnb Luxe", "Mr & Mrs Smith", "Black Tomato"],
  "colorScheme": {
    "primary": "#2C2C2E", // Sophisticated black
    "secondary": "#D4AF37", // Elegant gold
    "accent": "#F5F5F7" // Refined white
  }
}
```

### Example 3: New Type - AI Companion App

**Input:**
```
Name: "Companion AI"
Description: "Personal AI friend for mental wellness and daily support"
```

**Auto-Detection:**
```json
{
  "primaryPurpose": "utility",
  "audience": {
    "demographic": "adults",
    "techLevel": "intermediate",
    "economicLevel": "mid-market"
  },
  "emotionalTone": {
    "energy": "calm",
    "formality": "casual",
    "personality": "trustworthy"
  },
  "referenceApps": ["Replika", "Woebot", "Calm"], // NEW: AI + wellness hybrid
  "colorScheme": {
    "primary": "#6B7FD7", // Calming purple-blue
    "secondary": "#98D8C8", // Soothing mint
    "accent": "#F7B267" // Warm peach
  },
  "newCategory": true, // FLAGGED AS NEW TYPE
  "categoryName": "AI Wellness Companion"
}
```

---

## Database Schema

```sql
CREATE TABLE design_profiles (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100), -- Auto-generated category name
  
  -- Profile data (JSON)
  profile JSONB NOT NULL,
  
  -- Learning metrics
  success_score DECIMAL(3,2) DEFAULT 0.5,
  usage_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),
  
  -- Confidence scores
  confidence JSONB, -- Per-element confidence
  
  -- Metadata
  is_new_type BOOLEAN DEFAULT false,
  needs_review BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  last_refined_at TIMESTAMP,
  last_used_at TIMESTAMP,
  
  -- Vector embedding for similarity search
  embedding VECTOR(1536)
);

CREATE TABLE design_feedback (
  id UUID PRIMARY KEY,
  build_id UUID REFERENCES builds(id),
  profile_id UUID REFERENCES design_profiles(id),
  
  -- User feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  modifications JSONB, -- What did they change?
  kept_elements JSONB, -- What did they keep?
  time_to_first_edit INTEGER, -- Seconds
  
  -- Analysis
  insights JSONB, -- AI-generated insights
  applied_to_profile BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE design_experiments (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES design_profiles(id),
  variant_type VARCHAR(50), -- 'color', 'typography', 'layout'
  
  control_config JSONB,
  variant_config JSONB,
  
  -- Results
  control_rating DECIMAL(3,2),
  variant_rating DECIMAL(3,2),
  winner VARCHAR(20), -- 'control', 'variant', 'inconclusive'
  sample_size INTEGER,
  
  started_at TIMESTAMP,
  concluded_at TIMESTAMP
);
```

---

## Implementation Priority

### Phase 1: Detection (Week 1)
1. Build `DesignProfileDetector`
2. Implement multi-dimensional analysis
3. Test on 10 different app types
4. Verify accuracy of detection

### Phase 2: Learning (Week 2)
1. Build `DesignLearningEngine`
2. Track user modifications
3. Implement feedback analysis
4. Auto-refine profiles

### Phase 3: Management (Week 3)
1. Build admin dashboard
2. Profile editor
3. Analytics views
4. Manual override capability

### Phase 4: Continuous Improvement (Week 4)
1. Nightly learning pipeline
2. A/B testing system
3. Profile pruning
4. New type detection

---

## Success Metrics

### Detection Accuracy:
- ✅ 90%+ profiles match user expectations
- ✅ <10% require manual adjustment
- ✅ New types detected within 3 builds

### Learning Effectiveness:
- ✅ Profile ratings improve over time
- ✅ User modifications decrease by 30%
- ✅ Time-to-first-edit increases (fewer immediate changes)

### System Intelligence:
- ✅ Auto-creates profiles for new app types
- ✅ Continuously improves without manual intervention
- ✅ Adapts to user preferences

---

## The Big Picture

This system transforms BuildRunner from having **fixed presets** to being a **self-evolving design intelligence**:

```
Traditional System:
App → Industry Lookup → Static Template → Done

Intelligent System:
App → Multi-Dimensional Analysis → Find/Create Profile → Learn from Usage → Improve Continuously
```

Every build makes the system smarter.
Every user interaction teaches the system something new.
New app types are automatically detected and profiled.

This is how BuildRunner becomes the smartest AI builder on the market.
