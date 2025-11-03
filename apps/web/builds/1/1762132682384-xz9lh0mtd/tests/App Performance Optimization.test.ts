Here's a comprehensive set of unit tests for the AppPerformanceOptimization component:

```typescript
// AppPerformanceOptimization.test.tsx
import { render, act } from '@testing-library/react';
import { AppPerformanceOptimizer, usePerformanceOptimization, withPerformanceOptimization, optimizeInstagramImages } from './AppPerformanceOptimization';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));
window.IntersectionObserver = mockIntersectionObserver;

// Mock PerformanceObserver
const mockPerformanceObserver = jest.fn();
mockPerformanceObserver.mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn()
}));
window.PerformanceObserver = mockPerformanceObserver;

describe('AppPerformanceOptimizer', () => {
  let optimizer: AppPerformanceOptimizer;

  beforeEach(() => {
    optimizer = new AppPerformanceOptimizer({});
  });

  test('should initialize with default config', () => {
    expect(optimizer).toBeInstanceOf(AppPerformanceOptimizer);
  });

  test('should initialize with custom config', () => {
    const customConfig = {
      enableImageLazyLoading: false,
      enableCodeSplitting: false,
      enableCaching: false
    };
    optimizer = new AppPerformanceOptimizer(customConfig);
    expect(optimizer).toBeInstanceOf(AppPerformanceOptimizer);
  });

  test('should get default metrics', () => {
    const metrics = optimizer.getMetrics();
    expect(metrics).toEqual({
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0
    });
  });

  test('should initialize performance monitoring', async () => {
    await expect(optimizer.initialize()).resolves.not.toThrow();
  });
});

describe('usePerformanceOptimization hook', () => {
  const TestComponent = () => {
    const { getMetrics } = usePerformanceOptimization({});
    const metrics = getMetrics();
    return <div data-testid="metrics">{JSON.stringify(metrics)}</div>;
  };

  test('should render with default metrics', () => {
    const { getByTestId } = render(<TestComponent />);
    const metricsElement = getByTestId('metrics');
    expect(JSON.parse(metricsElement.textContent!)).toEqual({
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0
    });
  });
});

describe('withPerformanceOptimization HOC', () => {
  const TestComponent = ({ performanceMetrics }: any) => (
    <div data-testid="metrics">{JSON.stringify(performanceMetrics)}</div>
  );

  const WrappedComponent = withPerformanceOptimization(TestComponent, {});

  test('should pass performance metrics to wrapped component', () => {
    const { getByTestId } = render(<WrappedComponent />);
    const metricsElement = getByTestId('metrics');
    expect(JSON.parse(metricsElement.textContent!)).toEqual({
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0
    });
  });
});

describe('optimizeInstagramImages', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    global.URL.createObjectURL = jest.fn(() => 'blob:optimized-image');
    global.createImageBitmap = jest.fn();
  });

  test('should optimize images', async () => {
    const mockBlob = new Blob([''], { type: 'image/jpeg' });
    (global.fetch as jest.Mock).mockResolvedValue({
      blob: () => Promise.resolve(mockBlob)
    });
    (global.createImageBitmap as jest.Mock).mockResolvedValue({
      width: 100,
      height: 100
    });

    const images = ['https://example.com/image1.jpg'];
    const config = { apiKey: 'test-key' };

    const optimizedImages = await optimizeInstagramImages(images, config);
    expect(optimizedImages).toHaveLength(1);
    expect(optimizedImages[0]).toBe('blob:optimized-image');
  });

  test('should handle optimization errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const images = ['https://example.com/image1.jpg'];
    const config = { apiKey: 'test-key' };

    await expect(optimizeInstagramImages(images, config)).rejects.toThrow('Network error');
  });
});

describe('Service Worker Registration', () => {
  beforeEach(() => {
    // Mock service worker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue({}),
      },
      configurable: true
    });
  });

  test('should register service worker when caching is enabled', async () => {
    const optimizer = new AppPerformanceOptimizer({ enableCaching: true });
    await optimizer.initialize();
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/service-worker.js');
  });
});

describe('Image Lazy Loading', () => {
  test('should setup image lazy loading', () => {
    document.body.innerHTML = `
      <img data-src="test1.jpg" />
      <img data-src="test2.jpg" />
    `;

    const optimizer = new AppPerformanceOptimizer({ enableImageLazyLoading: true });
    optimizer.initialize();

    expect(mockIntersectionObserver).toHaveBeenCalled();
  });
});

describe('Performance Metrics Measurement', () => {
  test('should setup performance observers', () => {
    const optimizer = new AppPerformanceOptimizer({});
    optimizer.initialize();

    expect(mockPerformanceObserver).toHaveBeenCalled();
  });
});
```

This test suite includes:

1. Tests for the `AppPerformanceOptimizer` class initialization and basic functionality
2. Tests for the `usePerformanceOptimization` React hook
3. Tests for the `withPerformanceOptimization` HOC
4. Tests for the `optimizeInstagramImages` utility function
5. Tests for service worker registration
6. Tests for image lazy loading setup
7. Tests for performance metrics measurement

Key features of the test suite:

- Mocks for browser APIs (`IntersectionObserver`, `PerformanceObserver`, `serviceWorker`)
- Testing of async operations
- Error handling scenarios
- Component rendering tests using React Testing Library
- Verification of default and custom configurations
- Testing of DOM manipulation (for image lazy loading)
- Mock implementations for fetch and blob operations

To run these tests, you'll need to have the following dependencies in your project:

```json
{
  "devDependencies": {
    "@testing-library/react": "^12.0.0",
    "@testing-library/jest-dom": "^5.11.4",
    "jest": "^27.0.6",
    "@types/jest": "^27.0.1"
  }
}
```

And make sure to configure Jest to handle TypeScript and DOM testing environment in your Jest config file.