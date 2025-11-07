/**
 * Context-Aware Prompt Builder
 * Builds v0.dev-quality prompts with full PRD context, design system, and feature details
 */

import { DesignSpec } from './design-system-generator';
import type { DesignProfile } from './design-intelligence/types';

export interface PRDContext {
  productName: string;
  productIdea: string;
  executiveSummary?: string;
  problemStatement?: string;
  targetAudience?: string;
  valueProposition?: string;
  features: Array<{
    id: string;
    title: string;
    description: string;
    section: string;
  }>;
  prdSections?: any;
}

export interface ComponentContext {
  componentName: string;
  componentType: string;
  description?: string;
  relatedFeatures: string[];
  dataModels: Record<string, any>;
  dependencies: string[];
  // New: Metadata from build plan for tiered prompts
  criticality?: 'ULTRA_CRITICAL' | 'CRITICAL' | 'IMPORTANT' | 'STANDARD';
  qualityRequirements?: {
    typescript?: 'strict' | 'standard';
    accessibility?: boolean;
    responsive?: boolean;
    errorHandling?: boolean;
    loadingStates?: boolean;
    maxLines?: number;
  };
  prdFeatures?: string[];
}

export interface BuildContext {
  prd: PRDContext;
  design: DesignSpec;
  component: ComponentContext;
  appConfig: {
    framework: string;
    styling: string;
    typescript: boolean;
    mobileFirst: boolean;
  };
  profile?: DesignProfile | null; // Optional design profile for enhanced generation
}

export class ContextBuilder {
  /**
   * Build a comprehensive, v0.dev-quality prompt for component generation
   */
  static buildComponentPrompt(context: BuildContext): string {
    const { prd, design, component, appConfig, profile } = context;

    return `You are an expert React developer building a production-quality web application.

${this.buildAppSection(prd)}

${this.buildFeatureSection(component, prd)}

${profile ? this.buildDesignProfileSection(profile) : ''}

${this.buildDesignSystemSection(design, prd)}

${this.buildDesignTokenRequirements()}

${this.buildTechnicalSection(appConfig, component)}

${this.buildDataModelSection(component)}

${this.buildRequirementsSection(prd, component)}

${this.buildTieredQualityStandards(component)}

Return complete, production-ready code ready to save to a file. Include all imports and exports.`;
  }

  private static buildAppSection(prd: PRDContext): string {
    return `APP CONTEXT:
App Name: ${prd.productName}
Purpose: ${prd.productIdea}
${prd.targetAudience ? `Target Users: ${prd.targetAudience}` : ''}
${prd.valueProposition ? `Value Proposition: ${prd.valueProposition}` : ''}

Core Features:
${prd.features.slice(0, 5).map(f => `- ${f.title}: ${f.description}`).join('\n')}`;
  }

  private static buildFeatureSection(component: ComponentContext, prd: PRDContext): string {
    const relatedFeatures = prd.features.filter(f =>
      component.relatedFeatures.includes(f.id) ||
      f.title.toLowerCase().includes(component.componentName.toLowerCase())
    );

    return `CURRENT COMPONENT:
Component: ${component.componentName}
Type: ${component.componentType}
${component.description ? `Description: ${component.description}` : ''}

Related PRD Features:
${relatedFeatures.length > 0
  ? relatedFeatures.map(f => `- ${f.title}: ${f.description}`).join('\n')
  : '- This component supports the core functionality described above'}

User Stories:
${this.generateUserStories(component, prd)}`;
  }

