/**
 * @file AppNavigationService manages application-wide navigation and routing
 */

import { BehaviorSubject, Observable } from 'rxjs';

export interface NavigationState {
  currentPath: string;
  previousPath: string | null;
  params: Record<string, string>;
}

export interface NavigationOptions {
  replace?: boolean;
  params?: Record<string, string>;
}

export class AppNavigationService {
  private readonly navigationState$ = new BehaviorSubject<NavigationState>({
    currentPath: '/',
    previousPath: null,
    params: {}
  });

  private readonly history: string[] = [];
  private readonly MAX_HISTORY = 100;

  /**
   * Initialize the navigation service
   */
  constructor() {
    this.handleBrowserNavigation();
  }

  /**
   * Navigate to a new path
   * @param path - The path to navigate to
   * @param options - Navigation options
   * @throws {Error} If path is invalid
   */
  public async navigate(path: string, options: NavigationOptions = {}): Promise<void> {
    try {
      if (!this.isValidPath(path)) {
        throw new Error('Invalid navigation path');
      }

      const currentState = this.navigationState$.value;
      
      const newState: NavigationState = {
        currentPath: path,
        previousPath: currentState.currentPath,
        params: options.params || {}
      };

      if (!options.replace) {
        this.addToHistory(currentState.currentPath);
      }

      window.history.pushState(newState, '', path);
      this.navigationState$.next(newState);

    } catch (error) {
      console.error('Navigation failed:', error);
      throw error;
    }
  }

  /**
   * Go back to previous path
   * @returns Promise that resolves when navigation is complete
   */
  public async goBack(): Promise<void> {
    try {
      if (this.history.length > 0) {
        const previousPath = this.history.pop();
        if (previousPath) {
          await this.navigate(previousPath, { replace: true });
        }
      } else {
        window.history.back();
      }
    } catch (error) {
      console.error('Navigation back failed:', error);
      throw error;
    }
  }

  /**
   * Get current navigation state
   */
  public getCurrentState(): NavigationState {
    return this.navigationState$.value;
  }

  /**
   * Subscribe to navigation state changes
   */
  public onStateChange(): Observable<NavigationState> {
    return this.navigationState$.asObservable();
  }

  /**
   * Check if path is valid
   * @param path - Path to validate
   */
  private isValidPath(path: string): boolean {
    try {
      new URL(path, window.location.origin);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add path to navigation history
   * @param path - Path to add
   */
  private addToHistory(path: string): void {
    this.history.push(path);
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
    }
  }

  /**
   * Handle browser back/forward navigation
   */
  private handleBrowserNavigation(): void {
    window.addEventListener('popstate', (event: PopStateEvent) => {
      const state = event.state as NavigationState;
      if (state) {
        this.navigationState$.next(state);
      }
    });
  }

  /**
   * Clear navigation history
   */
  public clearHistory(): void {
    this.history.length = 0;
  }

  /**
   * Get current navigation params
   */
  public getParams(): Record<string, string> {
    return this.navigationState$.value.params;
  }

  /**
   * Update navigation params
   * @param params - New params to set
   */
  public updateParams(params: Record<string, string>): void {
    const currentState = this.navigationState$.value;
    this.navigationState$.next({
      ...currentState,
      params: {
        ...currentState.params,
        ...params
      }
    });
  }
}