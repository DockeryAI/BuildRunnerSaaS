```typescript
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { InstagramApi } from '../services/instagram-api';
import { TripCard } from '../components/TripCard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { Trip, InstagramPost } from '../types';

/**
 * Trip Dashboard Screen Component
 * Displays a user's trips and associated Instagram content
 * @component
 */
export const TripDashboardScreen: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { user } = useAuth();

  /**
   * Fetches trips and associated Instagram posts
   */
  const fetchTripData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch trips from API
      const tripResponse = await fetch(`/api/trips/${user.id}`);
      if (!tripResponse.ok) {
        throw new Error('Failed to fetch trips');
      }
      const tripData = await tripResponse.json();
      setTrips(tripData);

      // Fetch Instagram posts
      const instagram = new InstagramApi();
      const posts = await instagram.getPostsByUser(user.instagramId);
      setInstagramPosts(posts);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles pull-to-refresh
   */
  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchTripData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTripData();
  }, [user.id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTripData} />;
  }

  return (
    <ErrorBoundary>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {trips.map((trip) => {
          const tripPosts = instagramPosts.filter(
            post => post.tripId === trip.id
          );

          return (
            <TripCard
              key={trip.id}
              trip={trip}
              instagramPosts={tripPosts}
              onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })}
            />
          );
        })}
      </ScrollView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16
  }
});

/**
 * Type definitions
 */
interface TripCardProps {
  trip: Trip;
  instagramPosts: InstagramPost[];
  onPress: () => void;
}

interface Navigation {
  navigate: (screen: string, params: any) => void;
}
```