  private static buildDesignProfileSection(profile: DesignProfile): string {
    // Defensive checks for nested properties
    const hasFullProfile = profile &&
      profile.audience &&
      profile.emotionalTone &&
      profile.visualStyle &&
      profile.referenceApps &&
      profile.colorScheme &&
      profile.componentPatterns;

    if (!hasFullProfile) {
      console.warn('⚠️ Incomplete design profile, skipping profile section');
      return '';
    }

    return `DESIGN PROFILE (CRITICAL - Follow Exactly):
This app has been analyzed and matched to these design characteristics:

Profile: ${profile.name || 'Modern App'}
Category: ${profile.category || 'General'}

TARGET AUDIENCE & TONE:
- Demographic: ${profile?.audience?.demographic || 'General users'}
- Tech Level: ${profile?.audience?.techLevel || 'Medium'}
- Economic Level: ${profile?.audience?.economicLevel || 'Medium'}
- Emotional Tone: ${profile?.emotionalTone?.energy || 'Balanced'}, ${profile?.emotionalTone?.formality || 'Professional'}, ${profile?.emotionalTone?.personality || 'Friendly'}

VISUAL STYLE:
- Aesthetic: ${profile?.visualStyle?.aesthetic || 'Modern'}
- Modernity: ${profile?.visualStyle?.modernity || 'Contemporary'}
- Density: ${profile?.visualStyle?.density || 'Balanced'}

REFERENCE APPS (Match This Quality):
${profile.referenceApps && profile.referenceApps.length > 0
  ? profile.referenceApps.map((app, i) => `${i + 1}. ${app}`).join('\n')
  : '1. Modern professional web apps'}
Make this component look as professional and polished as ${profile.referenceApps && profile.referenceApps[0] || 'modern web apps'}.

COLOR REASONING:
- Primary (${profile?.colorScheme?.primary || '#3B82F6'}): ${profile?.colorScheme?.primaryReasoning || 'Brand color'}
- Secondary (${profile?.colorScheme?.secondary || '#6B7280'}): ${profile?.colorScheme?.secondaryReasoning || 'Secondary brand color'}
- Accent (${profile?.colorScheme?.accent || '#10B981'}): ${profile?.colorScheme?.accentReasoning || 'Accent highlights'}

COMPONENT PATTERNS:
- Card Style: ${profile?.componentPatterns?.cardStyle || 'Modern with shadows'}
- Button Style: ${profile?.componentPatterns?.buttonStyle || 'Rounded with good padding'}
- Navigation: ${profile?.componentPatterns?.navigation || 'Clean sidebar'}
- Content Density: ${profile?.componentPatterns?.contentDensity || 'Balanced spacing'}
`;
  }

  private static buildDesignSystemSection(design: DesignSpec, prd: PRDContext): string {
    return `DESIGN SYSTEM (MUST USE EXACTLY):
Brand Personality: ${this.inferBrandPersonality(prd.productIdea)}
Visual Style: ${design?.visualStyle || 'modern'}

Colors (USE THESE EXACT VALUES):
- Primary: ${design?.colorPalette?.primary || '#3B82F6'}
- Primary Foreground: ${design?.colorPalette?.primaryForeground || '#FFFFFF'}
- Secondary: ${design?.colorPalette?.secondary || '#6B7280'}
- Accent: ${design?.colorPalette?.accent || '#10B981'}
- Background: ${design?.colorPalette?.background || '#FFFFFF'}
- Foreground: ${design?.colorPalette?.foreground || '#111827'}
- Border: ${design?.colorPalette?.border || '#E5E7EB'}
- Muted: ${design?.colorPalette?.muted || '#F3F4F6'}
- Destructive: ${design?.colorPalette?.destructive || '#EF4444'}

Typography:
- Font Family: ${design?.typography?.fontFamily?.sans || 'Inter, system-ui, sans-serif'}
- Mono Font: ${design?.typography?.fontFamily?.mono || 'JetBrains Mono, monospace'}
- Font Sizes: ${JSON.stringify(design?.typography?.scale || {})}
- Font Weights: ${JSON.stringify(design?.typography?.weights || {})}

Spacing (8px base unit):
- Use Tailwind spacing: p-2 (8px), p-4 (16px), p-6 (24px), p-8 (32px)
- Gap: gap-2, gap-3, gap-4, gap-6
- Component Scale: ${design?.designTokens?.spacing?.scale?.join(', ') || '0, 8, 16, 24, 32, 40, 48'}

Border Radius:
- Small: ${design?.designTokens?.borderRadius?.sm || '0.125rem'}
- Medium: ${design?.designTokens?.borderRadius?.md || '0.375rem'}
- Large: ${design?.designTokens?.borderRadius?.lg || '0.5rem'}
- Extra Large: ${design?.designTokens?.borderRadius?.xl || '0.75rem'}

Shadows:
- Small: ${design?.designTokens?.shadows?.sm || '0 1px 2px 0 rgb(0 0 0 / 0.05)'}
- Medium: ${design?.designTokens?.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'}
- Large: ${design?.designTokens?.shadows?.lg || '0 10px 15px -3px rgb(0 0 0 / 0.1)'}

Component Patterns:
- Navigation: ${design?.componentPatterns?.navigation || 'sidebar'}
- Layout: ${design?.componentPatterns?.layout || 'standard'}
- Card Style: ${design?.componentPatterns?.cardStyle || 'modern'}

Design Inspiration:
${design?.inspiration?.join(', ') || 'Modern web applications'}`;
  }

