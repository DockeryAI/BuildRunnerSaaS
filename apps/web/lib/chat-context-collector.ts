/**
 * Chat Context Collector
 *
 * Collects comprehensive contextual information about the preview state
 * to provide Claude with maximum context for code change suggestions.
 *
 * Features:
 * - Current route detection
 * - Screenshot capture
 * - Visible elements analysis
 * - Recent user actions tracking
 * - Build state information
 * - Viewport dimensions
 */

import { EventEmitter } from 'events';

export interface ChatContext {
  route: string;
  component: string | null;
  viewport: {
    width: number;
    height: number;
    breakpoint: 'mobile' | 'tablet' | 'desktop';
  };
  url: string;
  screenshot?: string; // Base64 encoded PNG
  visibleElements: VisibleElement[];
  recentActions: UserAction[];
  buildState: {
    completedTasks: number;
    currentPhase: string;
    errors: number;
  };
}

export interface VisibleElement {
  type: string; // 'button', 'input', 'header', etc.
  text?: string;
  className?: string;
  id?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface UserAction {
  type: 'click' | 'hover' | 'scroll' | 'input' | 'navigate';
  target?: string;
  timestamp: number;
  details?: Record<string, any>;
}

export class ChatContextCollector extends EventEmitter {
  private recentActions: UserAction[] = [];
  private readonly MAX_ACTIONS = 10;

  constructor() {
    super();
  }

  /**
   * Collect complete context for chat message
   */
  async collectContext(buildId: string, iframeWindow?: Window): Promise<ChatContext> {
    const [
      route,
      component,
      viewport,
      url,
      screenshot,
      visibleElements,
      buildState
    ] = await Promise.all([
      this.getCurrentRoute(buildId, iframeWindow),
      this.detectComponent(buildId, iframeWindow),
      this.getViewport(iframeWindow),
      this.getCurrentURL(iframeWindow),
      this.captureScreenshot(iframeWindow),
      this.getVisibleElements(iframeWindow),
      this.getBuildState(buildId),
    ]);

    return {
      route,
      component,
      viewport,
      url,
      screenshot,
      visibleElements,
      recentActions: this.getRecentActions(),
      buildState,
    };
  }

  /**
   * Track user action for context
   */
  trackAction(action: UserAction): void {
    this.recentActions.push(action);

    // Keep only recent actions
    if (this.recentActions.length > this.MAX_ACTIONS) {
      this.recentActions.shift();
    }

    this.emit('action:tracked', action);
  }

  /**
   * Get current route from iframe
   */
  private async getCurrentRoute(buildId: string, iframeWindow?: Window): Promise<string> {
    if (!iframeWindow) {
      return '/';
    }

    try {
      const url = new URL(iframeWindow.location.href);
      return url.pathname;
    } catch (e) {
      // Cross-origin restrictions
      return '/';
    }
  }

  /**
   * Detect active component from route
   */
  private async detectComponent(buildId: string, iframeWindow?: Window): Promise<string | null> {
    const route = await this.getCurrentRoute(buildId, iframeWindow);

    // Map common routes to components
    const routeComponentMap: Record<string, string> = {
      '/': 'app/page.tsx',
      '/login': 'app/login/page.tsx',
      '/signup': 'app/signup/page.tsx',
      '/dashboard': 'app/dashboard/page.tsx',
      '/profile': 'app/profile/page.tsx',
      '/settings': 'app/settings/page.tsx',
    };

    // Direct match
    if (routeComponentMap[route]) {
      return routeComponentMap[route];
    }

    // Dynamic route detection
    if (route.match(/^\/\w+$/)) {
      const pageName = route.substring(1);
      return `app/${pageName}/page.tsx`;
    }

    return null;
  }

  /**
   * Get viewport information
   */
  private async getViewport(iframeWindow?: Window): Promise<ChatContext['viewport']> {
    if (!iframeWindow) {
      return {
        width: 1920,
        height: 1080,
        breakpoint: 'desktop'
      };
    }

    const width = iframeWindow.innerWidth || 1920;
    const height = iframeWindow.innerHeight || 1080;

    // Determine breakpoint
    let breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (width < 768) {
      breakpoint = 'mobile';
    } else if (width < 1024) {
      breakpoint = 'tablet';
    }

    return { width, height, breakpoint };
  }

  /**
   * Get current URL
   */
  private async getCurrentURL(iframeWindow?: Window): Promise<string> {
    if (!iframeWindow) {
      return 'http://localhost:3002';
    }

    try {
      return iframeWindow.location.href;
    } catch (e) {
      return 'http://localhost:3002';
    }
  }

