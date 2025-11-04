# BuildRunner Architecture Gap Analysis
## Why Current Builds Don't Match v0.dev/Bolt Quality

**Date:** 2025-11-03
**Issue:** Generated apps look generic, not like the requested TrailSync off-roading trip planner

---

## The Core Problem

### What You're Seeing
- ✅ Build starts and completes
- ✅ API authentication works
- ❌ Preview shows generic forms, not TrailSync-specific UI
- ❌ Component progress bars don't update
- ❌ No connection between PRD features and generated code
- ❌ Random filler content instead of cohesive app

### What v0.dev/Bolt Do Differently

#### 1. **Context-Aware Component Generation**
```typescript
// v0.dev approach:
generateComponent({
  appName: "TrailSync",
  purpose: "Off-roading trip planner",
  feature: "Trip Location Selection",
  designSystem: fullDesignTokens,
  dataModel: {
    TripLocation: { lat, lng, name, terrain, difficulty }
  }
})
// Returns: Fully customized, branded, working component
```

#### 2. **BuildRunner Current Approach**
```typescript
// Current broken flow:
1. Read generic component template
2. Apply minimal customization
3. Generate without PRD context
4. No design system application
5. No data model awareness

Result: Generic boilerplate, not TrailSync
```

---

## Critical Missing Pieces

### 1. **PRD → Code Bridge**
**Current State:** PRD exists, but code generator doesn't read it
**Needed:**
- Parse PRD features → Extract entities (Trip, Location, Task, Member)
- Map features to component requirements
- Generate domain-specific data models

### 2. **Design System Application**
**Current State:** Design system generated, never applied
**Needed:**
```typescript
// Every component should receive:
{
  colors: { primary: "#228B22", ... },
  typography: { fontFamily: "Inter", sizes: {...} },
  spacing: { unit: 8, scale: [0.5, 1, 2, ...] },
  components: { Button: {}, Card: {}, ... }
}
```

### 3. **Event-Driven Progress Tracking**
**Current State:** Progress bars frozen
**Problem:** `BuildOrchestrator` creates components but doesn't emit events

**Fix Needed:**
```typescript
// In build-orchestrator.ts:
async buildComponent(component) {
  this.emit('component:start', { id: component.id });

  // Generate code...
  this.emit('component:progress', {
    id: component.id,
    progress: 50
  });

  // Complete...
  this.emit('component:complete', {
    id: component.id,
    code: generatedCode
  });
}
```

### 4. **Component Templates → AI Generation**
**Current State:** Using static templates
**Needed:** Dynamic AI generation with full context

```typescript
// Instead of getTemplateForComponent():
const prompt = `
Generate a React component for TrailSync off-roading app.

Component: Trip Location Selector
Purpose: Allow users to search and save off-road locations
Features:
- Map integration (Mapbox/Leaflet)
- Location search autocomplete
- Save to favorites
- Terrain difficulty rating
- Weather integration

Design System:
- Primary color: #228B22 (Forest Green)
- Font: Inter
- Mobile-first responsive

Data Model:
interface TripLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  terrainType: 'rock' | 'sand' | 'mud' | 'mixed';
  difficulty: 1-5;
  weatherConditions?: WeatherData;
}

Generate complete, production-ready code with:
- Full styling using Tailwind + design tokens
- Proper state management
- Loading states
- Error handling
- Mobile optimization
`;

const generatedCode = await generateWithAI(prompt);
```

---

## How v0.dev/Bolt Achieve Quality

### 1. **Artifact-Based Generation**
- Each component is a complete "artifact"
- No templates - full AI generation every time
- Context passed to every generation

### 2. **Multi-Model Verification**
```typescript
// v0.dev likely does:
const code = await claude.generate(prompt);
const verified = await gpt4.verify(code);
const improved = await deepseek.optimize(code);
```

### 3. **Iterative Refinement**
- User can say "make it more modern"
- AI regenerates with new context
- Design stays consistent

### 4. **Real Data Models**
- Extract entities from description
- Generate TypeScript interfaces
- Create mock data matching the domain
- Not "User" / "Post" - actual domain models

---

## Immediate Action Plan

### Phase 1: Fix Progress Tracking (Quick Win)
**File:** `/lib/build-orchestrator.ts`

```typescript
// Add event emissions:
async startBuild(components) {
  this.emit('build:start', { total: components.length });

  for (const component of components) {
    this.emit('component:start', { component });
    await this.buildComponent(component);
    this.emit('component:complete', { component });
    this.emit('build:progress', {
      completed: completedCount,
      total: components.length
    });
  }
}
```

### Phase 2: Add PRD Context to Generation
**File:** `/lib/build-orchestrator.ts`

```typescript
constructor(apiKey, config, projectId) {
  // Load PRD
  const prd = this.loadPRD(projectId);
  this.prdFeatures = this.extractFeatures(prd);
  this.entities = this.extractEntities(prd);
}

async buildComponent(component) {
  const context = {
    appName: this.prdFeatures.productName,
    appPurpose: this.prdFeatures.description,
    feature: component.name,
    relatedEntities: this.getRelatedEntities(component),
    designSystem: this.designSpec,
  };

  const code = await this.generateWithContext(context);
}
```