  private static buildDesignTokenRequirements(): string {
    return `DESIGN TOKEN REQUIREMENTS (MANDATORY - CRITICAL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ABSOLUTE REQUIREMENT: You MUST use design tokens. NO EXCEPTIONS.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ CORRECT - Use These Token Classes:
  - bg-primary           (NOT bg-blue-500, bg-indigo-600, etc.)
  - bg-secondary         (NOT bg-purple-500, bg-violet-600, etc.)
  - bg-accent            (NOT bg-cyan-500, bg-sky-500, etc.)
  - bg-background        (NOT bg-white, bg-gray-50, bg-slate-50, etc.)
  - bg-foreground        (NOT bg-black, bg-gray-900, bg-slate-900, etc.)
  - bg-surface           (for cards, NOT bg-gray-100, bg-slate-100, etc.)
  - bg-muted             (for disabled/subtle, NOT bg-gray-200, etc.)
  - bg-border            (for borders, NOT border-gray-300, etc.)

  - text-primary         (NOT text-blue-600, text-indigo-600, etc.)
  - text-secondary       (NOT text-purple-600, text-violet-600, etc.)
  - text-accent          (NOT text-cyan-600, text-sky-600, etc.)
  - text-foreground      (NOT text-black, text-gray-900, text-slate-900, etc.)
  - text-muted-foreground (NOT text-gray-500, text-slate-500, etc.)

  - border-border        (NOT border-gray-300, border-slate-300, etc.)
  - border-input         (for form inputs)

  - ring-ring            (for focus rings, NOT ring-blue-500, etc.)

❌ ABSOLUTELY FORBIDDEN - Never Use These:
  - ANY Tailwind color utilities: blue-*, red-*, green-*, yellow-*, purple-*,
    pink-*, indigo-*, cyan-*, teal-*, orange-*, gray-*, slate-*, zinc-*,
    neutral-*, stone-*, amber-*, lime-*, emerald-*, sky-*, violet-*, fuchsia-*, rose-*
  - ANY hex colors: #6366F1, #8B5CF6, #FFFFFF, #000000, etc.
  - ANY RGB/RGBA colors: rgb(99, 102, 241), rgba(139, 92, 246, 0.5), etc.
  - ANY HSL colors: hsl(239, 84%, 67%), etc.
  - bg-white or bg-black (use bg-background or bg-foreground instead)

🔥 THIS WILL BE VALIDATED:
Your component will be scanned for hardcoded colors. If ANY are found:
  1. Build will show ⚠️ warning
  2. Component will be flagged for regeneration
  3. Pattern will be downgraded in library

The design system has been CUSTOMIZED for this specific app with carefully
selected colors based on the app's purpose, audience, and industry. When you
use design tokens, the app will look cohesive and professional. When you use
hardcoded colors, it will look like random Bootstrap garbage.

EXAMPLES:

❌ WRONG (Will be rejected):
  <div className="bg-blue-500 text-white">
  <Button className="bg-purple-600 hover:bg-purple-700">
  <Card className="bg-gray-100 border-gray-300">

✅ CORRECT (Approved):
  <div className="bg-primary text-primary-foreground">
  <Button className="bg-secondary hover:bg-secondary/90">
  <Card className="bg-surface border-border">

Remember: The design profile was specifically created for THIS app.
Use the tokens to match that professional, cohesive design.`;
  }

