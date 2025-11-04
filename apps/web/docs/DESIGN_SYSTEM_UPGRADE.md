# Design System Upgrade Plan

## The Problem

Generated apps currently look like 2010 Bootstrap tutorials instead of 2024 production apps due to:
1. **No Design System**: Each component generated independently with random styling
2. **Wrong Navigation**: Tech stack (Next.js, React, TypeScript) shown as nav items instead of features
3. **No Visual Hierarchy**: Everything has same visual weight, no consistent spacing/colors
4. **Console Errors**: Default browser styles and missing assets

## Root Cause Analysis

```typescript
// Current: Each component generated independently
generateComponent("Trip")    // → Random styling
generateComponent("Chat")    // → Different styling
generateComponent("Menu")    // → Inconsistent styling

// Result: Frankenstein's monster UI
```

The AI generates a tech demo, not a production app.

## Solution: Design-First Generation Pipeline

### Phase 1: Design Presets Library

**File**: `apps/web/lib/design-presets.ts`

Create professional design systems inspired by industry leaders:

```typescript
export const DESIGN_PRESETS = {
  'modern-saas': {
    inspiration: 'Linear, Notion, Stripe',
    colors: {
      background: '#0A0A0B',
      surface: '#141415',
      border: 'rgba(255,255,255,0.08)',
      primary: '#5E5CE6',
      text: {
        primary: '#FFFFFF',
        secondary: '#A0A0A0',
        tertiary: '#707070'
      }
    },
    components: {
      card: 'bg-surface border border-white/[0.08] rounded-xl p-6 hover:border-white/[0.16] transition-colors duration-200',
      button: 'px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-150 font-medium text-sm',
      input: 'w-full px-4 py-2.5 bg-black/30 border border-white/[0.08] rounded-lg text-white placeholder-white/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50'
    }
  },

  'clean-minimal': {
    inspiration: 'Vercel, GitHub, Apple',
    colors: {
      background: '#FFFFFF',
      surface: '#FAFAFA',
      border: '#E5E5E5',
      primary: '#000000',
      text: {
        primary: '#000000',
        secondary: '#666666',
        tertiary: '#999999'
      }
    },
    components: {
      card: 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200',
      button: 'px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-150 font-medium text-sm tracking-wide',
      input: 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5'
    }
  },

  'outdoor-adventure': {
    inspiration: 'AllTrails, REI, Patagonia',
    colors: {
      background: '#111827',
      surface: '#1F2937',
      border: '#374151',
      primary: '#10B981', // emerald-500
      secondary: '#6366F1', // indigo-500
      accent: '#F59E0B', // amber-500
      text: {
        primary: '#FFFFFF',
        secondary: '#9CA3AF',
        tertiary: '#6B7280'
      }
    },
    components: {
      card: 'bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-emerald-500/50 transition-all duration-200',
      button: 'px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium',
      input: 'w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50'
    }
  }
};
```

### Phase 2: Enhanced Component Generator

**File**: `apps/web/lib/enhanced-component-generator.ts`

Update AI prompts to enforce professional design:

```typescript
const ENHANCED_SYSTEM_PROMPT = `
You are generating components for a PRODUCTION application that must look professional.

CRITICAL VISUAL RULES:

1. NEVER use default HTML styling - everything must be styled
2. Use this exact component structure for consistency:

<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Your component content */}
  </div>
</div>

3. ALWAYS use these modern UI patterns:
   - Subtle shadows: shadow-lg shadow-black/5
   - Smooth transitions: transition-all duration-200
   - Hover states on everything interactive
   - Proper spacing: use gap-4, space-y-4, not margins
   - Icons from lucide-react for consistency

4. Mobile-first responsive design:
   - sm: tablets
   - md: laptops
   - lg: desktops

5. Component Templates:

Trip Card:
<div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer">
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-gray-400 text-sm mt-1">{location}</p>
    </div>
    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
      {status}
    </span>
  </div>
</div>

