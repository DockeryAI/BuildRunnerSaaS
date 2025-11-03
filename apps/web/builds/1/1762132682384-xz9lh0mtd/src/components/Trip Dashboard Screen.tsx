```typescript
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-elements';
import { InstagramApi } from '../services/instagram-api';
import { Trip, InstagramPost } from '../types';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useTrips } from '../hooks/useTrips';

interface TripDashboardProps {
  userId: string;
}

/**
 * Trip Dashboard Screen Component
 * Displays user's trips and associated Instagram posts
 * @param props - Component props
 * @returns JSX.Element
 */
export const TripDashboard: React.FC<TripDashboardProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  
  const { trips, fetchTrips } = useTrips(userId);

  /**
   * Fetches Instagram posts for all trips
   */
  const fetchInstagramPosts = async () => {
    try {
      const posts = await InstagramApi.getPostsForTrips(trips);
      setInstagramPosts(posts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch Instagram posts'));
    }
  };

  /**
   * Initial data fetch
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchTrips();
        await fetchInstagramPosts();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize'));
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [userId]);

  /**
   * Handles pull-to-refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTrips();
      await fetchInstagramPosts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh'));
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Renders a trip card
   */
  const renderTripCard = (trip: Trip) => {
    const tripPosts = instagramPosts.filter(post => post.tripId === trip.id);

    return (
      <Card key={trip.id} containerStyle={styles.card}>
        <Card.Title>{trip.name}</Card.Title>
        <Card.Divider />
        <Text style={styles.dateText}>
          {new Date(trip.startDate).toLocaleDateString()} - 
          {new Date(trip.endDate).toLocaleDateString()}
        </Text>
        
        <ScrollView horizontal style={styles.postsContainer}>
          {tripPosts.map(post => (
            <View key={post.id} style={styles.postItem}>
              <Avatar
                size="medium"
                source={{ uri: post.imageUrl }}
                rounded
              />
              <Text style={styles.postCaption} numberOfLines={2}>
                {post.caption}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Button
          title="View Details"
          onPress={() => {/* Navigate to trip details */}}
          type="outline"
          containerStyle={styles.buttonContainer}
        />
      </Card>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error.message}</Text>
        <Button title="Retry" onPress={handleRefresh} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {trips.length === 0 ? (
          <Text style={styles.emptyText}>No trips found</Text>
        ) : (
          trips.map(renderTripCard)
        )}
      </ScrollView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dateText: {
    color: '#666',
    marginBottom: 10,
  },
  postsContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  postItem: {
    marginRight: 15,
    alignItems: 'center',
    width: 100,
  },
  postCaption: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});
```