  /**
   * Capture screenshot of current view
   */
  private async captureScreenshot(iframeWindow?: Window): Promise<string | undefined> {
    if (!iframeWindow || !iframeWindow.document) {
      return undefined;
    }

    try {
      // Use html2canvas for screenshot capture
      const html2canvas = await this.loadHtml2Canvas();
      if (!html2canvas) {
        return undefined;
      }

      const canvas = await html2canvas(iframeWindow.document.body, {
        allowTaint: true,
        useCORS: true,
        scale: 0.5, // Lower resolution for smaller file size
      });

      // Convert to base64
      const screenshot = canvas.toDataURL('image/png');
      return screenshot;
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return undefined;
    }
  }

  /**
   * Load html2canvas library dynamically
   */
  private async loadHtml2Canvas(): Promise<any> {
    try {
      // Dynamic import
      const { default: html2canvas } = await import('html2canvas');
      return html2canvas;
    } catch (error) {
      console.warn('html2canvas not available:', error);
      return null;
    }
  }

  /**
   * Analyze visible elements in viewport
   */
  private async getVisibleElements(iframeWindow?: Window): Promise<VisibleElement[]> {
    if (!iframeWindow || !iframeWindow.document) {
      return [];
    }

    try {
      const elements: VisibleElement[] = [];
      const doc = iframeWindow.document;

      // Get all interactive and important elements
      const selectors = [
        'button',
        'a',
        'input',
        'textarea',
        'select',
        'header',
        'nav',
        'main',
        'footer',
        '[role="button"]',
        '[role="link"]',
      ];

      selectors.forEach(selector => {
        const nodes = doc.querySelectorAll(selector);
        nodes.forEach(node => {
          const el = node as HTMLElement;

          // Check if element is visible
          if (!this.isElementVisible(el, iframeWindow)) {
            return;
          }

          const rect = el.getBoundingClientRect();

          elements.push({
            type: el.tagName.toLowerCase(),
            text: el.textContent?.trim().substring(0, 50) || undefined,
            className: el.className || undefined,
            id: el.id || undefined,
            position: {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height,
            },
          });
        });
      });

      // Limit to 50 most relevant elements
      return elements.slice(0, 50);
    } catch (error) {
      console.error('Failed to analyze visible elements:', error);
      return [];
    }
  }

  /**
   * Check if element is visible in viewport
   */
  private isElementVisible(el: HTMLElement, win: Window): boolean {
    const rect = el.getBoundingClientRect();
    const viewHeight = win.innerHeight || win.document.documentElement.clientHeight;
    const viewWidth = win.innerWidth || win.document.documentElement.clientWidth;

    // Check if element has size
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }

    // Check if element is in viewport
    if (rect.bottom < 0 || rect.top > viewHeight) {
      return false;
    }
    if (rect.right < 0 || rect.left > viewWidth) {
      return false;
    }

    // Check if element is visible (not hidden)
    const style = win.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }

    return true;
  }

  /**
   * Get recent user actions
   */
  private getRecentActions(): UserAction[] {
    return [...this.recentActions].slice(-5); // Last 5 actions
  }

  /**
   * Get build state information
   */
  private async getBuildState(buildId: string): Promise<ChatContext['buildState']> {
    try {
      // Fetch build state from API or local storage
      const response = await fetch(`/api/build/status?buildId=${buildId}`);
      if (response.ok) {
        const data = await response.json();
        return {
          completedTasks: data.completedTasks || 0,
          currentPhase: data.currentPhase || 'idle',
          errors: data.errors || 0,
        };
      }
    } catch (error) {
      console.error('Failed to fetch build state:', error);
    }

    // Fallback
    return {
      completedTasks: 0,
      currentPhase: 'idle',
      errors: 0,
    };
  }

  /**
   * Format context for Claude prompt
   */
  formatForPrompt(context: ChatContext): string {
    const parts: string[] = [];

    // Route and component
    parts.push(`**Current Route:** ${context.route}`);
    if (context.component) {
      parts.push(`**Component:** ${context.component}`);
    }

    // Viewport
    parts.push(`**Viewport:** ${context.viewport.width}x${context.viewport.height} (${context.viewport.breakpoint})`);

    // Visible elements
    if (context.visibleElements.length > 0) {
      const elementSummary = context.visibleElements
        .map(el => `${el.type}${el.text ? `: "${el.text}"` : ''}`)
        .slice(0, 10)
        .join(', ');
      parts.push(`**Visible Elements:** ${elementSummary}`);
    }

    // Recent actions
    if (context.recentActions.length > 0) {
      const actionSummary = context.recentActions
        .map(a => `${a.type}${a.target ? ` on ${a.target}` : ''}`)
        .join(', ');
      parts.push(`**Recent Actions:** ${actionSummary}`);
    }

    // Build state
    parts.push(`**Build Progress:** ${context.buildState.completedTasks} tasks completed, ${context.buildState.errors} errors`);

    return parts.join('\n');
  }
}

// Singleton instance
export const chatContextCollector = new ChatContextCollector();
