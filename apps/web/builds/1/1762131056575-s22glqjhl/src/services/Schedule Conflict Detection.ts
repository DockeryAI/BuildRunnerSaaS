```typescript
/**
 * @fileoverview Schedule conflict detection service for checking overlapping time periods
 */

type TimeRange = {
  start: Date;
  end: Date;
};

type ConflictCheckResult = {
  hasConflict: boolean;
  conflictingRanges?: TimeRange[];
};

/**
 * Service for detecting conflicts between scheduled time periods
 */
export class ScheduleConflictService {
  /**
   * Checks if two time ranges overlap
   * @param range1 - First time range to compare
   * @param range2 - Second time range to compare
   * @returns True if ranges overlap, false otherwise
   * @throws {Error} If invalid date ranges are provided
   */
  private static doRangesOverlap(range1: TimeRange, range2: TimeRange): boolean {
    try {
      this.validateTimeRange(range1);
      this.validateTimeRange(range2);
      
      return range1.start < range2.end && range2.start < range1.end;
    } catch (error) {
      throw new Error(`Failed to check range overlap: ${error.message}`);
    }
  }

  /**
   * Validates a time range is properly formatted
   * @param range - Time range to validate
   * @throws {Error} If range is invalid
   */
  private static validateTimeRange(range: TimeRange): void {
    if (!(range.start instanceof Date) || !(range.end instanceof Date)) {
      throw new Error('Start and end times must be Date objects');
    }

    if (range.start >= range.end) {
      throw new Error('Start time must be before end time');
    }
  }

  /**
   * Finds any conflicts between a proposed time range and existing ranges
   * @param proposedRange - The new time range to check
   * @param existingRanges - Array of existing time ranges to check against
   * @returns Object indicating if conflicts exist and which ranges conflict
   * @throws {Error} If invalid inputs are provided
   */
  public static findConflicts(
    proposedRange: TimeRange,
    existingRanges: TimeRange[]
  ): ConflictCheckResult {
    try {
      this.validateTimeRange(proposedRange);

      if (!Array.isArray(existingRanges)) {
        throw new Error('Existing ranges must be an array');
      }

      const conflicts = existingRanges.filter(range => 
        this.doRangesOverlap(proposedRange, range)
      );

      return {
        hasConflict: conflicts.length > 0,
        conflictingRanges: conflicts.length > 0 ? conflicts : undefined
      };
    } catch (error) {
      throw new Error(`Failed to find conflicts: ${error.message}`);
    }
  }

  /**
   * Checks if a set of time ranges have any internal conflicts
   * @param ranges - Array of time ranges to check
   * @returns Object indicating if internal conflicts exist
   * @throws {Error} If invalid input is provided
   */
  public static checkInternalConflicts(ranges: TimeRange[]): ConflictCheckResult {
    try {
      if (!Array.isArray(ranges)) {
        throw new Error('Ranges must be an array');
      }

      const conflicts: TimeRange[] = [];

      for (let i = 0; i < ranges.length; i++) {
        this.validateTimeRange(ranges[i]);
        
        for (let j = i + 1; j < ranges.length; j++) {
          if (this.doRangesOverlap(ranges[i], ranges[j])) {
            conflicts.push(ranges[i], ranges[j]);
          }
        }
      }

      return {
        hasConflict: conflicts.length > 0,
        conflictingRanges: conflicts.length > 0 ? [...new Set(conflicts)] : undefined
      };
    } catch (error) {
      throw new Error(`Failed to check internal conflicts: ${error.message}`);
    }
  }

  /**
   * Determines if a time range fits within available slots
   * @param proposedRange - Range to check
   * @param availableSlots - Array of available time slots
   * @returns True if range fits in available slots, false otherwise
   * @throws {Error} If invalid inputs are provided
   */
  public static fitsAvailableSlots(
    proposedRange: TimeRange,
    availableSlots: TimeRange[]
  ): boolean {
    try {
      this.validateTimeRange(proposedRange);

      if (!Array.isArray(availableSlots)) {
        throw new Error('Available slots must be an array');
      }

      return availableSlots.some(slot => {
        this.validateTimeRange(slot);
        return (
          proposedRange.start >= slot.start && 
          proposedRange.end <= slot.end
        );
      });
    } catch (error) {
      throw new Error(`Failed to check available slots: ${error.message}`);
    }
  }
}
```