Here's a comprehensive set of unit tests for the TripDashboard component:

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { TripDashboard } from './TripDashboard';
import { InstagramApi } from '../services/instagram-api';
import { useTrips } from '../hooks/useTrips';

// Mock dependencies
jest.mock('../services/instagram-api');
jest.mock('../hooks/useTrips');
jest.mock('../components/LoadingSpinner', () => ({
  LoadingSpinner: () => <div>Loading...</div>
}));
jest.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

const mockTrips = [
  {
    id: '1',
    name: 'Paris Trip',
    startDate: '2023-01-01',
    endDate: '2023-01-07'
  },
  {
    id: '2',
    name: 'Tokyo Trip',
    startDate: '2023-02-01',
    endDate: '2023-02-07'
  }
];

const mockInstagramPosts = [
  {
    id: 'post1',
    tripId: '1',
    imageUrl: 'https://example.com/image1.jpg',
    caption: 'Paris post'
  },
  {
    id: 'post2',
    tripId: '2',
    imageUrl: 'https://example.com/image2.jpg',
    caption: 'Tokyo post'
  }
];

describe('TripDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTrips as jest.Mock).mockReturnValue({
      trips: [],
      fetchTrips: jest.fn()
    });
    (InstagramApi.getPostsForTrips as jest.Mock).mockResolvedValue([]);
  });

  it('should render loading spinner initially', () => {
    render(<TripDashboard userId="user123" />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('should render empty state message when no trips are available', async () => {
    (useTrips as jest.Mock).mockReturnValue({
      trips: [],
      fetchTrips: jest.fn()
    });

    render(<TripDashboard userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('No trips found')).toBeTruthy();
    });
  });

  it('should render trips and their associated Instagram posts', async () => {
    (useTrips as jest.Mock).mockReturnValue({
      trips: mockTrips,
      fetchTrips: jest.fn()
    });
    (InstagramApi.getPostsForTrips as jest.Mock).mockResolvedValue(mockInstagramPosts);

    render(<TripDashboard userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Paris Trip')).toBeTruthy();
      expect(screen.getByText('Tokyo Trip')).toBeTruthy();
      expect(screen.getByText('Paris post')).toBeTruthy();
      expect(screen.getByText('Tokyo post')).toBeTruthy();
    });
  });

  it('should handle errors during data fetching', async () => {
    const error = new Error('Failed to fetch data');
    (useTrips as jest.Mock).mockReturnValue({
      trips: [],
      fetchTrips: jest.fn().mockRejectedValue(error)
    });

    render(<TripDashboard userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeTruthy();
      expect(screen.getByText('Retry')).toBeTruthy();
    });
  });

  it('should handle refresh action', async () => {
    const mockFetchTrips = jest.fn();
    (useTrips as jest.Mock).mockReturnValue({
      trips: mockTrips,
      fetchTrips: mockFetchTrips
    });

    render(<TripDashboard userId="user123" />);

    await waitFor(() => {
      const scrollView = screen.UNSAFE_getByType('ScrollView');
      fireEvent.refresh(scrollView);
    });

    expect(mockFetchTrips).toHaveBeenCalled();
    expect(InstagramApi.getPostsForTrips).toHaveBeenCalled();
  });

  it('should format dates correctly in trip cards', async () => {
    (useTrips as jest.Mock).mockReturnValue({
      trips: mockTrips,
      fetchTrips: jest.fn()
    });
    (InstagramApi.getPostsForTrips as jest.Mock).mockResolvedValue([]);

    render(<TripDashboard userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('1/1/2023 - 1/7/2023')).toBeTruthy();
      expect(screen.getByText('2/1/2023 - 2/7/2023')).toBeTruthy();
    });
  });

  it('should handle Instagram API errors gracefully', async () => {
    (useTrips as jest.Mock).mockReturnValue({
      trips: mockTrips,
      fetchTrips: jest.fn()
    });
    (InstagramApi.getPostsForTrips as jest.Mock).mockRejectedValue(
      new Error('Instagram API error')
    );

    render(<TripDashboard userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch Instagram posts')).toBeTruthy();
    });
  });

  it('should re-fetch data when userId changes', async () => {
    const mockFetchTrips = jest.fn();
    (useTrips as jest.Mock).mockReturnValue({
      trips: [],
      fetchTrips: mockFetchTrips
    });

    const { rerender } = render(<TripDashboard userId="user123" />);
    
    await act(async () => {
      rerender(<TripDashboard userId="user456" />);
    });

    expect(mockFetchTrips).toHaveBeenCalledTimes(2);
  });
});
```

This test suite includes:

1. Initial setup with mocks for dependencies
2. Test for loading state
3. Test for empty state
4. Test for successful data rendering
5. Test for error handling
6. Test for refresh functionality
7. Test for date formatting
8. Test for Instagram API error handling
9. Test for component updates when props change

Additional test considerations:

1. Add snapshot tests if needed
2. Test edge cases with different data formats
3. Test network timeout scenarios
4. Test interaction with navigation (when implemented)
5. Test accessibility features

To run these tests, you'll need the following dev dependencies:

```json
{
  "devDependencies": {
    "@testing-library/react-native": "^x.x.x",
    "@testing-library/jest-native": "^x.x.x",
    "jest": "^x.x.x",
    "@types/jest": "^x.x.x"
  }
}
```

Remember to update the version numbers to the latest compatible versions.