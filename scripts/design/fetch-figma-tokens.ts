#!/usr/bin/env tsx

/**
 * Fetch Figma Design Tokens Script
 * Extracts design tokens from Figma and normalizes them for BuildRunner
 */

import { createHash } from 'crypto';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createFigmaClient, DesignToken } from '../../apps/web/lib/figma/client';

interface TokenCollection {
  version: string;
  timestamp: string;
  checksum: string;
  figmaFileId: string;
  figmaProjectId: string;
  tokens: {
    colors: Record<string, DesignToken>;
    typography: Record<string, DesignToken>;
    spacing: Record<string, DesignToken>;
    radius: Record<string, DesignToken>;
    shadows: Record<string, DesignToken>;
  };
  metadata: {
    totalTokens: number;
    lastSync: string;
    figmaVersion?: string;
  };
}

class TokenNormalizer {
  /**
   * Normalize token name for CSS/Tailwind usage
   */
  static normalizeTokenName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Categorize token based on name and type
   */
  static categorizeToken(token: DesignToken): keyof TokenCollection['tokens'] {
    const name = token.name.toLowerCase();
    
    if (token.type === 'color' || name.includes('color') || name.includes('bg') || name.includes('text')) {
      return 'colors';
    }
    
    if (token.type === 'typography' || name.includes('font') || name.includes('text-size')) {
      return 'typography';
    }
    
    if (token.type === 'spacing' || name.includes('space') || name.includes('gap') || name.includes('margin') || name.includes('padding')) {
      return 'spacing';
    }
    
    if (token.type === 'radius' || name.includes('radius') || name.includes('rounded')) {
      return 'radius';
    }
    
    if (token.type === 'shadow' || name.includes('shadow') || name.includes('elevation')) {
      return 'shadows';
    }
    
    // Default to colors for unknown types
    return 'colors';
  }

  /**
   * Normalize token value for CSS usage
   */
  static normalizeTokenValue(token: DesignToken): string | number {
    if (token.type === 'color') {
      // Ensure hex colors are properly formatted
      const value = String(token.value);
      if (value.startsWith('#')) {
        return value.toLowerCase();
      }
      return value;
    }
    
    if (token.type === 'spacing' || token.type === 'radius') {
      // Convert to rem if it's a pixel value
      const value = String(token.value);
      if (value.endsWith('px')) {
        const pixels = parseFloat(value);
        return `${pixels / 16}rem`;
      }
      return value;
    }
    
    return token.value;
  }
}

