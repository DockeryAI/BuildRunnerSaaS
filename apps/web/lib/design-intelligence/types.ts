/**
 * Intelligent Design System - Type Definitions
 *
 * Multi-dimensional design profiling for contextual, purposeful designs
 */

export interface DesignProfile {
  // Unique identifier
  id?: string;
  name?: string;
  category?: string;

  // WHAT (Primary Purpose)
  primaryPurpose: 'productivity' | 'entertainment' | 'commerce' | 'social' | 'utility' | 'health' | 'education' | 'finance';

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
    vertical?: string; // 'telemedicine', 'investment', 'k-12', etc.
    niche?: string; // 'pediatric urgent care', 'robo-advisor', 'homeschool', etc.
  };

  // STYLE (Visual Language)
  visualStyle: {
    aesthetic: 'minimal' | 'bold' | 'playful' | 'elegant' | 'technical' | 'organic';
    modernity: 'classic' | 'contemporary' | 'cutting-edge';
    density: 'spacious' | 'balanced' | 'compact';
  };

  // Reference apps that match THE FEEL
  referenceApps: string[];
  referenceAppDetails?: ReferenceAppDetails[];

  // Design specifications
  colorScheme: {
    primary: string;
    primaryReasoning: string;
    secondary: string;
    secondaryReasoning: string;
    accent: string;
    accentReasoning: string;
    background: string;
    foreground: string;
  };

  typography: {
    personality: 'modern' | 'classic' | 'playful' | 'technical';
    fontRecommendations: {
      sans: string;
      mono?: string;
    };
    scaleApproach: string;
  };

  componentPatterns: {
    cardStyle: 'minimal' | 'detailed' | 'image-heavy';
    buttonStyle: 'bold' | 'subtle' | 'playful';
    navigation: 'bottom-tabs' | 'sidebar' | 'top-nav';
    contentDensity: 'spacious' | 'balanced' | 'compact';
  };

  // Learning metrics
  confidence?: {
    colors?: number;
    typography?: number;
    layout?: number;
  };

  // Metadata
  isNewType?: boolean;
  needsReview?: boolean;
  version?: number;
  createdAt?: Date;
  lastRefinedAt?: Date;
  lastUsedAt?: Date;
}

export interface ReferenceAppDetails {
  name: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    weights: number[];
    scale: string;
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  componentStyles: {
    buttons: string;
    cards: string;
    forms: string;
  };
  microInteractions: string[];
  layoutPatterns: string[];
  visualHierarchy: string;
  darkMode: string;
}

export interface ProfileDetectionInput {
  projectName: string;
  description: string;
  features?: string[];
  targetUsers?: string;
}

export interface SimilarProfile {
  profile: DesignProfile;
  name: string;
  confidence: number;
}

export interface DesignFeedback {
  projectId: string;
  profileId: string;
  userRating: number; // 1-10
  changes: string[]; // What did user modify?
  kept: string[]; // What did user keep?
  timeToFirstEdit: number; // Seconds
}

export interface LearningInsights {
  colorSuccess: boolean;
  typographySuccess: boolean;
  layoutSuccess: boolean;
  colorAdjustments?: Partial<DesignProfile['colorScheme']>;
  typographyAdjustments?: Partial<DesignProfile['typography']>;
  layoutAdjustments?: Partial<DesignProfile['componentPatterns']>;
  recommendations: string[];
}
