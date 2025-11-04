/**
 * Design Intelligence System
 * Automatically generates industry-specific, production-quality design systems
 * using AI-powered design knowledge and modern design patterns.
 */

import { DesignSpec } from './design-system-generator';

export interface IndustryPattern {
  inspiration: string[];
  colorSchemes: {
    primary: string[];
    vibe: string;
  };
  components: string[];
  layoutPatterns: string[];
  navigationStyle: 'sidebar' | 'topnav' | 'tabs' | 'command-palette';
}

export interface PRD {
  projectName: string;
  description: string;
  industry?: string;
  targetAudience?: string;
  brandPersonality?: string;
}

export class DesignIntelligence {
  private apiKey: string;

  // Industry-specific design knowledge base
  private industryPatterns: Record<string, IndustryPattern> = {
    'saas': {
      inspiration: ['Linear', 'Notion', 'Figma', 'Stripe Dashboard'],
      colorSchemes: {
        primary: ['indigo', 'purple', 'blue', 'violet'],
        vibe: 'clean, minimal, professional, sophisticated'
      },
      components: ['dashboard', 'sidebar', 'command-palette', 'data-tables', 'kanban'],
      layoutPatterns: ['sidebar-layout', 'full-width-dashboard', 'split-view'],
      navigationStyle: 'sidebar'
    },

    'ecommerce': {
      inspiration: ['Shopify', 'Square', 'Stripe Checkout', 'Apple Store'],
      colorSchemes: {
        primary: ['emerald', 'teal', 'green', 'blue'],
        vibe: 'trustworthy, vibrant, actionable, conversion-focused'
      },
      components: ['product-cards', 'cart', 'checkout', 'reviews', 'gallery'],
      layoutPatterns: ['grid-layout', 'product-detail', 'checkout-flow'],
      navigationStyle: 'topnav'
    },

    'travel': {
      inspiration: ['Airbnb', 'Booking.com', 'Expedia', 'AllTrails'],
      colorSchemes: {
        primary: ['rose', 'orange', 'amber', 'emerald'],
        vibe: 'adventurous, warm, inviting, experiential'
      },
      components: ['hero-search', 'map-view', 'booking-cards', 'galleries', 'reviews'],
      layoutPatterns: ['hero-with-search', 'map-sidebar', 'card-grid'],
      navigationStyle: 'topnav'
    },

    'outdoor': {
      inspiration: ['AllTrails', 'REI', 'Patagonia', 'The North Face'],
      colorSchemes: {
        primary: ['emerald', 'teal', 'forest', 'mountain-blue'],
        vibe: 'rugged, adventurous, reliable, nature-inspired'
      },
      components: ['trail-cards', 'map-view', 'weather-widget', 'trip-planner', 'gear-list'],
      layoutPatterns: ['map-centric', 'card-grid', 'detail-sidebar'],
      navigationStyle: 'topnav'
    },

    'finance': {
      inspiration: ['Stripe', 'Plaid', 'Robinhood', 'Mercury'],
      colorSchemes: {
        primary: ['indigo', 'blue', 'emerald', 'violet'],
        vibe: 'trustworthy, secure, precise, data-driven'
      },
      components: ['dashboard', 'charts', 'transactions', 'account-cards', 'analytics'],
      layoutPatterns: ['dashboard-grid', 'sidebar-layout', 'data-heavy'],
      navigationStyle: 'sidebar'
    },

    'social': {
      inspiration: ['Twitter', 'Discord', 'Linear', 'GitHub'],
      colorSchemes: {
        primary: ['blue', 'purple', 'pink', 'orange'],
        vibe: 'engaging, conversational, dynamic, community-focused'
      },
      components: ['feed', 'chat', 'profile', 'notifications', 'activity-stream'],
      layoutPatterns: ['three-column', 'feed-centric', 'chat-layout'],
      navigationStyle: 'sidebar'
    },

    'productivity': {
      inspiration: ['Notion', 'Linear', 'Airtable', 'Cron'],
      colorSchemes: {
        primary: ['indigo', 'violet', 'blue', 'gray'],
        vibe: 'focused, efficient, organized, minimal-distraction'
      },
      components: ['kanban', 'calendar', 'tables', 'notes', 'command-palette'],
      layoutPatterns: ['canvas-layout', 'sidebar-layout', 'split-view'],
      navigationStyle: 'sidebar'
    },

    'default': {
      inspiration: ['Linear', 'Vercel', 'GitHub', 'Stripe'],
      colorSchemes: {
        primary: ['indigo', 'blue', 'purple', 'violet'],
        vibe: 'modern, clean, professional, sophisticated'
      },
      components: ['dashboard', 'cards', 'forms', 'tables', 'modals'],
      layoutPatterns: ['centered', 'sidebar-layout', 'full-width'],
      navigationStyle: 'topnav'
    }
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Detect industry from PRD description using keywords
   */
  private detectIndustry(prd: PRD): string {
    if (prd.industry) return prd.industry.toLowerCase();

    const description = (prd.projectName + ' ' + prd.description).toLowerCase();

    const keywords: Record<string, string[]> = {
      'saas': ['saas', 'dashboard', 'analytics', 'workspace', 'team', 'collaboration'],
      'ecommerce': ['shop', 'store', 'cart', 'checkout', 'product', 'ecommerce', 'marketplace'],
      'travel': ['travel', 'booking', 'hotel', 'flight', 'trip', 'vacation', 'tourism'],
      'outdoor': ['trail', 'hiking', 'camping', 'outdoor', 'adventure', 'off-road', 'wilderness'],
      'finance': ['finance', 'banking', 'payment', 'money', 'transaction', 'wallet', 'trading'],
      'social': ['social', 'chat', 'messaging', 'community', 'feed', 'post', 'friend'],
      'productivity': ['task', 'todo', 'note', 'project', 'kanban', 'calendar', 'organize']
    };

    for (const [industry, terms] of Object.entries(keywords)) {
      if (terms.some(term => description.includes(term))) {
        console.log(`🎯 Detected industry: ${industry}`);
        return industry;
      }
    }

    return 'default';
  }

  /**
   * Generate complete design system using AI with industry intelligence
   */
  async generateDesignSystem(prd: PRD): Promise<DesignSpec> {
    const industry = this.detectIndustry(prd);
    const pattern = this.industryPatterns[industry] || this.industryPatterns.default;

    console.log(`🎨 Generating ${industry} design system for: ${prd.projectName}`);
    console.log(`📚 Inspired by: ${pattern.inspiration.join(', ')}`);

    const prompt = this.buildDesignPrompt(prd, pattern);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://buildrunner.cloud',
          'X-Title': 'BuildRunner - Design Intelligence',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4',
          messages: [{
            role: 'system',
            content: `You are a world-class product designer who has worked at Linear, Stripe, Vercel, and Apple.

When generating designs, you ALWAYS:
1. Start with a cohesive design system
2. Use modern design patterns (glass morphism, subtle gradients, micro-animations)
3. Create visual hierarchy through size, weight, and color
4. Apply the 60-30-10 color rule
5. Use negative space effectively
6. Ensure dark mode looks amazing

Output ONLY valid JSON with exact hex color values and specific measurements.`
          }, {
            role: 'user',
            content: prompt
          }],
          temperature: 0.7, // Higher for creative design decisions
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Design generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const designContent = data.choices[0].message.content;

      // Extract JSON from response
      const jsonMatch = designContent.match(/```json\n([\s\S]+?)\n```/) ||
                       designContent.match(/\{[\s\S]+\}/);

      if (jsonMatch) {
        const designSpec = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        console.log('✅ Design system generated:', designSpec.visualStyle);
        return this.enhanceDesignSpec(designSpec, industry);
      }

      throw new Error('Could not parse design specification from AI response');

    } catch (error) {
      console.error('Design system generation failed:', error);
      // Return industry-appropriate fallback
      return this.getFallbackDesign(industry);
    }
  }

