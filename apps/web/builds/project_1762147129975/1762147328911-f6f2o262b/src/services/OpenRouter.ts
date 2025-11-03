/**
 * @file OpenRouter.ts
 * @description Service for handling route/navigation state and transitions
 */

import { useCallback, useEffect, useState } from 'react';

export interface RouterState {
  currentPath: string;
  previousPath: string | null;
  params: Record<string, string>;
}

export interface RouterOptions {
  initialPath?: string;
  onRouteChange?: (state: RouterState) => void;
}

export class OpenRouter {
  private currentState: RouterState;
  private subscribers: Set<(state: RouterState) => void>;
  private options: RouterOptions;

  constructor(options: RouterOptions = {}) {
    this.options = options;
    this.subscribers = new Set();
    this.currentState = {
      currentPath: options.initialPath || window.location.pathname,
      previousPath: null,
      params: this.getUrlParams()
    };

    this.initializeRouter();
  }

  /**
   * Initialize router and set up history/popstate listeners
   * @private
   */
  private initializeRouter(): void {
    window.addEventListener('popstate', this.handlePopState);
    
    // Set initial state
    this.updateState({
      currentPath: window.location.pathname,
      previousPath: null,
      params: this.getUrlParams()
    });
  }

  /**
   * Handle browser back/forward navigation
   * @private
   */
  private handlePopState = (): void => {
    this.updateState({
      currentPath: window.location.pathname,
      previousPath: this.currentState.currentPath,
      params: this.getUrlParams()
    });
  };

  /**
   * Parse URL parameters into object
   * @private
   * @returns Record of URL parameters
   */
  private getUrlParams(): Record<string, string> {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(window.location.search);
    
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  /**
   * Update router state and notify subscribers
   * @private
   * @param newState - New router state
   */
  private updateState(newState: RouterState): void {
    this.currentState = newState;
    this.notifySubscribers();
    
    if (this.options.onRouteChange) {
      this.options.onRouteChange(newState);
    }
  }

  /**
   * Navigate to specified path
   * @param path - Target path
   * @param options - Navigation options
   */
  public navigate(path: string, options: { replace?: boolean } = {}): void {
    const newState = {
      currentPath: path,
      previousPath: this.currentState.currentPath,
      params: this.getUrlParams()
    };

    if (options.replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }

    this.updateState(newState);
  }

  /**
   * Subscribe to router state changes
   * @param callback - Subscriber callback
   * @returns Unsubscribe function
   */
  public subscribe(callback: (state: RouterState) => void): () => void {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get current router state
   * @returns Current RouterState
   */
  public getState(): RouterState {
    return { ...this.currentState };
  }

  /**
   * Notify all subscribers of state change
   * @private
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      callback(this.currentState);
    });
  }

  /**
   * Clean up router instance
   */
  public destroy(): void {
    window.removeEventListener('popstate', this.handlePopState);
    this.subscribers.clear();
  }
}

/**
 * React hook for using OpenRouter
 * @param router - OpenRouter instance
 * @returns Current router state
 */
export const useRouter = (router: OpenRouter): RouterState => {
  const [routerState, setRouterState] = useState<RouterState>(router.getState());

  useEffect(() => {
    const unsubscribe = router.subscribe(newState => {
      setRouterState(newState);
    });

    return unsubscribe;
  }, [router]);

  return routerState;
};

/**
 * Create new router instance with options
 * @param options - Router options
 * @returns OpenRouter instance
 */
export const createRouter = (options?: RouterOptions): OpenRouter => {
  return new OpenRouter(options);
};