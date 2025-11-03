/**
 * @fileoverview Service for detecting duplicate trip records
 */

import { useMemo } from 'react';

export interface Trip {
  id: string;
  startTime: Date;
  endTime: Date;
  origin: string;
  destination: string;
  distance: number;
}

export interface DuplicateTripResult {
  isDuplicate: boolean;
  similarTrips: Trip[];
  confidence: number;
}

/**
 * Configuration options for duplicate detection
 */
export interface DuplicateDetectionConfig {
  /** Time window in minutes to check for duplicates */
  timeWindowMinutes: number;
  /** Distance threshold in meters */
  distanceThreshold: number;
  /** Minimum confidence score (0-1) to consider trips as duplicates */
  minConfidence: number;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: DuplicateDetectionConfig = {
  timeWindowMinutes: 30,
  distanceThreshold: 100,
  minConfidence: 0.8
};

/**
 * Hook for detecting duplicate trips
 * @param trips Array of trips to check for duplicates
 * @param config Optional configuration options
 * @returns Object containing duplicate detection results
 */
export const useDuplicateTripDetection = (
  trips: Trip[],
  config: Partial<DuplicateDetectionConfig> = {}
): (trip: Trip) => DuplicateTripResult => {
  const finalConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config]
  );

  /**
   * Calculates similarity score between two trips
   */
  const calculateSimilarity = (trip1: Trip, trip2: Trip): number => {
    try {
      // Time similarity
      const timeDiff = Math.abs(
        trip1.startTime.getTime() - trip2.startTime.getTime()
      );
      const timeScore =
        1 -
        Math.min(
          timeDiff / (finalConfig.timeWindowMinutes * 60 * 1000),
          1
        );

      // Distance similarity
      const distanceDiff = Math.abs(trip1.distance - trip2.distance);
      const distanceScore =
        1 -
        Math.min(
          distanceDiff / finalConfig.distanceThreshold,
          1
        );

      // Location similarity
      const locationScore =
        (trip1.origin === trip2.origin &&
          trip1.destination === trip2.destination)
          ? 1
          : 0;

      // Combined score
      return (timeScore + distanceScore + locationScore) / 3;
    } catch (error) {
      console.error('Error calculating trip similarity:', error);
      return 0;
    }
  };

  /**
   * Checks if a trip is a duplicate
   */
  const checkDuplicate = (trip: Trip): DuplicateTripResult => {
    try {
      const similarTrips = trips
        .filter(t => t.id !== trip.id)
        .map(t => ({
          trip: t,
          similarity: calculateSimilarity(trip, t)
        }))
        .filter(({ similarity }) => similarity >= finalConfig.minConfidence)
        .map(({ trip }) => trip);

      const maxSimilarity = similarTrips.length
        ? Math.max(
            ...similarTrips.map(t => calculateSimilarity(trip, t))
          )
        : 0;

      return {
        isDuplicate: similarTrips.length > 0,
        similarTrips,
        confidence: maxSimilarity
      };
    } catch (error) {
      console.error('Error checking for duplicate trips:', error);
      return {
        isDuplicate: false,
        similarTrips: [],
        confidence: 0
      };
    }
  };

  return checkDuplicate;
};

/**
 * Helper function to validate trip data
 */
export const isValidTrip = (trip: Trip): boolean => {
  try {
    return !!(
      trip.id &&
      trip.startTime &&
      trip.endTime &&
      trip.origin &&
      trip.destination &&
      typeof trip.distance === 'number' &&
      trip.distance >= 0 &&
      trip.startTime <= trip.endTime
    );
  } catch (error) {
    console.error('Error validating trip:', error);
    return false;
  }
};