  private static buildTechnicalSection(appConfig: any, component: ComponentContext): string {
    return `TECHNICAL REQUIREMENTS:
Framework: ${appConfig.framework || 'Next.js 14 (App Router)'}
Styling: ${appConfig.styling || 'Tailwind CSS'} + shadcn/ui components
TypeScript: ${appConfig.typescript !== false ? 'Required (strict mode)' : 'Optional'}
Mobile-First: ${appConfig.mobileFirst !== false ? 'Required (90% mobile users)' : 'Desktop-first'}

Component Dependencies:
${component.dependencies.length > 0
  ? component.dependencies.map(d => `- ${d}`).join('\n')
  : '- shadcn/ui base components (Button, Card, Input, etc.)'}

Architecture:
- Server Components by default
- Use 'use client' only when needed (state, effects, events)
- Proper error boundaries
- Loading states with Suspense
- Optimistic UI updates where appropriate

Import Paths (CRITICAL - Next.js App Router):
- Components: Use @/components/* (e.g., import Button from '@/components/ui/button')
- Utilities: Use @/lib/* (e.g., import { cn } from '@/lib/utils')
- NEVER use ../src/components/* or relative paths to src/
- Path alias @ is configured in tsconfig.json to point to the app directory

ANIMATIONS (CRITICAL - Framer Motion Required):
EVERY component MUST use Framer Motion for professional micro-interactions:

1. Import at top of EVERY component:
   import { motion, AnimatePresence } from 'framer-motion';

2. Wrap main container in motion.div with entry animation:
   <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
   >

3. Add hover animations to ALL interactive elements:
   - Buttons: whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
   - Cards: whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
   - Links: whileHover={{ x: 4 }}
   - Icons: whileHover={{ rotate: 5 }}

4. Use AnimatePresence for conditional rendering:
   <AnimatePresence mode="wait">
     {isVisible && <motion.div exit={{ opacity: 0 }}>...</motion.div>}
   </AnimatePresence>

5. Add stagger animations for lists:
   const containerVariants = {
     hidden: { opacity: 0 },
     show: {
       opacity: 1,
       transition: { staggerChildren: 0.1 }
     }
   };
   const itemVariants = {
     hidden: { opacity: 0, x: -20 },
     show: { opacity: 1, x: 0 }
   };

6. Smooth transitions:
   transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}`;
  }

  private static buildDataModelSection(component: ComponentContext): string {
    if (Object.keys(component.dataModels).length === 0) {
      return `DATA MODELS:
Define appropriate TypeScript interfaces based on the component's purpose.`;
    }

    return `DATA MODELS (USE THESE EXACT TYPES):
${Object.entries(component.dataModels).map(([name, schema]) =>
  `interface ${name} ${JSON.stringify(schema, null, 2)}`
).join('\n\n')}

State Management:
- Use React Server Components where possible
- Client state: useState, useReducer for complex state
- Form state: react-hook-form for forms
- URL state: useSearchParams for filters/pagination`;
  }