  private buildDesignPrompt(prd: PRD, pattern: IndustryPattern): string {
    return `Create a complete design system for a ${pattern.colorSchemes.vibe} application called "${prd.projectName}".

**Project Description:**
${prd.description}

**Design Inspiration:** ${pattern.inspiration.join(', ')}
**Brand Personality:** ${pattern.colorSchemes.vibe}
**Target Audience:** ${prd.targetAudience || 'Modern tech-savvy users'}

Generate a cohesive design system that will make this app look AMAZING. Think carefully about:
- Color harmony and contrast
- The product's target audience
- Modern 2024 design trends
- Accessibility (WCAG AA minimum)

**CRITICAL REQUIREMENTS:**

1. **COLOR PALETTE** (use exact hex values):
   - background (both dark and light mode)
   - surface (cards, panels - slightly different from background)
   - primary (main brand color - choose from: ${pattern.colorSchemes.primary.join(', ')})
   - primaryForeground (text on primary color)
   - secondary (supporting color)
   - secondaryForeground
   - accent (highlights, CTAs - should pop!)
   - accentForeground
   - muted (subtle backgrounds)
   - mutedForeground (subtle text)
   - border (dividers, outlines)
   - ring (focus rings)
   - foreground (main text color)
   - destructive (errors, delete actions)
   - destructiveForeground

2. **TYPOGRAPHY:**
   - fontFamily (use modern system fonts like Inter, SF Pro, or similar)
   - Type scale (xs through 4xl with rem values)
   - Font weights (normal: 400, medium: 500, semibold: 600, bold: 700)

3. **SPACING SYSTEM:**
   - Base unit (4 or 8)
   - Scale array (e.g., [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16])

4. **DESIGN TOKENS:**
   - Border radius values (sm, md, lg, xl, full)
   - Shadow definitions (sm, md, lg, xl) with color-tinted shadows
   - Blur values for glass morphism

5. **COMPONENT PATTERNS:**
   - Navigation style: "${pattern.navigationStyle}"
   - Layout approach: "${pattern.layoutPatterns[0]}"
   - Card style: "elevated" (with subtle shadows)

6. **VISUAL STYLE:**
   Choose from: "modern-minimal", "bold-colorful", "elegant-corporate", or "playful-friendly"

Output ONLY valid JSON matching this structure:

\`\`\`json
{
  "visualStyle": "modern-minimal",
  "colorPalette": {
    "primary": "#6366F1",
    "primaryForeground": "#FFFFFF",
    ...all colors as hex values
  },
  "typography": {
    "fontFamily": {
      "sans": "Inter, system-ui, sans-serif",
      "mono": "JetBrains Mono, monospace"
    },
    "scale": {
      "xs": "0.75rem",
      ...all sizes
    },
    "weights": {
      "normal": 400,
      ...all weights
    }
  },
  "designTokens": {
    "spacing": {
      "unit": 4,
      "scale": [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16]
    },
    "borderRadius": {
      "sm": "0.25rem",
      ...all radius values
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      ...all shadow definitions
    }
  },
  "componentPatterns": {
    "navigation": "${pattern.navigationStyle}",
    "layout": "${pattern.layoutPatterns[0]}",
    "cardStyle": "elevated"
  },
  "inspiration": ${JSON.stringify(pattern.inspiration)}
}
\`\`\``;
  }