Navigation (NEVER use tech stack as nav items):
<nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <h1 className="text-xl font-bold text-white">App Name</h1>
      <div className="flex items-center gap-6">
        {/* Actual feature links, NOT tech stack */}
        <a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a>
      </div>
    </div>
  </div>
</nav>

ALWAYS reference premium apps: Linear, Raycast, Notion, Stripe, Vercel
`;
```

### Phase 3: UI Polish Layer

**File**: `apps/web/lib/ui-polisher.ts`

Automated polish pass after generation:

```typescript
export class UIPolisher {
  async polishGeneratedApp(components: GeneratedComponent[]): Promise<void> {
    await this.addLoadingStates(components);
    await this.addEmptyStates(components);
    await this.addMicroInteractions(components);
    await this.normalizeSpacing(components);
  }

  private async addLoadingStates(components: GeneratedComponent[]) {
    const skeletonTemplate = `
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      ) : (
        {/* Original content */}
      )}
    `;
  }

  private async addEmptyStates(components: GeneratedComponent[]) {
    const emptyStateTemplate = `
      {data.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No items yet</h3>
          <p className="text-gray-400 text-sm">Get started by creating your first item</p>
        </div>
      ) : (
        {/* Original list */}
      )}
    `;
  }
}
```

### Phase 4: Navigation Sanitization

**File**: `apps/web/lib/build-orchestrator.ts`

Fix navigation to show features, not tech:

```typescript
private sanitizeNavigation(plan: BuildPlan): BuildPlan {
  // Remove tech stack from navigation
  const techTerms = ['nextjs', 'react', 'typescript', 'tailwind', 'shadcn', 'supabase'];

  plan.navigation = plan.navigation.filter(item =>
    !techTerms.some(tech => item.toLowerCase().includes(tech))
  );

  // If no valid navigation, use app-appropriate defaults
  if (plan.navigation.length === 0) {
    plan.navigation = this.getDefaultNavigation(plan.appType);
  }

  return plan;
}

private getDefaultNavigation(appType: string): string[] {
  const navMap = {
    'off-road-planner': ['Trips', 'Tasks', 'Chat', 'Settings'],
    'saas': ['Dashboard', 'Projects', 'Team', 'Settings'],
    'ecommerce': ['Shop', 'Cart', 'Orders', 'Account'],
    'social': ['Feed', 'Messages', 'Profile', 'Notifications'],
    'default': ['Home', 'Features', 'About', 'Contact']
  };

  return navMap[appType] || navMap.default;
}
```

## LLM Strategy: Multi-Model Pipeline

### Primary Models (OpenRouter)

1. **Claude 3.5 Sonnet** (`anthropic/claude-3.5-sonnet`)
   - **Use for**: Design system generation, complex components
   - **Cost**: $3/million tokens
   - **Why**: Best understanding of modern design patterns, knows Tailwind intimately

2. **Claude 3.5 Haiku** (`anthropic/claude-3-5-haiku`)
   - **Use for**: Simple components, variations
   - **Cost**: $1/million tokens
   - **Why**: Fast, cheap, good quality for standard components

3. **Gemini 2.0 Flash** (`google/gemini-2.0-flash-thinking-exp:free`)
   - **Use for**: Polish pass, micro-adjustments
   - **Cost**: FREE
   - **Why**: Fast and good at small refinements

### Enhanced Stack (Future)

4. **Anthropic API Direct** (Claude Vision)
   - **Use for**: Screenshot → Code conversion
   - **Why**: Can clone existing designs pixel-perfect

5. **Together AI** (specialized models)
   - **Use for**: Fast component variations
   - **Why**: Fine-tuned on React/Tailwind patterns

### Cost-Optimized Routing