  private static buildRequirementsSection(prd: PRDContext, component: ComponentContext): string {
    const isMobile = this.detectMobileApp(prd.productIdea);
    const needsOffline = this.detectOfflineNeed(prd.productIdea);

    return `SPECIFIC REQUIREMENTS:
1. MODERN UI/UX (CRITICAL - PREMIUM QUALITY):
   - Beautiful, polished visual design (Linear/Stripe/Vercel quality level)
   - Generous whitespace and breathing room (never cramped or cluttered)
   - Smooth transitions and micro-interactions (hover, focus, active states)
   - Professional spacing hierarchy (proper padding: px-6 py-4, gaps: gap-6)
   - Subtle shadows and depth (shadow-sm for cards, shadow-md for modals)
   - Clean typography with proper hierarchy (text-lg for headers, text-sm for body)
   - Interactive elements with clear affordances (buttons look clickable)
   - Loading states: Elegant skeletons with subtle animations
   - Empty states: Helpful, visually appealing with icons
   - Error states: Clear, actionable, not alarming
   - Polish every pixel - this should feel premium

2. Design Tokens Application:
   - CRITICAL: Use design token classes (bg-primary, text-foreground, border-border)
   - NEVER use Tailwind color utilities (bg-blue-500, text-gray-900, etc.)
   - Font weight: ${component.componentType === 'heading' ? 'font-bold' : 'font-medium'}
   - Apply consistent shadows (shadow-${component.componentType === 'Card' ? 'lg' : 'md'})

3. Accessibility (WCAG 2.1 AA):
   - Proper ARIA labels on all interactive elements
   - Keyboard navigation (Tab, Enter, Escape)
   - Focus indicators (ring-2 ring-offset-2)
   - Screen reader support
   - Color contrast ratio ≥ 4.5:1

4. Mobile Optimization${isMobile ? ' (CRITICAL - Primary Platform)' : ''}:
   - Touch targets ≥ 44px × 44px
   - Responsive breakpoints: sm (640px), md (768px), lg (1024px)
   - Test on mobile viewport first
   - Thumb-friendly layouts (important actions at bottom)
   - No hover-only interactions

5. Performance:
   - Code splitting (dynamic imports for heavy components)
   - Image optimization (next/image with proper sizing)
   - Lazy loading for below-fold content
   - Debounce search/filter inputs (300ms)
   - Virtualization for long lists (react-window)

6. User Experience:
   - Loading states: Skeleton screens (not spinners)
   - Error handling: User-friendly messages with retry
   - Empty states: Helpful guidance, not just "No data"
   - Success feedback: Toasts or inline confirmation
   - Optimistic updates: Instant UI response

${needsOffline ? `7. Offline Support:
   - Service worker caching for critical resources
   - IndexedDB for local data persistence
   - Sync queue for actions when offline
   - Clear online/offline status indicator` : ''}`;
  }

