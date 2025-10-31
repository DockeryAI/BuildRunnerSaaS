#!/usr/bin/env tsx

/**
 * Generate Tailwind Theme from Design Tokens
 * Converts design tokens to Tailwind configuration and CSS variables
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TokenCollection {
  version: string;
  timestamp: string;
  checksum: string;
  tokens: {
    colors: Record<string, any>;
    typography: Record<string, any>;
    spacing: Record<string, any>;
    radius: Record<string, any>;
    shadows: Record<string, any>;
  };
}

interface TailwindTheme {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  boxShadow: Record<string, string>;
  fontSize: Record<string, [string, { lineHeight: string }]>;
}

class ThemeGenerator {
  private tokens: TokenCollection;

  constructor(tokens: TokenCollection) {
    this.tokens = tokens;
  }

  /**
   * Generate Tailwind theme configuration
   */
  generateTailwindTheme(): TailwindTheme {
    const theme: TailwindTheme = {
      colors: {},
      spacing: {},
      borderRadius: {},
      boxShadow: {},
      fontSize: {},
    };

    // Process colors
    for (const [name, token] of Object.entries(this.tokens.tokens.colors)) {
      theme.colors[name] = String(token.value);
    }

    // Process spacing
    for (const [name, token] of Object.entries(this.tokens.tokens.spacing)) {
      theme.spacing[name] = String(token.value);
    }

    // Process border radius
    for (const [name, token] of Object.entries(this.tokens.tokens.radius)) {
      theme.borderRadius[name] = String(token.value);
    }

    // Process shadows
    for (const [name, token] of Object.entries(this.tokens.tokens.shadows)) {
      theme.boxShadow[name] = String(token.value);
    }

    // Process typography
    for (const [name, token] of Object.entries(this.tokens.tokens.typography)) {
      if (typeof token.value === 'object' && token.value.fontSize) {
        theme.fontSize[name] = [
          token.value.fontSize,
          { lineHeight: token.value.lineHeight || '1.5' }
        ];
      }
    }

    return theme;
  }

  /**
   * Generate CSS custom properties
   */
  generateCSSVariables(): string {
    const cssVars: string[] = [
      '/* Design System CSS Variables */',
      '/* Generated from Figma design tokens */',
      '',
      ':root {',
    ];

    // Colors
    if (Object.keys(this.tokens.tokens.colors).length > 0) {
      cssVars.push('  /* Colors */');
      for (const [name, token] of Object.entries(this.tokens.tokens.colors)) {
        cssVars.push(`  --color-${name}: ${token.value};`);
      }
      cssVars.push('');
    }

    // Spacing
    if (Object.keys(this.tokens.tokens.spacing).length > 0) {
      cssVars.push('  /* Spacing */');
      for (const [name, token] of Object.entries(this.tokens.tokens.spacing)) {
        cssVars.push(`  --spacing-${name}: ${token.value};`);
      }
      cssVars.push('');
    }

    // Border radius
    if (Object.keys(this.tokens.tokens.radius).length > 0) {
      cssVars.push('  /* Border Radius */');
      for (const [name, token] of Object.entries(this.tokens.tokens.radius)) {
        cssVars.push(`  --radius-${name}: ${token.value};`);
      }
      cssVars.push('');
    }

    // Shadows
    if (Object.keys(this.tokens.tokens.shadows).length > 0) {
      cssVars.push('  /* Shadows */');
      for (const [name, token] of Object.entries(this.tokens.tokens.shadows)) {
        cssVars.push(`  --shadow-${name}: ${token.value};`);
      }
      cssVars.push('');
    }

    cssVars.push('}');
    cssVars.push('');

    return cssVars.join('\n');
  }

  /**
   * Generate Tailwind config extension
   */
  generateTailwindConfig(): string {
    const theme = this.generateTailwindTheme();
    
    const config = `// Generated Tailwind theme from design tokens
// Last updated: ${this.tokens.timestamp}
// Checksum: ${this.tokens.checksum}

export const designSystemTheme = ${JSON.stringify(theme, null, 2)};

// Extend your tailwind.config.js with:
// module.exports = {
//   theme: {
//     extend: designSystemTheme
//   }
// }
`;

    return config;
  }
}

async function loadTokens(): Promise<TokenCollection> {
  const tokensPath = join(process.cwd(), 'design', 'tokens.json');
  
  if (!existsSync(tokensPath)) {
    throw new Error(`Tokens file not found: ${tokensPath}. Run 'npm run design:fetch' first.`);
  }

  try {
    const content = readFileSync(tokensPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse tokens file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function updateTailwindConfig(theme: TailwindTheme): Promise<void> {
  const configPath = join(process.cwd(), 'apps', 'web', 'tailwind.config.ts');
  
  if (!existsSync(configPath)) {
    console.log('⚠️  Tailwind config not found, creating basic config...');
    
    const basicConfig = `import type { Config } from "tailwindcss";
import { designSystemTheme } from "../../design/theme.config";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: designSystemTheme,
  },
  plugins: [],
};

export default config;
`;
    
    writeFileSync(configPath, basicConfig);
    console.log(`✅ Created Tailwind config: ${configPath}`);
    return;
  }

  // For existing config, just log that it should be updated
  console.log(`ℹ️  Please update your Tailwind config to import design tokens:`);
  console.log(`   import { designSystemTheme } from "../../design/theme.config";`);
  console.log(`   theme: { extend: designSystemTheme }`);
}

async function updateCSSVariables(cssVars: string): Promise<void> {
  const cssPath = join(process.cwd(), 'apps', 'web', 'styles', 'design-tokens.css');
  
  writeFileSync(cssPath, cssVars);
  console.log(`✅ Updated CSS variables: ${cssPath}`);
}

async function main() {
  try {
    console.log('🎨 Generating theme from design tokens...\n');
    
    // Load tokens
    const tokens = await loadTokens();
    console.log(`📥 Loaded ${tokens.metadata?.totalTokens || 0} tokens (checksum: ${tokens.checksum})`);
    
    // Generate theme
    const generator = new ThemeGenerator(tokens);
    const theme = generator.generateTailwindTheme();
    const cssVars = generator.generateCSSVariables();
    const configCode = generator.generateTailwindConfig();
    
    // Write theme config
    const themeConfigPath = join(process.cwd(), 'design', 'theme.config.ts');
    writeFileSync(themeConfigPath, configCode);
    console.log(`✅ Generated theme config: ${themeConfigPath}`);
    
    // Update CSS variables
    await updateCSSVariables(cssVars);
    
    // Update Tailwind config
    await updateTailwindConfig(theme);
    
    console.log('\n📊 Theme generation summary:');
    console.log(`  Colors: ${Object.keys(theme.colors).length}`);
    console.log(`  Spacing: ${Object.keys(theme.spacing).length}`);
    console.log(`  Border Radius: ${Object.keys(theme.borderRadius).length}`);
    console.log(`  Shadows: ${Object.keys(theme.boxShadow).length}`);
    console.log(`  Typography: ${Object.keys(theme.fontSize).length}`);
    
    console.log('\n✅ Theme generation completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Theme generation failed:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
