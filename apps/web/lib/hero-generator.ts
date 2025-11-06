/**
 * Hero Section Generator
 * Generates stunning, professional hero sections for splash pages
 * with advanced animations, gradients, and modern design patterns.
 */

import { getAdvancedDesignSystem } from './advanced-design-system';

export interface HeroSpec {
  projectName: string;
  purpose: string;
  tagline?: string;
  features?: string[];
}

export class HeroGenerator {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate a stunning hero section component
   */
  async generateHero(spec: HeroSpec): Promise<string> {
    console.log(`🎨 Generating hero section for: ${spec.projectName}`);

    const advancedDesign = getAdvancedDesignSystem(spec.purpose);
    const { palette, motifs } = advancedDesign;

    const prompt = this.buildHeroPrompt(spec, palette, motifs);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://buildrunner.cloud',
          'X-Title': 'BuildRunner - Hero Generator',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{
            role: 'system',
            content: this.getHeroSystemPrompt()
          }, {
            role: 'user',
            content: prompt
          }],
          temperature: 0.4,
          max_tokens: 24000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Hero generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      let code = data.choices[0].message.content;

      // Strip markdown code fences
      code = code.replace(/^```(?:typescript|tsx|jsx|javascript)?\\n/gm, '');
      code = code.replace(/\\n```$/gm, '');
      code = code.trim();

      console.log(`✅ Generated hero section for ${spec.projectName}`);

