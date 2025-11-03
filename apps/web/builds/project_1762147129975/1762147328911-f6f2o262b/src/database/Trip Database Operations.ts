/**
 * @fileoverview Trip database operations and types
 */

import { useCallback, useState } from 'react';

/**
 * Trip location information
 */
export interface TripLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Trip details
 */
export interface Trip {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  locations: TripLocation[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database operation result
 */
interface DbResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * Trip database operations hook
 */
export const useTripDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Save trip to local storage
   */
  const saveTrip = useCallback(async (trip: Trip): Promise<DbResult<Trip>> => {
    setLoading(true);
    setError(null);

    try {
      const trips = await getTrips();
      const existingIndex = trips.findIndex(t => t.id === trip.id);
      
      if (existingIndex >= 0) {
        trips[existingIndex] = trip;
      } else {
        trips.push(trip);
      }

      localStorage.setItem('trips', JSON.stringify(trips));
      
      return {
        success: true,
        data: trip
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save trip');
      setError(error);
      return {
        success: false,
        error
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get all trips from local storage
   */
  const getTrips = useCallback(async (): Promise<Trip[]> => {
    setLoading(true);
    setError(null);

    try {
      const tripsJson = localStorage.getItem('trips');
      if (!tripsJson) return [];

      const trips = JSON.parse(tripsJson) as Trip[];
      
      // Convert date strings back to Date objects
      return trips.map(trip => ({
        ...trip,
        startDate: new Date(trip.startDate),
        endDate: new Date(trip.endDate),
        createdAt: new Date(trip.createdAt),
        updatedAt: new Date(trip.updatedAt)
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get trips');
      setError(error);
      return [];
    } finally {
      setLoading(false); 
    }
  }, []);

  /**
   * Get single trip by ID
   */
  const getTripById = useCallback(async (id: string): Promise<DbResult<Trip | undefined>> => {
    setLoading(true);
    setError(null);

    try {
      const trips = await getTrips();
      const trip = trips.find(t => t.id === id);

      return {
        success: true,
        data: trip
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get trip');
      setError(error);
      return {
        success: false,
        error
      };
    } finally {
      setLoading(false);
    }
  }, [getTrips]);

  /**
   * Delete trip by ID
   */
  const deleteTrip = useCallback(async (id: string): Promise<DbResult<void>> => {
    setLoading(true);
    setError(null);

    try {
      const trips = await getTrips();
      const filteredTrips = trips.filter(t => t.id !== id);
      localStorage.setItem('trips', JSON.stringify(filteredTrips));

      return {
        success: true
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete trip');
      setError(error);
      return {
        success: false,
        error
      };
    } finally {
      setLoading(false);
    }
  }, [getTrips]);

  return {
    loading,
    error,
    saveTrip,
    getTrips,
    getTripById,
    deleteTrip
  };
};