  /**
   * Build quality standards scaled to component criticality
   * ULTRA_CRITICAL: Comprehensive security + all quality checks
   * CRITICAL: Core quality + error handling
   * IMPORTANT: Essential quality standards
   * STANDARD: Basic clean code
   */
  private static buildTieredQualityStandards(component: ComponentContext): string {
    // Default to IMPORTANT for all components (quality is priority)
    const criticality = component.criticality || 'IMPORTANT';
    const requirements = component.qualityRequirements || {
      accessibility: true,
      responsive: true,
      loadingStates: true,
      errorHandling: true,
    };

    // Start with base requirements (all tiers get these)
    let standards = `CODE QUALITY STANDARDS (${criticality} tier):\n\n`;

    // TIER 1: Basic TypeScript (everyone gets this)
    standards += `1. TypeScript:\n`;
    if (requirements.typescript === 'strict' || criticality !== 'STANDARD') {
      standards += `   - Strict mode enabled\n`;
      standards += `   - No 'any' types (use 'unknown' if needed)\n`;
      standards += `   - Proper interfaces for all props and state\n`;
    } else {
      standards += `   - Use TypeScript types for props\n`;
      standards += `   - Define clear interfaces\n`;
    }

    // TIER 2: Code Organization (IMPORTANT and above)
    if (criticality !== 'STANDARD') {
      standards += `\n2. Code Organization:\n`;
      standards += `   - Max ${requirements.maxLines || 200} lines per component\n`;
      standards += `   - Extract complex logic to custom hooks\n`;
      standards += `   - Clear, descriptive variable names\n`;

      if (criticality === 'CRITICAL' || criticality === 'ULTRA_CRITICAL') {
        standards += `   - Separate business logic from UI\n`;
        standards += `   - Single responsibility principle\n`;
      }
    }

    // TIER 3: Error Handling (CRITICAL and above)
    if (requirements.errorHandling || criticality === 'CRITICAL' || criticality === 'ULTRA_CRITICAL') {
      standards += `\n3. Error Handling:\n`;
      standards += `   - Try-catch for ALL async operations\n`;
      standards += `   - Fallback UI for all error states\n`;
      standards += `   - User-friendly error messages\n`;

      if (criticality === 'ULTRA_CRITICAL') {
        standards += `   - Error boundaries for component errors\n`;
        standards += `   - Comprehensive error logging\n`;
        standards += `   - Graceful degradation on failures\n`;
      }
    }

    // TIER 4: Accessibility (if required or CRITICAL+)
    if (requirements.accessibility || criticality === 'CRITICAL' || criticality === 'ULTRA_CRITICAL') {
      standards += `\n4. Accessibility:\n`;
      standards += `   - ARIA labels for interactive elements\n`;
      standards += `   - Alt text for all images\n`;
      standards += `   - Keyboard navigation support\n`;
      standards += `   - Semantic HTML elements\n`;
    }

    // TIER 5: Responsive Design (if required)
    if (requirements.responsive) {
      standards += `\n5. Responsive Design:\n`;
      standards += `   - Mobile-first approach\n`;
      standards += `   - Tailwind breakpoints (sm:, md:, lg:, xl:)\n`;
      standards += `   - Touch-friendly tap targets (min 44px)\n`;
    }

    // TIER 6: Loading States (if required)
    if (requirements.loadingStates) {
      standards += `\n6. Loading States:\n`;
      standards += `   - Loading indicators for async operations\n`;
      standards += `   - Skeleton screens for data fetching\n`;
      standards += `   - Disabled state for buttons during submission\n`;
    }

    // TIER 7: ULTRA_CRITICAL Security Best Practices
    if (criticality === 'ULTRA_CRITICAL') {
      standards += `\n7. SECURITY (ULTRA_CRITICAL):\n`;
      standards += `   - NEVER expose secrets or API keys in code\n`;
      standards += `   - Validate ALL user inputs (XSS prevention)\n`;
      standards += `   - Sanitize data before database operations (SQL injection prevention)\n`;
      standards += `   - Use parameterized queries, NEVER string concatenation\n`;
      standards += `   - Implement rate limiting for sensitive operations\n`;
      standards += `   - HTTPS only for auth/payment operations\n`;
      standards += `   - No sensitive data in console.log statements\n`;
      standards += `   - Implement CSRF protection for state-changing operations\n`;
      standards += `   - Use secure password hashing (bcrypt, argon2)\n`;
      standards += `   - Implement proper session management\n`;
    }

    // Output format (everyone gets this)
    standards += `\nOUTPUT FORMAT:\n`;
    standards += `Return a single, complete React component file including:\n`;
    standards += `- All necessary imports\n`;
    standards += `- TypeScript interfaces/types\n`;
    standards += `- Main component with proper props\n`;
    standards += `- All sub-components or helper functions\n`;
    standards += `- Default export\n`;
    standards += `- No TODO comments or placeholder code\n`;
    standards += `- Production-ready, copy-paste-able code\n`;

    // Add note about verification level
    const modelCount = {
      'ULTRA_CRITICAL': 7,
      'CRITICAL': 5,
      'IMPORTANT': 3,
      'STANDARD': 1
    }[criticality];

    standards += `\nNOTE: This ${criticality} component will be verified by ${modelCount} AI models for quality.\n`;
    standards += `Ensure code meets ALL standards above to pass consensus verification.\n`;

    return standards;
  }

