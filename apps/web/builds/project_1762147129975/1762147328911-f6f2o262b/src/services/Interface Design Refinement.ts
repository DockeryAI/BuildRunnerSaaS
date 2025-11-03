/**
 * @fileoverview Interface Design Refinement Service
 * Handles UI/UX improvements and design system consistency
 */

import { CSSProperties } from 'react';

export interface DesignConfig {
  colors: ColorPalette;
  spacing: SpacingScale; 
  typography: Typography;
  breakpoints: Breakpoints;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  error: string;
  success: string;
  warning: string;
}

interface SpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

interface Typography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Design refinement service for managing UI consistency
 */
export class InterfaceDesignService {
  private config: DesignConfig;

  constructor(config: DesignConfig) {
    this.config = config;
  }

  /**
   * Generates consistent component styles based on design system
   * @param props - Style properties to override defaults
   * @returns Combined styles object
   */
  public generateStyles(props?: Partial<CSSProperties>): CSSProperties {
    try {
      const baseStyles: CSSProperties = {
        fontFamily: this.config.typography.fontFamily,
        color: this.config.colors.text,
        backgroundColor: this.config.colors.background,
        margin: this.config.spacing.md,
        padding: this.config.spacing.sm,
      };

      return {
        ...baseStyles,
        ...props,
      };
    } catch (error) {
      console.error('Error generating styles:', error);
      return {};
    }
  }

  /**
   * Gets responsive breakpoint value
   * @param breakpoint - Breakpoint key
   * @returns Breakpoint value
   */
  public getBreakpoint(breakpoint: keyof Breakpoints): string {
    try {
      return this.config.breakpoints[breakpoint];
    } catch (error) {
      console.error('Error getting breakpoint:', error);
      return '0px';
    }
  }

  /**
   * Gets color from theme palette
   * @param color - Color key
   * @returns Color value
   */
  public getColor(color: keyof ColorPalette): string {
    try {
      return this.config.colors[color];
    } catch (error) {
      console.error('Error getting color:', error);
      return '#000000';
    }
  }

  /**
   * Gets spacing value from scale
   * @param size - Spacing size key
   * @returns Spacing value
   */
  public getSpacing(size: keyof SpacingScale): string {
    try {
      return this.config.spacing[size];
    } catch (error) {
      console.error('Error getting spacing:', error);
      return '0px';
    }
  }

  /**
   * Gets typography styles
   * @param size - Font size key
   * @param weight - Font weight key
   * @returns Typography styles object
   */
  public getTypography(
    size: keyof Typography['fontSize'],
    weight: keyof Typography['fontWeight']
  ): Partial<CSSProperties> {
    try {
      return {
        fontSize: this.config.typography.fontSize[size],
        fontWeight: this.config.typography.fontWeight[weight],
        fontFamily: this.config.typography.fontFamily,
      };
    } catch (error) {
      console.error('Error getting typography:', error);
      return {};
    }
  }

  /**
   * Updates design configuration
   * @param newConfig - New configuration to merge
   */
  public updateConfig(newConfig: Partial<DesignConfig>): void {
    try {
      this.config = {
        ...this.config,
        ...newConfig,
      };
    } catch (error) {
      console.error('Error updating config:', error);
    }
  }
}

/**
 * Default design system configuration
 */
export const defaultConfig: DesignConfig = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF2D55',
    background: '#FFFFFF',
    text: '#000000',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  breakpoints: {
    xs: '320px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
};

export default InterfaceDesignService;