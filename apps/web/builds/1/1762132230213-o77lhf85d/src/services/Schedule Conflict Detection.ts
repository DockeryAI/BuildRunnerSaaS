```typescript
/**
 * @interface TimeSlot
 * @description Represents a time period with start and end times
 */
interface TimeSlot {
  start: Date;
  end: Date;
}

/**
 * @interface ScheduleItem 
 * @description Represents a scheduled item with time and metadata
 */
interface ScheduleItem {
  id: string;
  timeSlot: TimeSlot;
  title: string;
  description?: string;
}

/**
 * @class ScheduleConflictDetector
 * @description Service for detecting conflicts between scheduled items
 */
export class ScheduleConflictDetector {
  /**
   * Checks if two time slots overlap
   * @param slot1 First time slot
   * @param slot2 Second time slot
   * @returns Boolean indicating if slots overlap
   * @throws Error if invalid date objects provided
   */
  private static doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    try {
      if (!(slot1.start instanceof Date) || !(slot1.end instanceof Date) ||
          !(slot2.start instanceof Date) || !(slot2.end instanceof Date)) {
        throw new Error('Invalid date objects provided');
      }

      return slot1.start < slot2.end && slot2.start < slot1.end;
    } catch (error) {
      throw new Error(`Error checking time slot overlap: ${error.message}`);
    }
  }

  /**
   * Validates a time slot
   * @param slot Time slot to validate
   * @returns Boolean indicating if slot is valid
   */
  private static isValidTimeSlot(slot: TimeSlot): boolean {
    return slot.start < slot.end;
  }

  /**
   * Finds all conflicts in a list of schedule items
   * @param items Array of schedule items to check
   * @returns Array of conflict pairs
   * @throws Error if invalid schedule items provided
   */
  public findConflicts(items: ScheduleItem[]): Array<[ScheduleItem, ScheduleItem]> {
    try {
      const conflicts: Array<[ScheduleItem, ScheduleItem]> = [];

      // Validate input
      if (!Array.isArray(items)) {
        throw new Error('Items must be an array');
      }

      // Check each item's validity
      items.forEach(item => {
        if (!item.timeSlot || !ScheduleConflictDetector.isValidTimeSlot(item.timeSlot)) {
          throw new Error(`Invalid time slot for item: ${item.id}`);
        }
      });

      // Compare each pair of items
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          if (ScheduleConflictDetector.doTimeSlotsOverlap(
            items[i].timeSlot,
            items[j].timeSlot
          )) {
            conflicts.push([items[i], items[j]]);
          }
        }
      }

      return conflicts;
    } catch (error) {
      throw new Error(`Error finding conflicts: ${error.message}`);
    }
  }

  /**
   * Checks if a new item conflicts with existing schedule
   * @param newItem Item to check
   * @param existingItems Array of existing schedule items
   * @returns Boolean indicating if conflicts exist
   * @throws Error if invalid items provided
   */
  public hasConflicts(newItem: ScheduleItem, existingItems: ScheduleItem[]): boolean {
    try {
      // Validate inputs
      if (!newItem.timeSlot || !ScheduleConflictDetector.isValidTimeSlot(newItem.timeSlot)) {
        throw new Error('Invalid new item time slot');
      }

      if (!Array.isArray(existingItems)) {
        throw new Error('Existing items must be an array');
      }

      return existingItems.some(existingItem => 
        ScheduleConflictDetector.doTimeSlotsOverlap(
          newItem.timeSlot,
          existingItem.timeSlot
        )
      );
    } catch (error) {
      throw new Error(`Error checking for conflicts: ${error.message}`);
    }
  }

  /**
   * Gets available time slots between existing schedule items
   * @param startTime Start of time range to check
   * @param endTime End of time range to check
   * @param existingItems Array of existing schedule items
   * @param minDuration Minimum duration for available slots in minutes
   * @returns Array of available time slots
   * @throws Error if invalid parameters provided
   */
  public getAvailableSlots(
    startTime: Date,
    endTime: Date,
    existingItems: ScheduleItem[],
    minDuration: number = 30
  ): TimeSlot[] {
    try {
      // Validate inputs
      if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
        throw new Error('Invalid date objects provided');
      }

      if (startTime >= endTime) {
        throw new Error('Start time must be before end time');
      }

      if (!Array.isArray(existingItems)) {
        throw new Error('Existing items must be an array');
      }

      if (minDuration <= 0) {
        throw new Error('Minimum duration must be positive');
      }

      // Sort existing items by start time
      const sortedItems = [...existingItems].sort(
        (a, b) => a.timeSlot.start.getTime() - b.timeSlot.start.getTime()
      );

      const availableSlots: TimeSlot[] = [];
      let currentTime = new Date(startTime);

      // Find gaps between scheduled items
      sortedItems.forEach(item => {
        if (item.timeSlot.start > currentTime) {
          const duration = item.timeSlot.start.getTime() - currentTime.getTime();
          if (duration >= minDuration * 60000) {
            availableSlots.push({
              start: new Date(currentTime),
              end: new Date(item.timeSlot.start)
            });
          }
        }
        currentTime = new Date(Math.max(currentTime.getTime(), item.timeSlot.end.getTime()));
      });

      // Add final slot if there's space after last item
      if (endTime > currentTime) {
        const duration = endTime.getTime() - currentTime.getTime();
        if (duration >= minDuration * 60000) {
          availableSlots.push({
            start: new Date(currentTime),
            end: new Date(endTime)
          });
        }
      }

      return availableSlots;
    } catch (error) {
      throw new Error(`Error getting available slots: ${error.message}`);
    }
  }
}
```