### Phase 3: Replace Templates with AI Generation
**File:** `/lib/component-generator.ts` (new)

```typescript
export class ComponentGenerator {
  async generate(context) {
    const prompt = this.buildContextAwarePrompt(context);
    const code = await this.callAI(prompt);
    return this.validateAndFormat(code);
  }

  buildContextAwarePrompt(context) {
    return `
You are generating a component for ${context.appName}.
App Purpose: ${context.appPurpose}

Component: ${context.feature}
Related Data: ${JSON.stringify(context.relatedEntities)}

Design System:
${JSON.stringify(context.designSystem, null, 2)}

Requirements:
1. Use exact colors/fonts from design system
2. Be specific to ${context.appName}, not generic
3. Include proper TypeScript types
4. Mobile-optimized
5. Loading/error states
6. Professional, production-ready code

Generate complete React component with all imports.
    `;
  }
}
```

### Phase 4: Design System Integration
**File:** `/lib/design-system-generator.ts`

```typescript
// Already generates design system
// Need to APPLY it to every component:

async applyDesignSystem(code, designSpec) {
  // Replace colors
  code = code.replace(/bg-blue-600/g, `bg-[${designSpec.colors.primary}]`);

  // Inject font
  code = code.replace(/font-sans/g, designSpec.typography.fontFamily.sans);

  // Apply spacing scale
  // ... etc

  return code;
}
```

---

## The Real Solution: Architectural Rebuild

### What BuildRunner v2 Should Look Like

```typescript
class BuildRunnerV2 {
  async build(prd, designPreferences) {
    // 1. Extract domain model
    const domain = await this.extractDomain(prd);
    // → { entities: [Trip, Location, Task, Member],
    //     relationships: [...] }

    // 2. Generate design system
    const design = await this.generateDesignSystem(
      prd.productIdea,
      designPreferences
    );

    // 3. Create data layer
    const dataLayer = await this.generateDataLayer(domain);
    // → Database schema, API routes, types

    // 4. Generate feature components
    for (const feature of prd.features) {
      const component = await this.generateFeatureComponent({
        feature,
        domain,
        design,
        dataLayer
      });

      await this.writeComponent(component);
      this.emit('progress', { ... });
    }

    // 5. Generate navigation & layout
    const app = await this.composeApp({
      components,
      design,
      domain
    });

    return app;
  }
}
```

---

## Comparison Table

| Feature | BuildRunner Current | v0.dev/Bolt | Gap |
|---------|-------------------|-------------|-----|
| PRD Integration | ❌ Not used | ✅ Full context | CRITICAL |
| Design System | 🟡 Generated, not applied | ✅ Applied everywhere | HIGH |
| Component Quality | ❌ Generic templates | ✅ Custom AI generation | CRITICAL |
| Progress Tracking | ❌ Broken | ✅ Real-time | MEDIUM |
| Data Models | ❌ Generic | ✅ Domain-specific | HIGH |
| Code Quality | 🟡 Works but generic | ✅ Production-ready | HIGH |
| Customization | ❌ None | ✅ Conversational refinement | MEDIUM |

---

## Recommended Next Steps

### Immediate (This Week)
1. ✅ Fix API authentication (DONE)
2. ⏳ Fix progress bar events
3. ⏳ Pass PRD context to component generation

### Short Term (Next 2 Weeks)
4. Replace static templates with AI generation
5. Apply design system to all generated code
6. Extract entities from PRD → Generate data models

### Long Term (Next Month)
7. Multi-model verification system
8. Iterative refinement UI ("make it more modern")
9. Component quality scoring
10. Automated testing generation

---

## Files to Modify

**Priority 1 (This Week):**
- `/lib/build-orchestrator.ts` - Add event emissions
- `/lib/component-templates.ts` - Replace with AI generation

**Priority 2 (Next Week):**
- `/lib/design-system-generator.ts` - Add application logic
- `/lib/prd-parser.ts` (new) - Extract entities/features
- `/lib/component-generator.ts` (new) - Context-aware generation

**Priority 3 (Later):**
- `/lib/multi-model-verifier.ts` (new) - Quality assurance
- `/lib/data-model-generator.ts` (new) - Domain-specific types
- `/lib/app-composer.ts` (new) - Stitch components together

---

## Conclusion

The gap between BuildRunner and v0.dev/Bolt is **architectural, not incremental**.

Current approach: Templates + minimal customization
Needed approach: Full AI generation with complete context

The good news: The infrastructure is 80% there. We just need to:
1. Connect PRD → Code generation
2. Apply design system properly
3. Replace templates with AI generation
4. Fix progress tracking

**Estimated effort:** 2-3 weeks for production-quality output matching v0.dev
