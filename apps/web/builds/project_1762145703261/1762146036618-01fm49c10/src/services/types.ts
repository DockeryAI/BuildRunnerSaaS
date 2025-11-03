/**
 * Calendar event interface
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
}

/**
 * Calendar API response interface
 */
export interface CalendarResponse {
  success: boolean;
  data?: CalendarEvent[];
  error?: string;
}
