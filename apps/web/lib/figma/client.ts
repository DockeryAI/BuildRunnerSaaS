/**
 * Figma API Client (Server-Side Only)
 * Provides typed access to Figma REST API for design token and component sync
 */

// Figma API Types
export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  styles: Record<string, FigmaStyle>;
  name: string;
  lastModified: string;
  version: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  effects?: FigmaEffect[];
  constraints?: FigmaConstraints;
  absoluteBoundingBox?: FigmaRect;
  styles?: Record<string, string>;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
  documentationLinks: FigmaDocumentationLink[];
}

export interface FigmaStyle {
  key: string;
  name: string;
  description: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
}

export interface FigmaFill {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE';
  color?: FigmaColor;
  gradientStops?: FigmaGradientStop[];
  opacity?: number;
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaGradientStop {
  position: number;
  color: FigmaColor;
}

export interface FigmaStroke {
  type: string;
  color?: FigmaColor;
  opacity?: number;
}

export interface FigmaEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  color?: FigmaColor;
  offset?: { x: number; y: number };
  radius: number;
  spread?: number;
  visible: boolean;
}

export interface FigmaConstraints {
  vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE';
  horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE';
}

export interface FigmaRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigmaDocumentationLink {
  uri: string;
}

export interface FigmaVariables {
  meta: {
    variableCollections: Record<string, FigmaVariableCollection>;
    variables: Record<string, FigmaVariable>;
  };
}

export interface FigmaVariableCollection {
  id: string;
  name: string;
  key: string;
  modes: FigmaVariableMode[];
  defaultModeId: string;
  remote: boolean;
  hiddenFromPublishing: boolean;
}

export interface FigmaVariableMode {
  modeId: string;
  name: string;
}

export interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';
  valuesByMode: Record<string, any>;
  remote: boolean;
  description: string;
  hiddenFromPublishing: boolean;
  scopes: string[];
  codeSyntax: Record<string, string>;
}

// Design Token Types
export interface DesignToken {
  name: string;
  value: string | number;
  type: 'color' | 'typography' | 'spacing' | 'radius' | 'shadow' | 'border';
  category: string;
  description?: string;
  figmaId?: string;
}

export interface ColorToken extends DesignToken {
  type: 'color';
  value: string; // hex, rgb, hsl
  opacity?: number;
}

export interface TypographyToken extends DesignToken {
  type: 'typography';
  value: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string | number;
    lineHeight: string | number;
    letterSpacing?: string | number;
  };
}

export interface SpacingToken extends DesignToken {
  type: 'spacing';
  value: string; // rem, px, etc.
}

export interface RadiusToken extends DesignToken {
  type: 'radius';
  value: string; // rem, px, etc.
}

export interface ShadowToken extends DesignToken {
  type: 'shadow';
  value: string; // CSS box-shadow value
}

export class FigmaClient {
  private readonly token: string;
  private readonly baseUrl = 'https://api.figma.com/v1';

  constructor(token: string) {
    if (!token) {
      throw new Error('Figma token is required');
    }
    this.token = token;
  }

  /**
   * Get file information including components and styles
   */
  async getFile(fileId: string): Promise<FigmaFile> {
    const response = await this.request(`/files/${fileId}`);
    return response;
  }

  /**
   * Get file nodes by IDs
   */
  async getFileNodes(fileId: string, nodeIds: string[]): Promise<{ nodes: Record<string, FigmaNode> }> {
    const ids = nodeIds.join(',');
    const response = await this.request(`/files/${fileId}/nodes?ids=${ids}`);
    return response;
  }

  /**
   * Get local variables (design tokens)
   */
  async getLocalVariables(fileId: string): Promise<FigmaVariables> {
    const response = await this.request(`/files/${fileId}/variables/local`);
    return response;
  }

  /**
   * Get published variables
   */
  async getPublishedVariables(fileId: string): Promise<FigmaVariables> {
    const response = await this.request(`/files/${fileId}/variables/published`);
    return response;
  }

  /**
   * Extract design tokens from Figma file
   */
  async extractDesignTokens(fileId: string): Promise<DesignToken[]> {
    try {
      const [file, variables] = await Promise.all([
        this.getFile(fileId),
        this.getLocalVariables(fileId).catch(() => ({ meta: { variableCollections: {}, variables: {} } }))
      ]);

      const tokens: DesignToken[] = [];

      // Extract color tokens from variables
      for (const [variableId, variable] of Object.entries(variables.meta.variables)) {
        if (variable.resolvedType === 'COLOR') {
          const collection = variables.meta.variableCollections[variable.variableCollectionId];
          const defaultMode = collection?.defaultModeId;
          const colorValue = defaultMode ? variable.valuesByMode[defaultMode] : null;

          if (colorValue && typeof colorValue === 'object' && 'r' in colorValue) {
            const color = colorValue as FigmaColor;
            const hexValue = this.rgbaToHex(color.r, color.g, color.b, color.a);
            
            tokens.push({
              name: variable.name,
              value: hexValue,
              type: 'color',
              category: collection?.name || 'colors',
              description: variable.description,
              figmaId: variableId,
            });
          }
        }
      }

      // Extract tokens from styles
      for (const [styleId, style] of Object.entries(file.styles)) {
        if (style.styleType === 'FILL') {
          tokens.push({
            name: style.name,
            value: '#000000', // Placeholder - would need to fetch actual style data
            type: 'color',
            category: 'styles',
            description: style.description,
            figmaId: styleId,
          });
        }
      }

      return tokens;
    } catch (error) {
      throw new Error(`Failed to extract design tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract component information
   */
  async extractComponents(fileId: string): Promise<Array<{
    id: string;
    name: string;
    description: string;
    variants?: string[];
  }>> {
    try {
      const file = await this.getFile(fileId);
      const components = [];

      for (const [componentId, component] of Object.entries(file.components)) {
        components.push({
          id: componentId,
          name: component.name,
          description: component.description,
          variants: [], // Would need additional API calls to get variants
        });
      }

      return components;
    } catch (error) {
      throw new Error(`Failed to extract components: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make authenticated request to Figma API
   */
  private async request(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'X-Figma-Token': this.token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Figma API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: ${String(error)}`);
    }
  }

  /**
   * Convert RGBA to hex color
   */
  private rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    
    if (a < 1) {
      return hex + toHex(a);
    }
    
    return hex;
  }
}

/**
 * Create Figma client instance (server-side only)
 */
export function createFigmaClient(): FigmaClient {
  const token = process.env.FIGMA_TOKEN;
  
  if (!token) {
    throw new Error('FIGMA_TOKEN environment variable is required');
  }

  return new FigmaClient(token);
}

export default FigmaClient;