  private enhanceDesignSpec(spec: any, industry: string): DesignSpec {
    return {
      ...spec,
      generatedAt: new Date().toISOString(),
      industry,
    };
  }

  private getFallbackDesign(industry: string): DesignSpec {
    // Return industry-appropriate fallback from our presets
    const pattern = this.industryPatterns[industry] || this.industryPatterns.default;

    return {
      visualStyle: 'modern-minimal',
      colorPalette: {
        primary: industry === 'outdoor' ? '#10B981' : '#6366F1',
        primaryForeground: '#FFFFFF',
        secondary: '#8B5CF6',
        secondaryForeground: '#FFFFFF',
        accent: industry === 'outdoor' ? '#F59E0B' : '#8B5CF6',
        accentForeground: '#FFFFFF',
        muted: '#F3F4F6',
        mutedForeground: '#6B7280',
        background: '#FFFFFF',
        foreground: '#111827',
        border: '#E5E7EB',
        ring: industry === 'outdoor' ? '#10B981' : '#6366F1',
        destructive: '#EF4444',
        destructiveForeground: '#FFFFFF',
      },
      typography: {
        fontFamily: {
          sans: 'Inter, system-ui, sans-serif',
          mono: 'JetBrains Mono, monospace',
        },
        scale: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        weights: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      },
      designTokens: {
        spacing: {
          unit: 4,
          scale: [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16],
        },
        borderRadius: {
          sm: '0.25rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        },
      },
      componentPatterns: {
        navigation: pattern.navigationStyle,
        layout: pattern.layoutPatterns[0] as any,
        cardStyle: 'elevated',
      },
      inspiration: pattern.inspiration,
      generatedAt: new Date().toISOString(),
    };
  }
}
