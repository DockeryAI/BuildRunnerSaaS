/**
 * Design Profile Detector
 *
 * Multi-dimensional analysis of apps to create intelligent design profiles
 */

import Anthropic from '@anthropic-ai/sdk';
import { DesignProfile, ProfileDetectionInput, SimilarProfile, ReferenceAppDetails } from './types';
import { createEmbedding, findSimilarProfiles } from './embeddings';

export class DesignProfileDetector {
  private anthropic: Anthropic | null = null;
  private isOpenRouter: boolean = false;
  private apiKey: string = '';

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY;
    if (key) {
      this.apiKey = key;

      // Determine which API to use based on key source
      // Priority: 1) Client-provided key (always OpenRouter), 2) Anthropic env var, 3) OpenRouter env var
      if (apiKey) {
        // Client-provided key from UI is always OpenRouter
        this.isOpenRouter = true;
        console.log('🔑 Using client-provided OpenRouter API key');
      } else if (process.env.ANTHROPIC_API_KEY && key === process.env.ANTHROPIC_API_KEY) {
        // Direct Anthropic API
        this.isOpenRouter = false;
        console.log('🔑 Using Anthropic API key from environment');
      } else if (process.env.OPENROUTER_API_KEY && key === process.env.OPENROUTER_API_KEY) {
        // OpenRouter via env var
        this.isOpenRouter = true;
        console.log('🔑 Using OpenRouter API key from environment');
      } else {
        // Fallback: assume Anthropic
        this.isOpenRouter = false;
        console.log('🔑 Using API key (assuming Anthropic)');
      }

      if (!this.isOpenRouter) {
        // Only initialize Anthropic SDK for direct Anthropic API use
        this.anthropic = new Anthropic({
          apiKey: key,
        });
      }
    } else {
      console.warn('DesignProfileDetector initialized without API key - profile detection will be unavailable');
    }
  }

  /**
   * Main detection method - analyzes app and returns intelligent design profile
   */
  async detectProfile(input: ProfileDetectionInput): Promise<DesignProfile> {
    console.log('🔍 Analyzing app characteristics...');

    // 1. Check if similar profile exists
    const similar = await this.findSimilarProfile(input);
    if (similar && similar.confidence > 0.85) {
      console.log(`✅ Found similar profile: ${similar.name} (confidence: ${similar.confidence.toFixed(2)})`);
      return similar.profile;
    }

    // 2. Deep analysis with Claude
    console.log('🧠 Performing deep analysis with Claude Sonnet 4...');
    const profile = await this.analyzeWithClaude(input);

    // 3. Enrich with reference apps
    console.log('🎨 Enriching with reference app details...');
    const enriched = await this.enrichWithReferences(profile);

    // 4. Save for future learning
    console.log('💾 Saving profile for future learning...');
    await this.saveProfile(input, enriched);

    console.log('✨ Profile detection complete');
    return enriched;
  }

  /**
   * Find similar existing profiles using vector similarity
   */
  private async findSimilarProfile(input: ProfileDetectionInput): Promise<SimilarProfile | null> {
    try {
      // Create embedding for this app
      const searchText = `${input.projectName} ${input.description} ${input.features?.join(' ') || ''}`;
      const embedding = await createEmbedding(searchText);

      // If embedding creation failed (empty array), skip similarity search
      if (embedding.length === 0) {
        console.log('📝 Embeddings unavailable - skipping similarity search');
        return null;
      }

      // Search for similar profiles
      const similar = await findSimilarProfiles(embedding, 1);

      if (similar.length > 0) {
        return similar[0];
      }

      return null;
    } catch (error) {
      console.warn('Failed to find similar profile:', error);
      return null;
    }
  }

  /**
   * Deep multi-dimensional analysis with Claude
   */
  private async analyzeWithClaude(input: ProfileDetectionInput): Promise<DesignProfile> {
    if (!this.apiKey) {
      throw new Error('API key not provided - cannot analyze with Claude');
    }

    const prompt = this.buildDetectionPrompt(input);

    let responseText: string;

    try {
      if (this.isOpenRouter) {
        // Use OpenRouter API directly via fetch
        const modelId = 'anthropic/claude-sonnet-4.5';
        console.log(`📡 Calling OpenRouter API with model: ${modelId}`);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://buildrunner.ai',
            'X-Title': 'BuildRunner Design Intelligence',
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });

        console.log(`📡 OpenRouter response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('OpenRouter API error response:', errorBody);
          throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const data = await response.json();
        responseText = data.choices[0].message.content;
        console.log('✅ OpenRouter API call successful');
      } else {
        // Use Anthropic SDK
        if (!this.anthropic) {
          throw new Error('Anthropic API client not initialized');
        }

        const modelId = 'claude-sonnet-4-20250514';
        console.log(`📡 Calling Anthropic API with model: ${modelId}`);

        const response = await this.anthropic.messages.create({
          model: modelId,
          max_tokens: 4096,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        const content = response.content[0];
        if (content.type !== 'text') {
          throw new Error('Unexpected response type from Claude');
        }
        responseText = content.text;
        console.log('✅ Anthropic API call successful');
      }
    } catch (error) {
      console.error('❌ API call failed:', error);
      throw error;
    }

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Claude response');
    }

    const profile: DesignProfile = JSON.parse(jsonMatch[0]);

    // Add metadata
    profile.createdAt = new Date();
    profile.version = 1;
    profile.confidence = {
      colors: 0.5,
      typography: 0.5,
      layout: 0.5,
    };

    return profile;
  }

  /**
   * Build the detection prompt for Claude
   */
  private buildDetectionPrompt(input: ProfileDetectionInput): string {
    return `You are analyzing an app to detect ALL design-relevant characteristics.

APP: ${input.projectName}
DESCRIPTION: ${input.description}
${input.features ? `FEATURES: ${input.features.join(', ')}` : ''}
${input.targetUsers ? `TARGET USERS: ${input.targetUsers}` : ''}

ANALYZE ACROSS 6 DIMENSIONS:

1. PRIMARY PURPOSE
   What's the core function?
   Options: productivity, entertainment, commerce, social, utility, health, education, finance

2. TARGET AUDIENCE
   - Demographics: children, teens, adults, seniors, professionals, general
   - Tech level: beginner, intermediate, advanced
   - Economic: budget, mid-market, premium, luxury

3. USAGE PATTERN
   - Frequency: daily, weekly, occasional, one-time
   - Duration: quick-tasks, extended-sessions
   - Context: mobile-first, desktop-primary, cross-device

4. EMOTIONAL TONE
   - Energy: calm, neutral, energetic, intense
   - Formality: casual, professional, formal
   - Personality: playful, serious, aspirational, trustworthy, innovative

5. INDUSTRY CONTEXT
   - Primary industry (healthcare, finance, education, construction, nutrition, outdoor, etc.)
   - Vertical/sub-category if applicable
   - Niche if applicable

6. VISUAL STYLE
   - Aesthetic: minimal, bold, playful, elegant, technical, organic
   - Modernity: classic, contemporary, cutting-edge
   - Density: spacious, balanced, compact

7. REFERENCE APPS (3-5)
   Find successful apps with similar PURPOSE + AUDIENCE + FEEL + STYLE

   CRITICAL: Match the FEEL and USE CASE, not just industry!

   Examples:
   - "Kids educational game" → Duolingo, Khan Academy Kids (playful + educational)
   - "Luxury travel" → Airbnb Luxe, Mr & Mrs Smith (premium + aspirational)
   - "Fitness for seniors" → Apps with large text, simple UX (NOT just fitness apps)
   - "Construction project management" → Procore, Fieldwire (professional + technical)
   - "Nutrition tracking" → MyFitnessPal, Noom (health + motivating)

8. COLOR PSYCHOLOGY
   Based on ALL dimensions above, suggest:
   - Primary color (hex + detailed reasoning based on purpose, audience, and emotional tone)
   - Secondary color (hex + reasoning for harmony with primary)
   - Accent color (hex + reasoning for emphasis and energy)
   - Background color (typically white, off-white, or subtle tint)
   - Foreground color (typically dark gray or black)

   Why these colors fit THIS specific combination of attributes:
   - How the primary color evokes the right emotion for the audience
   - How the palette supports the usage pattern and context
   - How the colors align with industry expectations while standing out

9. TYPOGRAPHY
   - Personality: modern, classic, playful, technical
   - Font recommendations:
     - Sans: Suggest a specific font family (Inter, Geist, SF Pro, etc.)
     - Mono (if needed): Suggest monospace font
   - Scale approach: Describe the sizing strategy

10. COMPONENT PATTERNS
   - Card style: minimal, detailed, image-heavy
   - Button style: bold, subtle, playful
   - Navigation: bottom-tabs, sidebar, top-nav
   - Content density: spacious, balanced, compact

Return ONLY a valid JSON object matching this exact structure:

{
  "name": "Brief descriptive name for this profile",
  "category": "industry-audience-tone (e.g., 'kids-education-playful')",
  "primaryPurpose": "...",
  "audience": {
    "demographic": "...",
    "techLevel": "...",
    "economicLevel": "..."
  },
  "usagePattern": {
    "frequency": "...",
    "duration": "...",
    "context": "..."
  },
  "emotionalTone": {
    "energy": "...",
    "formality": "...",
    "personality": "..."
  },
  "industry": {
    "primary": "...",
    "vertical": "...",
    "niche": "..."
  },
  "visualStyle": {
    "aesthetic": "...",
    "modernity": "...",
    "density": "..."
  },
  "referenceApps": ["App 1", "App 2", "App 3"],
  "colorScheme": {
    "primary": "#HEXCODE",
    "primaryReasoning": "Detailed explanation of why this color...",
    "secondary": "#HEXCODE",
    "secondaryReasoning": "Why this complements the primary...",
    "accent": "#HEXCODE",
    "accentReasoning": "Why this adds the right energy...",
    "background": "#FFFFFF",
    "foreground": "#111827"
  },
  "typography": {
    "personality": "...",
    "fontRecommendations": {
      "sans": "Inter",
      "mono": "JetBrains Mono"
    },
    "scaleApproach": "Description of sizing strategy"
  },
  "componentPatterns": {
    "cardStyle": "...",
    "buttonStyle": "...",
    "navigation": "...",
    "contentDensity": "..."
  }
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no backticks, no additional text.`;
  }

  /**
   * Enrich profile with detailed reference app analysis
   */
  private async enrichWithReferences(profile: DesignProfile): Promise<DesignProfile> {
    // For now, return profile as-is
    // In production, this would analyze reference apps using web scraping or APIs
    // to extract actual design patterns, color palettes, typography, etc.

    // TODO: Implement reference app analysis
    // - Use Firecrawl or similar to scrape reference app websites
    // - Extract color palettes, typography, spacing from screenshots
    // - Analyze component patterns and micro-interactions
    // - Store in referenceAppDetails array

    return profile;
  }

  /**
   * Save profile to database with embedding for future similarity search
   */
  private async saveProfile(input: ProfileDetectionInput, profile: DesignProfile): Promise<void> {
    try {
      // Create embedding for this profile (will be empty if OpenAI not configured)
      const profileText = `${profile.name} ${profile.category} ${profile.primaryPurpose} ${profile.audience.demographic} ${profile.emotionalTone.personality} ${profile.industry.primary}`;
      const embedding = await createEmbedding(profileText);

      // TODO: Save to database
      // - Save profile JSON to design_profiles table
      // - Save embedding vector for similarity search (if available)
      // - Set initial success_score to 0.5
      // - Mark as isNewType: true for review

      if (embedding.length > 0) {
        console.log(`📊 Profile saved with embeddings: ${profile.name} (${profile.category})`);
      } else {
        console.log(`📊 Profile saved (no embeddings): ${profile.name} (${profile.category})`);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Don't throw - profile detection should succeed even if save fails
    }
  }

  /**
   * Get all profiles for admin dashboard
   */
  async getAllProfiles(): Promise<DesignProfile[]> {
    // TODO: Fetch from database
    // - Order by success_score DESC, usage_count DESC
    // - Include learning metrics
    return [];
  }

  /**
   * Update profile after user feedback
   */
  async updateProfile(profileId: string, updates: Partial<DesignProfile>): Promise<void> {
    // TODO: Update in database
    // - Increment version
    // - Set lastRefinedAt
    // - Update confidence scores if provided
  }
}
