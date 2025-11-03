/**
 * @file AccessibilityService.ts
 * Provides accessibility helpers and utilities for React components
 */

import { useEffect, useRef } from 'react';

export interface AccessibilityOptions {
  ariaLabel?: string;
  role?: string;
  tabIndex?: number;
  autoFocus?: boolean;
}

/**
 * Hook to manage focus trapping within a component
 * @param isActive - Whether focus trapping is active
 * @param options - Focus trap options
 */
export const useFocusTrap = (isActive: boolean, options?: {
  escapeDeactivates?: boolean;
  initialFocus?: boolean;
}) => {
  const elementRef = useRef<HTMLElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const element = elementRef.current;
    if (!element) return;

    lastFocusedElement.current = document.activeElement as HTMLElement;
    
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (options?.initialFocus && firstFocusable) {
      firstFocusable.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }

      if (options?.escapeDeactivates && e.key === 'Escape') {
        isActive = false;
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      if (lastFocusedElement.current) {
        lastFocusedElement.current.focus();
      }
    };
  }, [isActive, options]);

  return elementRef;
};

/**
 * Hook to announce messages to screen readers
 */
export const useAnnouncer = () => {
  const announceRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
    }
  };

  return {
    announce,
    AnnouncerElement: () => (
      <div
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: 0
        }}
      />
    )
  };
};

/**
 * Hook to manage keyboard navigation
 */
export const useKeyboardNav = (
  onKeyAction: (key: string) => void,
  targetKeys: string[] = ['Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (targetKeys.includes(e.key)) {
        e.preventDefault();
        onKeyAction(e.key);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onKeyAction, targetKeys]);
};

/**
 * Helper to generate accessibility props for components
 */
export const getAccessibilityProps = (options: AccessibilityOptions = {}) => {
  const props: Record<string, string | number | boolean> = {};

  if (options.ariaLabel) {
    props['aria-label'] = options.ariaLabel;
  }

  if (options.role) {
    props.role = options.role;
  }

  if (typeof options.tabIndex === 'number') {
    props.tabIndex = options.tabIndex;
  }

  if (options.autoFocus) {
    props.autoFocus = true;
  }

  return props;
};

/**
 * Constants for common ARIA roles and properties
 */
export const ARIA = {
  ROLES: {
    BUTTON: 'button',
    DIALOG: 'dialog',
    ALERT: 'alert',
    TAB: 'tab',
    TABPANEL: 'tabpanel',
    MENU: 'menu',
    MENUITEM: 'menuitem',
    LISTBOX: 'listbox',
    OPTION: 'option'
  },
  PROPERTIES: {
    HIDDEN: 'aria-hidden',
    EXPANDED: 'aria-expanded',
    SELECTED: 'aria-selected',
    CHECKED: 'aria-checked',
    PRESSED: 'aria-pressed',
    CURRENT: 'aria-current',
    CONTROLS: 'aria-controls',
    OWNS: 'aria-owns',
    LABELLEDBY: 'aria-labelledby',
    DESCRIBEDBY: 'aria-describedby'
  }
} as const;