/**
 * @class OpenRouter
 * @description Service for managing dynamic routing configuration and navigation
 */
export class OpenRouter {
  private static instance: OpenRouter;
  private routes: Map<string, RouteConfig>;
  private currentPath: string;
  private listeners: Set<(path: string) => void>;

  private constructor() {
    this.routes = new Map();
    this.currentPath = window.location.pathname;
    this.listeners = new Set();

    window.addEventListener('popstate', () => {
      this.handlePathChange(window.location.pathname);
    });
  }

  /**
   * Get singleton instance of OpenRouter
   * @returns {OpenRouter} Router instance
   */
  public static getInstance(): OpenRouter {
    if (!OpenRouter.instance) {
      OpenRouter.instance = new OpenRouter();
    }
    return OpenRouter.instance;
  }

  /**
   * Register a new route configuration
   * @param {string} path - Route path
   * @param {RouteConfig} config - Route configuration
   * @throws {Error} If route path is already registered
   */
  public registerRoute(path: string, config: RouteConfig): void {
    if (this.routes.has(path)) {
      throw new Error(`Route ${path} is already registered`);
    }
    this.routes.set(path, config);
  }

  /**
   * Navigate to a specific path
   * @param {string} path - Target path
   * @param {NavigateOptions} options - Navigation options
   * @throws {Error} If route is not found
   */
  public navigate(path: string, options: NavigateOptions = {}): void {
    if (!this.routes.has(path)) {
      throw new Error(`Route ${path} not found`);
    }

    const config = this.routes.get(path)!;
    
    if (config.guard && !config.guard()) {
      if (config.fallback) {
        this.navigate(config.fallback);
      }
      return;
    }

    if (!options.replace) {
      window.history.pushState(null, '', path);
    } else {
      window.history.replaceState(null, '', path);
    }

    this.handlePathChange(path);
  }

  /**
   * Subscribe to route changes
   * @param {function} listener - Callback function for route changes
   * @returns {function} Unsubscribe function
   */
  public subscribe(listener: (path: string) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current route path
   * @returns {string} Current path
   */
  public getCurrentPath(): string {
    return this.currentPath;
  }

  /**
   * Get route configuration for a path
   * @param {string} path - Route path
   * @returns {RouteConfig | undefined} Route configuration
   */
  public getRouteConfig(path: string): RouteConfig | undefined {
    return this.routes.get(path);
  }

  /**
   * Clear all registered routes
   */
  public clearRoutes(): void {
    this.routes.clear();
  }

  private handlePathChange(path: string): void {
    this.currentPath = path;
    this.listeners.forEach(listener => {
      try {
        listener(path);
      } catch (error) {
        console.error('Error in route change listener:', error);
      }
    });
  }
}

/**
 * Route configuration interface
 */
export interface RouteConfig {
  component: any;
  guard?: () => boolean;
  fallback?: string;
  meta?: Record<string, any>;
}

/**
 * Navigation options interface
 */
export interface NavigateOptions {
  replace?: boolean;
}

export default OpenRouter;