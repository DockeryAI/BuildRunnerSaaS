/**
 * @interface TimeRange
 * @description Represents a time period with start and end times
 */
interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * @interface ConflictDetectionOptions
 * @description Configuration options for conflict detection
 */
interface ConflictDetectionOptions {
  /** Minimum gap required between items (in minutes) */
  minGapMinutes?: number;
  /** Whether to treat items with the same start/end time as conflicts */
  treatEqualTimesAsConflict?: boolean;
}

/**
 * @class ConflictDetectionService
 * @description Service for detecting conflicts between time ranges
 */
export class ConflictDetectionService {
  private readonly defaultOptions: ConflictDetectionOptions = {
    minGapMinutes: 0,
    treatEqualTimesAsConflict: false
  };

  /**
   * Creates a new instance of ConflictDetectionService
   * @param options - Configuration options
   */
  constructor(private options: ConflictDetectionOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  /**
   * Checks if two time ranges overlap
   * @param range1 - First time range
   * @param range2 - Second time range
   * @returns True if ranges conflict, false otherwise
   * @throws Error if invalid date ranges are provided
   */
  public hasConflict(range1: TimeRange, range2: TimeRange): boolean {
    try {
      this.validateTimeRange(range1);
      this.validateTimeRange(range2);

      const gap = this.options.minGapMinutes || 0;
      const gapMs = gap * 60 * 1000;

      // Add minimum gap to range ends
      const range1End = new Date(range1.end.getTime() + gapMs);
      const range2End = new Date(range2.end.getTime() + gapMs);

      if (this.options.treatEqualTimesAsConflict) {
        return range1.start <= range2End && range2.start <= range1End;
      }

      return range1.start < range2End && range2.start < range1End;
    } catch (error) {
      throw new Error(`Conflict detection failed: ${error.message}`);
    }
  }

  /**
   * Finds all conflicts in an array of time ranges
   * @param ranges - Array of time ranges to check
   * @returns Array of pairs of conflicting ranges
   * @throws Error if invalid ranges are provided
   */
  public findConflicts(ranges: TimeRange[]): [TimeRange, TimeRange][] {
    try {
      const conflicts: [TimeRange, TimeRange][] = [];

      for (let i = 0; i < ranges.length; i++) {
        for (let j = i + 1; j < ranges.length; j++) {
          if (this.hasConflict(ranges[i], ranges[j])) {
            conflicts.push([ranges[i], ranges[j]]);
          }
        }
      }

      return conflicts;
    } catch (error) {
      throw new Error(`Finding conflicts failed: ${error.message}`);
    }
  }

  /**
   * Checks if a time range can be added without conflicts
   * @param newRange - Range to check
   * @param existingRanges - Array of existing ranges
   * @returns True if range can be added without conflicts
   * @throws Error if invalid ranges are provided
   */
  public canAddWithoutConflict(newRange: TimeRange, existingRanges: TimeRange[]): boolean {
    try {
      return !existingRanges.some(range => this.hasConflict(newRange, range));
    } catch (error) {
      throw new Error(`Checking add conflict failed: ${error.message}`);
    }
  }

  /**
   * Validates a time range
   * @param range - Time range to validate
   * @throws Error if range is invalid
   */
  private validateTimeRange(range: TimeRange): void {
    if (!(range.start instanceof Date) || !(range.end instanceof Date)) {
      throw new Error('Start and end times must be Date objects');
    }

    if (isNaN(range.start.getTime()) || isNaN(range.end.getTime())) {
      throw new Error('Invalid date values provided');
    }

    if (range.start > range.end) {
      throw new Error('Start time must be before end time');
    }
  }
}