Here's a comprehensive set of unit tests for the TripBudgetDashboard component:

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TripBudgetDashboard } from './TripBudgetDashboard';
import { InstagramAPI } from '../services/instagram-api';

// Mock dependencies
jest.mock('../services/instagram-api');
jest.mock('./TripBudgetChart', () => ({
  TripBudgetChart: () => <div data-testid="budget-chart" />
}));
jest.mock('./BudgetBreakdown', () => ({
  BudgetBreakdown: () => <div data-testid="budget-breakdown" />
}));

const mockBudgetData = {
  totalBudget: 10000,
  spent: 6000,
  remaining: 4000,
  categories: {
    accommodation: {
      allocated: 3000,
      spent: 2000
    },
    food: {
      allocated: 2000,
      spent: 1500
    }
  }
};

const mockInstagramPosts = [
  {
    id: '1',
    caption: 'Test post 1',
    mediaUrl: 'https://example.com/image1.jpg',
    timestamp: '2023-01-01T12:00:00Z'
  },
  {
    id: '2',
    caption: 'Test post 2',
    mediaUrl: 'https://example.com/image2.jpg',
    timestamp: '2023-01-02T12:00:00Z'
  }
];

describe('TripBudgetDashboard', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockBudgetData)
      })
    ) as jest.Mock;

    // Mock Instagram API
    (InstagramAPI as jest.Mock).mockImplementation(() => ({
      getRecentPosts: () => Promise.resolve(mockInstagramPosts)
    }));
  });

  it('should show loading state initially', () => {
    render(<TripBudgetDashboard />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render budget data correctly', async () => {
    render(<TripBudgetDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Trip Budget Overview')).toBeInTheDocument();
    });

    expect(screen.getByText(`Total Budget: $${mockBudgetData.totalBudget.toLocaleString()}`)).toBeInTheDocument();
    expect(screen.getByText(`Spent: $${mockBudgetData.spent.toLocaleString()} (60%)`)).toBeInTheDocument();
    expect(screen.getByText(`Remaining: $${mockBudgetData.remaining.toLocaleString()}`)).toBeInTheDocument();
  });

  it('should render Instagram posts', async () => {
    render(<TripBudgetDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Trip Photos')).toBeInTheDocument();
    });

    mockInstagramPosts.forEach(post => {
      const image = screen.getByAltText(post.caption);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', post.mediaUrl);
    });
  });

  it('should render error message when API call fails', async () => {
    const errorMessage = 'Failed to fetch data';
    global.fetch = jest.fn().mockRejectedValue(new Error(errorMessage));

    render(<TripBudgetDashboard />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should render no data message when budget data is null', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(null)
      })
    ) as jest.Mock;

    render(<TripBudgetDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No budget data available')).toBeInTheDocument();
    });
  });

  it('should render child components', async () => {
    render(<TripBudgetDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('budget-chart')).toBeInTheDocument();
      expect(screen.getByTestId('budget-breakdown')).toBeInTheDocument();
    });
  });

  it('should make correct API calls', async () => {
    render(<TripBudgetDashboard />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/budget');
      expect(InstagramAPI).toHaveBeenCalled();
    });
  });

  it('should format dates correctly', async () => {
    render(<TripBudgetDashboard />);

    await waitFor(() => {
      mockInstagramPosts.forEach(post => {
        const formattedDate = new Date(post.timestamp).toLocaleDateString();
        expect(screen.getByText(formattedDate)).toBeInTheDocument();
      });
    });
  });
});
```

This test suite includes:

1. Mock setup for dependencies (InstagramAPI, TripBudgetChart, BudgetBreakdown)
2. Mock data for budget and Instagram posts
3. Tests for:
   - Initial loading state
   - Successful data rendering
   - Error handling
   - No data state
   - Child component rendering
   - API calls
   - Date formatting
   - Instagram post rendering

Additional test setup considerations:

```typescript
// In your jest.setup.js or similar:
global.fetch = jest.fn();

// Add to your jest configuration:
moduleNameMapper: {
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
}

// Add required testing-library extensions:
import '@testing-library/jest-dom';
```

The tests cover the main functionality of the component while ensuring that:
- Data fetching works correctly
- Loading states are properly displayed
- Error handling works as expected
- The component renders all necessary child components
- Data is formatted and displayed correctly
- API interactions are working as intended

Remember to add error boundaries in your actual application and consider testing edge cases based on your specific requirements.