      return code;
    } catch (error) {
      console.error(`Hero generation failed:`, error);
      throw error;
    }
  }

  private getHeroSystemPrompt(): string {
    return `You are an expert React developer who specializes in creating STUNNING hero sections for premium web applications.

Your hero sections are inspired by:
- Stripe Homepage (gradient animations, floating elements)
- Vercel Homepage (dark, minimalist, powerful)
- Linear Homepage (smooth animations, perfect typography)
- Framer Homepage (beautiful gradients, motion design)
- Airbnb (large imagery, welcoming design)

CRITICAL HERO SECTION REQUIREMENTS:

1. **ALWAYS Full-Screen Hero:**
   - min-h-screen to fill viewport
   - Centered content with flexbox
   - Dramatic visual impact

2. **Animated Background:**
   - Gradient mesh or animated gradient
   - Subtle particle effects or floating shapes
   - Parallax scrolling elements
   - Ambient animations

3. **Typography Excellence:**
   - HUGE headline (text-6xl md:text-7xl lg:text-8xl)
   - Perfect letter spacing (tracking-tight)
   - Gradient text effects
   - Smooth fade-in animations

4. **Premium Visual Elements:**
   - Glassmorphic cards with backdrop-blur
   - Floating elements with subtle animations
   - Gradient borders
   - Color-tinted shadows
   - Micro-interactions on hover

5. **Call-to-Action:**
   - Large, prominent CTA button
   - Secondary action button (ghost style)
   - Clear visual hierarchy
   - Hover animations

6. **Motion & Animation:**
   - Stagger fade-in for text elements
   - Floating animation for decorative elements
   - Smooth scroll indicators
   - Interactive hover states

7. **Responsive Design:**
   - Mobile-first approach
   - Adapts typography for small screens
   - Maintains visual impact on all devices

8. **Dark Theme Default:**
   - Dark, rich background
   - High contrast text
   - Glowing accents
   - Premium feel

COMPONENT STRUCTURE:

\`\`\`typescript
'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Sparkles, Zap } from 'lucide-react' // Use relevant icons

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'GRADIENT_HERE'
        }}
      />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Add floating shapes, particles, or decorative elements */}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col items-center justify-center">
        {/* Badge or tagline */}
        <div className="glassmorphic badge with animation">
          ...
        </div>

        {/* Massive headline with animation */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-center tracking-tight">
          ...with gradient text...
        </h1>

        {/* Supporting text */}
        <p className="text-xl md:text-2xl text-center max-w-3xl">
          ...
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <button className="large primary button with gradient">...</button>
          <button className="large ghost button">...</button>
        </div>

        {/* Optional: Features preview cards */}
        <div className="grid grid-cols-3 gap-6 glassmorphic cards">
          ...
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        ...
      </div>
    </section>
  )
}

export default HeroSection
\`\`\`

Return ONLY the complete hero component code, no explanations.`;
  }

  private buildHeroPrompt(spec: HeroSpec, palette: any, motifs: any): string {
    const tagline = spec.tagline || \`The future of \${spec.projectName}\`;
    const features = spec.features || [
      'Fast & Reliable',
      'Modern Design',
      'Easy to Use'
    ];

    return `Create a STUNNING, full-screen hero section for this project:

**Project Name:** ${spec.projectName}
**Purpose:** ${spec.purpose}
**Tagline:** ${tagline}
**Key Features:** ${features.join(', ')}

**COLOR PALETTE:**
Use these EXACT colors:
- Primary: ${palette.colors.primary}
- Secondary: ${palette.colors.secondary}
- Accent: ${palette.colors.accent}
- Background: ${palette.colors.background.base}
- Text Primary: ${palette.colors.text.primary}
- Text Secondary: ${palette.colors.text.secondary}

**HERO GRADIENT BACKGROUND:**
Use this as the main background gradient:
style={{ background: '${palette.gradients.hero}' }}

**BUTTON GRADIENT:**
Use this for the primary CTA button:
style={{ background: '${palette.gradients.button}' }}

**GLASSMORPHIC ELEMENTS:**
Use these classes: ${motifs.glassmorphism.classes}

**REQUIRED ELEMENTS:**

1. **Animated Badge/Tagline** at the top:
   - Small, subtle, glassmorphic
   - Contains a short tagline or version number
   - Fade-in animation
   - Icon from lucide-react

2. **Massive Headline:**
   - Project name or value proposition
   - Text gradient using primary and secondary colors
   - text-6xl md:text-7xl lg:text-8xl
   - Stagger fade-in animation
   - Letter spacing: tracking-tight

3. **Supporting Paragraph:**
   - 1-2 sentences about the purpose
   - text-xl md:text-2xl
   - max-w-3xl centered
   - Subtle fade-in animation

4. **Two CTA Buttons:**
   - Primary: Large, gradient background, with icon
   - Secondary: Large, ghost style (transparent with border)
   - Both with hover animations

5. **Feature Cards (Optional):**
   - 3 glassmorphic cards below CTAs
   - Each with icon, title, description
   - Grid layout
   - Hover animations

6. **Floating Decorative Elements:**
   - Abstract shapes or icons
   - Subtle floating animations
   - Positioned absolutely
   - Blur effects

7. **Scroll Indicator:**
   - At bottom center
   - Animated bounce
   - Arrow or chevron icon
   - Subtle, not distracting

**ANIMATIONS:**
- All text elements fade in with stagger
- Floating elements with subtle movement
- Buttons scale on hover
- Cards lift on hover
- Smooth transitions everywhere

Make this hero section absolutely STUNNING - like a $100k custom website. Professional, modern, and visually impressive.`;
  }

  /**
   * Generate a simple fallback hero if AI generation fails
   */
  generateFallbackHero(spec: HeroSpec): string {
    const advancedDesign = getAdvancedDesignSystem(spec.purpose);
    const { palette } = advancedDesign;

    return \`'use client'

import { ArrowRight, Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: '\${palette.gradients.hero}'
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[\${palette.colors.accent}]" />
          <span className="text-sm font-medium text-white">\${spec.tagline || 'Welcome'}</span>
        </div>

        {/* Headline */}
        <h1
          className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-fade-in"
          style={{
            background: \`linear-gradient(135deg, \${palette.colors.primary} 0%, \${palette.colors.secondary} 100%)\`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          \${spec.projectName}
        </h1>

        {/* Description */}
        <p className="text-xl md:text-2xl text-[\${palette.colors.text.secondary}] max-w-3xl mx-auto mb-12 animate-fade-in">
          \${spec.purpose}
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center animate-fade-in">
          <button
            className="px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2"
            style={{ background: '\${palette.gradients.button}' }}
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            className="px-8 py-4 rounded-2xl font-semibold text-white border-2 border-white/20 backdrop-blur-xl bg-white/5 transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1 h-3 rounded-full bg-white/40" />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
\`;
  }
}
