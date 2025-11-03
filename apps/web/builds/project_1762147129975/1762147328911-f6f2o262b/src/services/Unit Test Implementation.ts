/**
 * @fileoverview Unit test utility service for React components
 */

import { ReactElement } from 'react';
import { render, RenderResult } from '@testing-library/react';

export interface TestWrapperProps {
  children: React.ReactNode;
}

export interface UnitTestResult<T = any> {
  component: RenderResult;
  props: T;
}

/**
 * Service for implementing unit tests for React components
 */
export class UnitTestService {
  /**
   * Renders a component for testing with optional wrapper and props
   * @template T Props type for the component
   * @param Component Component to test
   * @param props Initial props for the component
   * @param wrapper Optional wrapper component
   * @returns Test result containing rendered component and props
   */
  static renderComponent<T extends Record<string, any>>(
    Component: React.ComponentType<T>,
    props: T,
    wrapper?: React.ComponentType<TestWrapperProps>
  ): UnitTestResult<T> {
    try {
      const component = render(
        wrapper ? (
          <wrapper.type {...wrapper.props}>
            <Component {...props} />
          </wrapper.type>
        ) : (
          <Component {...props} />
        )
      );

      return {
        component,
        props
      };
    } catch (error) {
      console.error('Error rendering component for testing:', error);
      throw error;
    }
  }

  /**
   * Creates a mock function with typed parameters and return value
   * @template P Parameters type
   * @template R Return type
   * @param implementation Optional function implementation
   * @returns Mocked function
   */
  static createMock<P extends any[], R = void>(
    implementation?: (...args: P) => R
  ): jest.Mock<R, P> {
    return jest.fn(implementation);
  }

  /**
   * Creates a promise mock that resolves/rejects after delay
   * @template T Resolved value type
   * @param value Value to resolve with
   * @param delay Delay in ms before resolving
   * @param shouldReject Whether promise should reject
   * @returns Promise that resolves/rejects after delay
   */
  static createAsyncMock<T>(
    value: T,
    delay = 0,
    shouldReject = false
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldReject) {
          reject(new Error('Mock rejection'));
        } else {
          resolve(value);
        }
      }, delay);
    });
  }

  /**
   * Updates component props and re-renders
   * @template T Props type
   * @param result Previous test result
   * @param newProps New props to update
   * @returns Updated test result
   */
  static updateProps<T extends Record<string, any>>(
    result: UnitTestResult<T>,
    newProps: Partial<T>
  ): UnitTestResult<T> {
    try {
      result.component.rerender(
        <result.component.container.firstChild.type
          {...result.props}
          {...newProps}
        />
      );

      return {
        component: result.component,
        props: { ...result.props, ...newProps }
      };
    } catch (error) {
      console.error('Error updating component props:', error);
      throw error;
    }
  }

  /**
   * Cleans up component and removes from DOM
   * @param result Test result to cleanup
   */
  static cleanup(result: UnitTestResult): void {
    try {
      result.component.unmount();
    } catch (error) {
      console.error('Error cleaning up test component:', error);
      throw error;
    }
  }

  /**
   * Waits for async operations to complete
   * @param ms Time to wait in milliseconds
   * @returns Promise that resolves after delay
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates a mock event object
   * @template T Event type
   * @param type Event type
   * @param payload Event payload
   * @returns Mocked event object
   */
  static createMockEvent<T extends Record<string, any>>(
    type: string,
    payload?: T
  ): Partial<Event> & T {
    return {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      type,
      ...payload
    };
  }
}