/**
 * @fileoverview Conflict detection service for checking overlapping time periods
 */

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingRanges?: TimeRange[];
}

/**
 * Service for detecting conflicts between time ranges
 */
export class ConflictDetectionService {
  /**
   * Checks if two time ranges overlap
   * @param range1 - First time range to compare
   * @param range2 - Second time range to compare
   * @returns True if ranges overlap, false otherwise
   */
  private static doRangesOverlap(range1: TimeRange, range2: TimeRange): boolean {
    try {
      return range1.start < range2.end && range2.start < range1.end;
    } catch (err) {
      console.error('Error comparing time ranges:', err);
      return false;
    }
  }

  /**
   * Validates a single time range
   * @param range - Time range to validate
   * @returns True if range is valid, false otherwise
   */
  private static isValidRange(range: TimeRange): boolean {
    try {
      return (
        range.start instanceof Date &&
        range.end instanceof Date &&
        range.start < range.end
      );
    } catch (err) {
      console.error('Error validating time range:', err);
      return false;
    }
  }

  /**
   * Finds conflicts between a target range and a set of existing ranges
   * @param targetRange - Range to check for conflicts
   * @param existingRanges - Array of ranges to check against
   * @returns Object containing conflict status and any conflicting ranges
   * @throws Error if ranges are invalid
   */
  public static findConflicts(
    targetRange: TimeRange,
    existingRanges: TimeRange[]
  ): ConflictResult {
    try {
      // Validate inputs
      if (!this.isValidRange(targetRange)) {
        throw new Error('Invalid target range');
      }

      if (!Array.isArray(existingRanges)) {
        throw new Error('Existing ranges must be an array');
      }

      // Find any conflicting ranges
      const conflicts = existingRanges.filter(range => {
        if (!this.isValidRange(range)) {
          throw new Error('Invalid range in existing ranges');
        }
        return this.doRangesOverlap(targetRange, range);
      });

      return {
        hasConflict: conflicts.length > 0,
        conflictingRanges: conflicts.length > 0 ? conflicts : undefined
      };
    } catch (err) {
      console.error('Error detecting conflicts:', err);
      throw err;
    }
  }

  /**
   * Checks if a set of time ranges has any internal conflicts
   * @param ranges - Array of time ranges to check
   * @returns True if internal conflicts exist, false otherwise
   * @throws Error if ranges are invalid
   */
  public static hasInternalConflicts(ranges: TimeRange[]): boolean {
    try {
      if (!Array.isArray(ranges)) {
        throw new Error('Ranges must be an array');
      }

      for (let i = 0; i < ranges.length; i++) {
        if (!this.isValidRange(ranges[i])) {
          throw new Error(`Invalid range at index ${i}`);
        }

        for (let j = i + 1; j < ranges.length; j++) {
          if (this.doRangesOverlap(ranges[i], ranges[j])) {
            return true;
          }
        }
      }

      return false;
    } catch (err) {
      console.error('Error checking internal conflicts:', err);
      throw err;
    }
  }

  /**
   * Sorts time ranges by start time
   * @param ranges - Array of time ranges to sort
   * @returns Sorted array of time ranges
   * @throws Error if ranges are invalid
   */
  public static sortRanges(ranges: TimeRange[]): TimeRange[] {
    try {
      if (!Array.isArray(ranges)) {
        throw new Error('Ranges must be an array');
      }

      return [...ranges].sort((a, b) => {
        if (!this.isValidRange(a) || !this.isValidRange(b)) {
          throw new Error('Invalid range encountered while sorting');
        }
        return a.start.getTime() - b.start.getTime();
      });
    } catch (err) {
      console.error('Error sorting ranges:', err);
      throw err;
    }
  }
}

/**
 * Custom hook for using conflict detection in React components
 * @param existingRanges - Array of existing time ranges to check against
 * @returns Object containing conflict checking function
 */
export const useConflictDetection = (existingRanges: TimeRange[]) => {
  const checkConflicts = React.useCallback(
    (targetRange: TimeRange): ConflictResult => {
      try {
        return ConflictDetectionService.findConflicts(targetRange, existingRanges);
      } catch (err) {
        console.error('Error in conflict detection hook:', err);
        return { hasConflict: false };
      }
    },
    [existingRanges]
  );

  return { checkConflicts };
};