```typescript
export class CostOptimizedDesignRouter {
  routeRequest(task: DesignTask): ModelChoice {
    const complexity = this.assessComplexity(task);

    if (complexity === 'trivial') {
      return { model: 'google/gemini-2.0-flash-thinking-exp:free', cost: 0 };
    }

    if (complexity === 'standard') {
      return { model: 'anthropic/claude-3-5-haiku', cost: 1 };
    }

    if (complexity === 'complex' || task.type === 'design-system') {
      return { model: 'anthropic/claude-3.5-sonnet', cost: 3 };
    }
  }
}
```

## Figma Plugin Integration (Future Phase)

**File**: `apps/web/lib/figma-integration.ts`

Allow users to import designs from Figma:

```typescript
export class FigmaToCode {
  async importFromFigma(figmaUrl: string) {
    // 1. Fetch Figma design via API
    const design = await this.fetchFigmaDesign(figmaUrl);

    // 2. Convert to screenshot
    const screenshot = await this.renderFigmaNode(design);

    // 3. Use Claude Vision to convert to code
    const code = await this.cloneWithVision(screenshot);

    // 4. Polish with Claude 3.5 Sonnet
    const polished = await this.polishCode(code);

    return polished;
  }

  private async fetchFigmaDesign(url: string) {
    // Use Figma REST API
    const fileKey = this.extractFileKey(url);
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN }
    });
    return response.json();
  }
}
```

## Implementation Pipeline

```typescript
export class DesignPipeline {
  // Step 1: Design System Generation
  async generateDesignSystem(brand: BrandInfo) {
    return await openRouter.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{
        role: 'system',
        content: DESIGN_SYSTEM_PROMPT
      }, {
        role: 'user',
        content: `Create a design system for ${brand.name} similar to ${brand.inspiration}`
      }],
      temperature: 0.3
    });
  }

  // Step 2: Component Generation
  async generateComponent(spec: ComponentSpec, designSystem: DesignSystem) {
    const code = await openRouter.chat.completions.create({
      model: 'anthropic/claude-3-5-haiku',
      messages: [{
        role: 'system',
        content: this.buildComponentPrompt(designSystem)
      }, {
        role: 'user',
        content: spec.description
      }]
    });

    return code;
  }

  // Step 3: Polish Pass
  async polishUI(components: Component[]) {
    return await openRouter.chat.completions.create({
      model: 'google/gemini-2.0-flash-thinking-exp:free',
      messages: [{
        role: 'user',
        content: `Review these components and add polish:
          - Ensure consistent spacing (8px grid)
          - Add hover/focus states
          - Verify color consistency
          - Add loading/empty states`
      }]
    });
  }
}
```

## Expected Quality Improvement

| Metric | Current | With Design System | With Multi-Model | With Vision + Figma |
|--------|---------|-------------------|------------------|---------------------|
| Visual Quality | 3/10 | 7/10 | 9/10 | 10/10 |
| Consistency | 2/10 | 8/10 | 9/10 | 10/10 |
| Modern Feel | 3/10 | 8/10 | 9/10 | 10/10 |
| Production Ready | No | Maybe | Yes | Yes |

## Implementation Priority

### Phase 1 (Today)
- [ ] Create `design-presets.ts` with 3 preset themes
- [ ] Update component generator prompts
- [ ] Implement navigation sanitization
- [ ] Fix page.tsx to show features not tech stack

### Phase 2 (This Week)
- [ ] Build UI polisher
- [ ] Add loading states
- [ ] Add empty states
- [ ] Implement cost-optimized routing

### Phase 3 (Next Week)
- [ ] Add 2 more design presets
- [ ] Implement multi-model pipeline
- [ ] A/B test with users

### Phase 4 (Future)
- [ ] Figma plugin integration
- [ ] Claude Vision screenshot cloning
- [ ] User-uploadable design systems

## Success Metrics

- Component consistency score: >90%
- User satisfaction with generated UI: >8/10
- Time to production-ready design: <5 minutes
- Design system adherence: 100%

## Technical Dependencies

- OpenRouter API access (existing)
- Anthropic API key (for Vision, future)
- Figma API token (for plugin, future)
- Updated component generation prompts
- Design preset storage system
