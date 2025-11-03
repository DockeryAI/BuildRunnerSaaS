/**
 * @fileoverview Service for processing trip location data
 */

import { useState, useCallback } from 'react';

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export interface TripLocation {
  id: string;
  locations: Location[];
  startTime: number;
  endTime?: number;
}

export interface ProcessedLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  speed?: number;
  distance?: number;
}

/**
 * Custom hook for processing trip location data
 */
export const useTripLocationProcessing = () => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Calculates distance between two coordinates in meters
   */
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }, []);

  /**
   * Processes raw location data into enhanced trip data
   */
  const processLocations = useCallback(async (tripLocation: TripLocation): Promise<ProcessedLocation[]> => {
    try {
      setIsProcessing(true);
      setError(null);

      const processedLocations: ProcessedLocation[] = [];
      const { locations } = tripLocation;

      if (!locations.length) {
        return [];
      }

      // Process each location
      locations.forEach((location, index) => {
        const processed: ProcessedLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp,
          accuracy: location.accuracy
        };

        // Calculate speed and distance if we have a previous point
        if (index > 0) {
          const prevLocation = locations[index - 1];
          const timeDiff = (location.timestamp - prevLocation.timestamp) / 1000; // Convert to seconds
          const distance = calculateDistance(
            prevLocation.latitude,
            prevLocation.longitude,
            location.latitude,
            location.longitude
          );

          processed.distance = distance;
          processed.speed = distance / timeDiff; // meters per second
        }

        processedLocations.push(processed);
      });

      return processedLocations;

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to process locations'));
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [calculateDistance]);

  /**
   * Filters out invalid or inaccurate location points
   */
  const filterLocations = useCallback((locations: ProcessedLocation[], maxAccuracy = 100): ProcessedLocation[] => {
    return locations.filter(location => {
      // Remove points with accuracy worse than maxAccuracy meters
      if (location.accuracy && location.accuracy > maxAccuracy) {
        return false;
      }

      // Remove points with unrealistic speeds (> 200 m/s or ~720 km/h)
      if (location.speed && location.speed > 200) {
        return false;
      }

      return true;
    });
  }, []);

  return {
    processLocations,
    filterLocations,
    isProcessing,
    error
  };
};

export default useTripLocationProcessing;