  // Helper methods
  private static generateUserStories(component: ComponentContext, prd: PRDContext): string {
    const appType = this.inferAppType(prd.productIdea);
    const persona = this.inferUserPersona(prd.targetAudience || prd.productIdea);

    // Generate contextual user stories based on component type
    if (component.componentName.toLowerCase().includes('location')) {
      return `- As a ${persona}, I want to search for locations so I can plan my ${appType}
- As a ${persona}, I want to save favorite locations so I can quickly access them later
- As a ${persona}, I want to see location details (terrain, difficulty) so I can make informed decisions`;
    }

    if (component.componentName.toLowerCase().includes('task')) {
      return `- As a ${persona}, I want to assign tasks to group members so everyone knows their responsibilities
- As a ${persona}, I want to see who's assigned to what so I can track progress
- As a ${persona}, I want to mark tasks complete so the team sees real-time updates`;
    }

    if (component.componentName.toLowerCase().includes('weather')) {
      return `- As a ${persona}, I want to see current weather conditions so I can prepare appropriately
- As a ${persona}, I want to see 7-day forecasts so I can plan ahead
- As a ${persona}, I want weather alerts so I can avoid dangerous conditions`;
    }

    return `- As a ${persona}, I want to ${this.inferPrimaryAction(component)} so I can ${this.inferGoal(prd.productIdea)}`;
  }

  private static inferBrandPersonality(productIdea: string): string {
    const idea = productIdea.toLowerCase();

    if (idea.includes('off-road') || idea.includes('outdoor') || idea.includes('trail')) {
      return 'Adventurous, rugged, trustworthy, community-focused';
    }
    if (idea.includes('professional') || idea.includes('business') || idea.includes('enterprise')) {
      return 'Professional, reliable, efficient, modern';
    }
    if (idea.includes('creative') || idea.includes('design') || idea.includes('art')) {
      return 'Creative, inspiring, bold, innovative';
    }
    if (idea.includes('education') || idea.includes('learning') || idea.includes('teaching')) {
      return 'Friendly, encouraging, accessible, supportive';
    }

    return 'Modern, approachable, reliable, user-focused';
  }

  private static inferAppType(productIdea: string): string {
    const idea = productIdea.toLowerCase();
    if (idea.includes('trip') || idea.includes('travel')) return 'trip';
    if (idea.includes('event')) return 'event';
    if (idea.includes('project')) return 'project';
    if (idea.includes('task')) return 'tasks';
    return 'activity';
  }

  private static inferUserPersona(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('off-road') || lower.includes('outdoor')) return 'outdoor enthusiast';
    if (lower.includes('developer') || lower.includes('engineer')) return 'developer';
    if (lower.includes('designer')) return 'designer';
    if (lower.includes('manager')) return 'project manager';
    if (lower.includes('teacher') || lower.includes('student')) return 'educator';
    return 'user';
  }

  private static inferPrimaryAction(component: ComponentContext): string {
    const name = component.componentName.toLowerCase();
    if (name.includes('selector') || name.includes('picker')) return 'select options';
    if (name.includes('form')) return 'submit information';
    if (name.includes('list') || name.includes('table')) return 'view and manage items';
    if (name.includes('card')) return 'view detailed information';
    if (name.includes('modal') || name.includes('dialog')) return 'complete a focused task';
    return 'interact with this feature';
  }

  private static inferGoal(productIdea: string): string {
    const idea = productIdea.toLowerCase();
    if (idea.includes('plan')) return 'plan effectively';
    if (idea.includes('organize')) return 'stay organized';
    if (idea.includes('track')) return 'track progress';
    if (idea.includes('collaborate')) return 'work together';
    if (idea.includes('manage')) return 'manage efficiently';
    return 'accomplish my goals';
  }

  private static detectMobileApp(productIdea: string): boolean {
    const idea = productIdea.toLowerCase();
    return idea.includes('mobile') ||
           idea.includes('on-the-go') ||
           idea.includes('outdoor') ||
           idea.includes('off-road') ||
           idea.includes('field');
  }

  private static detectOfflineNeed(productIdea: string): boolean {
    const idea = productIdea.toLowerCase();
    return idea.includes('offline') ||
           idea.includes('remote') ||
           idea.includes('off-road') ||
           idea.includes('outdoor') ||
           idea.includes('no connectivity');
  }
}
