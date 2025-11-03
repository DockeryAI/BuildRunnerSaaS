/**
 * @file calendarAPI.ts
 * @description Calendar API integration service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CalendarEvent, CalendarResponse } from './types';

/**
 * Calendar API service for managing calendar events
 */
export class CalendarAPI {
  private supabase: SupabaseClient;

  /**
   * Initialize Calendar API with Supabase client
   * @param supabaseUrl - Supabase project URL
   * @param supabaseKey - Supabase API key
   */
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get all calendar events
   * @returns Promise containing array of calendar events
   * @throws Error if database query fails
   */
  public async getAllEvents(): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('calendar_events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw new Error(error.message);
      return data as CalendarEvent[];
    } catch (error) {
      throw new Error(`Failed to fetch calendar events: ${error.message}`);
    }
  }

  /**
   * Create new calendar event
   * @param event - Calendar event object
   * @returns Promise containing created event
   * @throws Error if event creation fails
   */
  public async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      const { data, error } = await this.supabase
        .from('calendar_events')
        .insert([event])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as CalendarEvent;
    } catch (error) {
      throw new Error(`Failed to create calendar event: ${error.message}`);
    }
  }

  /**
   * Update existing calendar event
   * @param id - Event ID
   * @param updates - Partial event object with updates
   * @returns Promise containing updated event
   * @throws Error if event update fails
   */
  public async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const { data, error } = await this.supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as CalendarEvent;
    } catch (error) {
      throw new Error(`Failed to update calendar event: ${error.message}`);
    }
  }

  /**
   * Delete calendar event
   * @param id - Event ID
   * @returns Promise indicating success
   * @throws Error if event deletion fails
   */
  public async deleteEvent(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
    } catch (error) {
      throw new Error(`Failed to delete calendar event: ${error.message}`);
    }
  }

  /**
   * Get events within date range
   * @param startDate - Range start date
   * @param endDate - Range end date
   * @returns Promise containing array of events in range
   * @throws Error if query fails
   */
  public async getEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('calendar_events')
        .select('*')
        .gte('start_date', startDate.toISOString())
        .lte('end_date', endDate.toISOString())
        .order('start_date', { ascending: true });

      if (error) throw new Error(error.message);
      return data as CalendarEvent[];
    } catch (error) {
      throw new Error(`Failed to fetch events by date range: ${error.message}`);
    }
  }
}

/**
 * Create singleton instance of Calendar API
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase API key
 * @returns Calendar API instance
 */
export const createCalendarAPI = (() => {
  let instance: CalendarAPI;

  return (supabaseUrl: string, supabaseKey: string): CalendarAPI => {
    if (!instance) {
      instance = new CalendarAPI(supabaseUrl, supabaseKey);
    }
    return instance;
  };
})();