/**
 * @fileoverview Service for reading existing calendar events and appointments
 */

import { useState, useEffect } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
}

export interface CalendarReadingError {
  code: string;
  message: string;
}

export interface UseCalendarEventsResult {
  events: CalendarEvent[];
  isLoading: boolean;
  error: CalendarReadingError | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to read calendar events from the user's calendar
 * @param startDate - Start date to fetch events from
 * @param endDate - End date to fetch events until
 * @returns Calendar events, loading state and error information
 */
export const useCalendarEvents = (
  startDate: Date,
  endDate: Date
): UseCalendarEventsResult => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CalendarReadingError | null>(null);

  /**
   * Fetches calendar events from the calendar API
   */
  const fetchEvents = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if calendar API is available
      if (!('calendar' in window)) {
        throw new Error('Calendar API not supported in this browser');
      }

      // Request calendar permissions
      const permissions = await navigator.permissions.query({
        name: 'calendar' as PermissionName
      });

      if (permissions.state === 'denied') {
        throw new Error('Calendar access denied');
      }

      // Mock implementation since direct calendar access isn't standardized
      // Replace with actual calendar API implementation when available
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Meeting',
          startDate: new Date(),
          endDate: new Date(Date.now() + 3600000),
          description: 'Team sync',
          location: 'Conference Room'
        }
      ];

      setEvents(mockEvents);
    } catch (err) {
      setError({
        code: 'CALENDAR_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch calendar events'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [startDate, endDate]);

  return {
    events,
    isLoading,
    error,
    refresh: fetchEvents
  };
};

/**
 * Formats a calendar event into a standardized string
 * @param event - Calendar event to format
 * @returns Formatted event string
 */
export const formatCalendarEvent = (event: CalendarEvent): string => {
  const startTime = event.startDate.toLocaleTimeString();
  const endTime = event.endDate.toLocaleTimeString();
  
  return `${event.title} (${startTime} - ${endTime})${
    event.location ? ` @ ${event.location}` : ''
  }`;
};

/**
 * Checks if two calendar events overlap
 * @param event1 - First calendar event
 * @param event2 - Second calendar event
 * @returns True if events overlap, false otherwise
 */
export const doEventsOverlap = (
  event1: CalendarEvent,
  event2: CalendarEvent
): boolean => {
  return (
    (event1.startDate <= event2.startDate && event1.endDate > event2.startDate) ||
    (event2.startDate <= event1.startDate && event2.endDate > event1.startDate)
  );
};

/**
 * Filters calendar events by date range
 * @param events - Array of calendar events
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Filtered array of calendar events
 */
export const filterEventsByDateRange = (
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] => {
  return events.filter(
    event =>
      event.startDate >= startDate &&
      event.endDate <= endDate
  );
};