async function fetchFigmaTokens(): Promise<TokenCollection> {
  console.log('🎨 Fetching design tokens from Figma...');
  
  // Validate environment variables
  const figmaToken = process.env.FIGMA_TOKEN;
  const figmaFileId = process.env.FIGMA_FILE_ID;
  const figmaProjectId = process.env.FIGMA_PROJECT_ID;
  
  if (!figmaToken || !figmaFileId || !figmaProjectId) {
    throw new Error('Missing required Figma environment variables. Please check FIGMA_TOKEN, FIGMA_FILE_ID, and FIGMA_PROJECT_ID.');
  }

  try {
    // Create Figma client
    const figmaClient = createFigmaClient();
    
    // Extract design tokens
    console.log(`📥 Extracting tokens from file: ${figmaFileId}`);
    const rawTokens = await figmaClient.extractDesignTokens(figmaFileId);
    
    console.log(`✅ Found ${rawTokens.length} raw tokens`);
    
    // Initialize token collection
    const tokenCollection: TokenCollection = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      checksum: '',
      figmaFileId,
      figmaProjectId,
      tokens: {
        colors: {},
        typography: {},
        spacing: {},
        radius: {},
        shadows: {},
      },
      metadata: {
        totalTokens: 0,
        lastSync: new Date().toISOString(),
      },
    };

    // Process and categorize tokens
    for (const rawToken of rawTokens) {
      const normalizedName = TokenNormalizer.normalizeTokenName(rawToken.name);
      const category = TokenNormalizer.categorizeToken(rawToken);
      const normalizedValue = TokenNormalizer.normalizeTokenValue(rawToken);
      
      const processedToken: DesignToken = {
        ...rawToken,
        name: normalizedName,
        value: normalizedValue,
      };
      
      tokenCollection.tokens[category][normalizedName] = processedToken;
    }

    // Add some default tokens if none found
    if (rawTokens.length === 0) {
      console.log('⚠️  No tokens found in Figma, adding default tokens...');
      
      // Default color tokens
      tokenCollection.tokens.colors = {
        'primary': {
          name: 'primary',
          value: '#3b82f6',
          type: 'color',
          category: 'colors',
          description: 'Primary brand color',
        },
        'secondary': {
          name: 'secondary',
          value: '#64748b',
          type: 'color',
          category: 'colors',
          description: 'Secondary color',
        },
        'background': {
          name: 'background',
          value: '#ffffff',
          type: 'color',
          category: 'colors',
          description: 'Background color',
        },
        'foreground': {
          name: 'foreground',
          value: '#0f172a',
          type: 'color',
          category: 'colors',
          description: 'Foreground text color',
        },
      };
      
      // Default spacing tokens
      tokenCollection.tokens.spacing = {
        'xs': {
          name: 'xs',
          value: '0.25rem',
          type: 'spacing',
          category: 'spacing',
          description: 'Extra small spacing',
        },
        'sm': {
          name: 'sm',
          value: '0.5rem',
          type: 'spacing',
          category: 'spacing',
          description: 'Small spacing',
        },
        'md': {
          name: 'md',
          value: '1rem',
          type: 'spacing',
          category: 'spacing',
          description: 'Medium spacing',
        },
        'lg': {
          name: 'lg',
          value: '1.5rem',
          type: 'spacing',
          category: 'spacing',
          description: 'Large spacing',
        },
        'xl': {
          name: 'xl',
          value: '2rem',
          type: 'spacing',
          category: 'spacing',
          description: 'Extra large spacing',
        },
      };
      
      // Default radius tokens
      tokenCollection.tokens.radius = {
        'none': {
          name: 'none',
          value: '0',
          type: 'radius',
          category: 'radius',
          description: 'No border radius',
        },
        'sm': {
          name: 'sm',
          value: '0.25rem',
          type: 'radius',
          category: 'radius',
          description: 'Small border radius',
        },
        'md': {
          name: 'md',
          value: '0.5rem',
          type: 'radius',
          category: 'radius',
          description: 'Medium border radius',
        },
        'lg': {
          name: 'lg',
          value: '0.75rem',
          type: 'radius',
          category: 'radius',
          description: 'Large border radius',
        },
      };
    }

    // Calculate metadata
    tokenCollection.metadata.totalTokens = Object.values(tokenCollection.tokens)
      .reduce((total, category) => total + Object.keys(category).length, 0);

    // Generate checksum for change detection
    const tokenString = JSON.stringify(tokenCollection.tokens, null, 2);
    tokenCollection.checksum = createHash('sha256').update(tokenString).digest('hex').substring(0, 16);

    console.log(`📊 Processed tokens:`);
    console.log(`  Colors: ${Object.keys(tokenCollection.tokens.colors).length}`);
    console.log(`  Typography: ${Object.keys(tokenCollection.tokens.typography).length}`);
    console.log(`  Spacing: ${Object.keys(tokenCollection.tokens.spacing).length}`);
    console.log(`  Radius: ${Object.keys(tokenCollection.tokens.radius).length}`);
    console.log(`  Shadows: ${Object.keys(tokenCollection.tokens.shadows).length}`);
    console.log(`  Total: ${tokenCollection.metadata.totalTokens}`);
    console.log(`  Checksum: ${tokenCollection.checksum}`);

    return tokenCollection;
    
  } catch (error) {
    throw new Error(`Failed to fetch Figma tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function writeTokensFile(tokens: TokenCollection): Promise<void> {
  const outputPath = join(process.cwd(), 'design', 'tokens.json');
  
  // Check if file exists and compare checksums
  if (existsSync(outputPath)) {
    try {
      const existingContent = readFileSync(outputPath, 'utf-8');
      const existingTokens = JSON.parse(existingContent) as TokenCollection;
      
      if (existingTokens.checksum === tokens.checksum) {
        console.log('✅ No changes detected, tokens are up to date');
        return;
      }
      
      console.log(`🔄 Checksum changed: ${existingTokens.checksum} → ${tokens.checksum}`);
    } catch (error) {
      console.log('⚠️  Could not read existing tokens file, will overwrite');
    }
  }

  // Write tokens file with stable ordering
  const sortedTokens = {
    ...tokens,
    tokens: {
      colors: Object.fromEntries(Object.entries(tokens.tokens.colors).sort()),
      typography: Object.fromEntries(Object.entries(tokens.tokens.typography).sort()),
      spacing: Object.fromEntries(Object.entries(tokens.tokens.spacing).sort()),
      radius: Object.fromEntries(Object.entries(tokens.tokens.radius).sort()),
      shadows: Object.fromEntries(Object.entries(tokens.tokens.shadows).sort()),
    },
  };

  writeFileSync(outputPath, JSON.stringify(sortedTokens, null, 2) + '\n');
  console.log(`💾 Tokens written to: ${outputPath}`);
}

async function main() {
  try {
    console.log('🚀 Starting Figma token sync...\n');
    
    const tokens = await fetchFigmaTokens();
    await writeTokensFile(tokens);
    
    console.log('\n✅ Figma token sync completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Figma token sync failed:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
