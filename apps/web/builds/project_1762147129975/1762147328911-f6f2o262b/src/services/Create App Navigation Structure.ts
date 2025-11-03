/**
 * @fileoverview Navigation service for managing app routing and navigation state
 */

import { createContext, useContext, ReactNode } from 'react';

interface NavigationState {
  currentPath: string;
  history: string[];
}

interface NavigationContextType {
  state: NavigationState;
  navigate: (path: string) => void;
  goBack: () => void;
  resetNavigation: () => void;
}

const initialState: NavigationState = {
  currentPath: '/',
  history: ['/']
};

const NavigationContext = createContext<NavigationContextType>({
  state: initialState,
  navigate: () => {},
  goBack: () => {},
  resetNavigation: () => {}
});

/**
 * Custom hook to access navigation context
 */
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

/**
 * Provider component for navigation context
 */
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [state, setState] = React.useState<NavigationState>(initialState);

  /**
   * Navigate to a new path
   */
  const navigate = React.useCallback((path: string) => {
    try {
      setState(prevState => ({
        currentPath: path,
        history: [...prevState.history, path]
      }));
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, []);

  /**
   * Navigate back to previous path
   */
  const goBack = React.useCallback(() => {
    try {
      setState(prevState => {
        if (prevState.history.length <= 1) {
          return prevState;
        }

        const newHistory = [...prevState.history];
        newHistory.pop();
        const previousPath = newHistory[newHistory.length - 1];

        return {
          currentPath: previousPath,
          history: newHistory
        };
      });
    } catch (error) {
      console.error('Navigation back error:', error);
    }
  }, []);

  /**
   * Reset navigation state to initial
   */
  const resetNavigation = React.useCallback(() => {
    try {
      setState(initialState);
    } catch (error) {
      console.error('Navigation reset error:', error);
    }
  }, []);

  const value = React.useMemo(() => ({
    state,
    navigate,
    goBack,
    resetNavigation
  }), [state, navigate, goBack, resetNavigation]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * HOC to wrap components that need navigation
 */
export function withNavigation<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  return function WithNavigationComponent(props: P) {
    return (
      <NavigationProvider>
        <WrappedComponent {...props} />
      </NavigationProvider>
    );
  };
}

/**
 * Navigation service implementation
 */
export class NavigationService {
  private static instance: NavigationService;
  private currentPath: string = '/';
  private navigationStack: string[] = ['/'];

  private constructor() {}

  public static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  public getCurrentPath(): string {
    return this.currentPath;
  }

  public getNavigationStack(): string[] {
    return [...this.navigationStack];
  }

  public navigate(path: string): void {
    try {
      this.currentPath = path;
      this.navigationStack.push(path);
    } catch (error) {
      console.error('Navigation service error:', error);
      throw new Error('Failed to navigate');
    }
  }

  public goBack(): boolean {
    try {
      if (this.navigationStack.length <= 1) {
        return false;
      }

      this.navigationStack.pop();
      this.currentPath = this.navigationStack[this.navigationStack.length - 1];
      return true;
    } catch (error) {
      console.error('Navigation service back error:', error);
      return false;
    }
  }

  public reset(): void {
    try {
      this.currentPath = '/';
      this.navigationStack = ['/'];
    } catch (error) {
      console.error('Navigation service reset error:', error);
    }
  }
}

export default NavigationService.getInstance();