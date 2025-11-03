Here's a comprehensive set of unit tests for the AppReviewGuidelines component:

```typescript
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AppReviewGuidelines } from './AppReviewGuidelines';
import { InstagramAPI } from '../services/instagram';

// Mock the InstagramAPI
jest.mock('../services/instagram');
const MockedInstagramAPI = InstagramAPI as jest.MockedClass<typeof InstagramAPI>;

describe('AppReviewGuidelines', () => {
  const mockApiKey = 'test-api-key';
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should show loading state initially', () => {
    MockedInstagramAPI.prototype.checkComplianceStatus.mockImplementation(
      () => new Promise(() => {})
    );

    render(<AppReviewGuidelines apiKey={mockApiKey} />);
    
    expect(screen.getByText('Checking compliance status...')).toBeInTheDocument();
  });

  it('should display compliant status when API returns compliance', async () => {
    MockedInstagramAPI.prototype.checkComplianceStatus.mockResolvedValue({
      compliant: true,
      violations: []
    });

    render(<AppReviewGuidelines apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(screen.getByText('Compliant')).toBeInTheDocument();
    });
  });

  it('should display non-compliant status and violations when API returns violations', async () => {
    const mockViolations = ['Violation 1', 'Violation 2'];
    MockedInstagramAPI.prototype.checkComplianceStatus.mockResolvedValue({
      compliant: false,
      violations: mockViolations
    });

    render(<AppReviewGuidelines apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(screen.getByText('Non-Compliant')).toBeInTheDocument();
      expect(screen.getByText('Violations Found:')).toBeInTheDocument();
      mockViolations.forEach(violation => {
        expect(screen.getByText(violation)).toBeInTheDocument();
      });
    });
  });

  it('should handle API errors correctly', async () => {
    const errorMessage = 'API Error';
    MockedInstagramAPI.prototype.checkComplianceStatus.mockRejectedValue(
      new Error(errorMessage)
    );

    render(<AppReviewGuidelines apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(screen.getByText('Error Checking Compliance')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should call onComplianceChange callback when status changes', async () => {
    const mockOnComplianceChange = jest.fn();
    MockedInstagramAPI.prototype.checkComplianceStatus.mockResolvedValue({
      compliant: true,
      violations: []
    });

    render(
      <AppReviewGuidelines 
        apiKey={mockApiKey} 
        onComplianceChange={mockOnComplianceChange} 
      />
    );

    await waitFor(() => {
      expect(mockOnComplianceChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isCompliant: true,
          violations: [],
          lastChecked: expect.any(Date)
        })
      );
    });
  });

  it('should refresh compliance status when refresh button is clicked', async () => {
    MockedInstagramAPI.prototype.checkComplianceStatus.mockResolvedValue({
      compliant: true,
      violations: []
    });

    render(<AppReviewGuidelines apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(screen.getByText('Compliant')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh Status');
    fireEvent.click(refreshButton);

    expect(MockedInstagramAPI.prototype.checkComplianceStatus).toHaveBeenCalledTimes(2);
  });

  it('should check compliance status periodically', async () => {
    MockedInstagramAPI.prototype.checkComplianceStatus.mockResolvedValue({
      compliant: true,
      violations: []
    });

    render(<AppReviewGuidelines apiKey={mockApiKey} />);

    // Initial check
    expect(MockedInstagramAPI.prototype.checkComplianceStatus).toHaveBeenCalledTimes(1);

    // Fast-forward 12 hours
    act(() => {
      jest.advanceTimersByTime(12 * 60 * 60 * 1000);
    });

    expect(MockedInstagramAPI.prototype.checkComplianceStatus).toHaveBeenCalledTimes(2);
  });

  it('should cleanup interval on unmount', () => {
    MockedInstagramAPI.prototype.checkComplianceStatus.mockResolvedValue({
      compliant: true,
      violations: []
    });

    const { unmount } = render(<AppReviewGuidelines apiKey={mockApiKey} />);
    
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should retry compliance check when retry button is clicked in error state', async () => {
    MockedInstagramAPI.prototype.checkComplianceStatus
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce({ compliant: true, violations: [] });

    render(<AppReviewGuidelines apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(screen.getByText('Error Checking Compliance')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Retry Check');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Compliant')).toBeInTheDocument();
    });

    expect(MockedInstagramAPI.prototype.checkComplianceStatus).toHaveBeenCalledTimes(2);
  });
});
```

This test suite covers:

1. Initial loading state
2. Successful compliance status display (both compliant and non-compliant)
3. Error handling and display
4. Callback function execution
5. Refresh button functionality
6. Periodic compliance checking
7. Cleanup on component unmount
8. Retry functionality in error state
9. API interaction validation

Key testing patterns used:

- Mock of InstagramAPI service
- Async/await with waitFor
- Event handling with fireEvent
- Timer manipulation with jest.useFakeTimers()
- Component lifecycle testing
- Error state testing
- Callback testing
- DOM element presence verification
- State changes verification

Remember to add the following to your test setup:

```typescript
import '@testing-library/jest-dom';
```

This will add custom matchers for DOM testing.