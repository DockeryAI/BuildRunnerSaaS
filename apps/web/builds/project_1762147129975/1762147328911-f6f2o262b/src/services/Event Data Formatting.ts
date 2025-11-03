/**
 * @fileoverview Service for formatting and standardizing event data
 */

export interface EventData {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  description?: string;
  attendees?: string[];
  metadata?: Record<string, unknown>;
}

export interface FormattedEventData {
  id: string;
  title: string;
  startDateTime: string;
  endDateTime?: string;
  location: string;
  description: string;
  attendeeCount: number;
  metadata: Record<string, unknown>;
}

export class EventDataFormattingService {
  /**
   * Formats raw event data into standardized format
   * @param event - Raw event data to format
   * @returns Formatted event data
   * @throws Error if required fields are missing
   */
  public static formatEvent(event: EventData): FormattedEventData {
    if (!event.id || !event.title || !event.startDate) {
      throw new Error('Missing required event fields');
    }

    try {
      return {
        id: event.id,
        title: this.formatTitle(event.title),
        startDateTime: this.formatDateTime(event.startDate),
        endDateTime: event.endDate ? this.formatDateTime(event.endDate) : undefined,
        location: event.location || '',
        description: event.description || '',
        attendeeCount: event.attendees?.length || 0,
        metadata: event.metadata || {}
      };
    } catch (error) {
      throw new Error(`Error formatting event: ${error.message}`);
    }
  }

  /**
   * Formats multiple events
   * @param events - Array of raw event data
   * @returns Array of formatted events
   */
  public static formatEvents(events: EventData[]): FormattedEventData[] {
    return events.map(event => this.formatEvent(event));
  }

  /**
   * Formats date to ISO string with timezone
   * @param date - Date to format
   * @returns Formatted date string
   */
  private static formatDateTime(date: Date): string {
    try {
      return date.toISOString();
    } catch (error) {
      throw new Error(`Invalid date format: ${error.message}`);
    }
  }

  /**
   * Formats event title
   * @param title - Raw title string
   * @returns Formatted title
   */
  private static formatTitle(title: string): string {
    return title.trim();
  }

  /**
   * Validates event dates
   * @param startDate - Event start date
   * @param endDate - Optional event end date
   * @returns True if dates are valid
   */
  public static validateEventDates(startDate: Date, endDate?: Date): boolean {
    if (!startDate) {
      return false;
    }

    if (endDate && startDate > endDate) {
      return false;
    }

    return true;
  }

  /**
   * Gets duration between start and end date
   * @param startDate - Event start date
   * @param endDate - Event end date
   * @returns Duration in milliseconds
   */
  public static getEventDuration(startDate: Date, endDate: Date): number {
    if (!this.validateEventDates(startDate, endDate)) {
      throw new Error('Invalid event dates');
    }
    return endDate.getTime() - startDate.getTime();
  }

  /**
   * Checks if event is currently happening
   * @param startDate - Event start date
   * @param endDate - Event end date
   * @returns True if event is current
   */
  public static isEventCurrent(startDate: Date, endDate?: Date): boolean {
    const now = new Date();
    if (!endDate) {
      return startDate <= now;
    }
    return startDate <= now && endDate >= now;
  }
}