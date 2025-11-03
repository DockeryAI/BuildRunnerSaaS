/**
 * @module FormatEventData
 * @description Service for formatting and standardizing event data
 */

export interface EventData {
  id?: string;
  timestamp?: number | string;
  type?: string;
  payload?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface FormattedEventData {
  id: string;
  timestamp: number;
  type: string;
  payload: Record<string, any>;
  metadata: Record<string, any>;
}

export class FormatEventDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormatEventDataError';
  }
}

export class FormatEventData {
  /**
   * Formats raw event data into standardized structure
   * @param eventData - Raw event data to format
   * @returns Formatted event data
   * @throws {FormatEventDataError} When required fields are missing or invalid
   */
  public static format(eventData: EventData): FormattedEventData {
    try {
      if (!eventData) {
        throw new FormatEventDataError('Event data is required');
      }

      const formatted: FormattedEventData = {
        id: this.formatId(eventData.id),
        timestamp: this.formatTimestamp(eventData.timestamp),
        type: this.formatType(eventData.type),
        payload: this.formatPayload(eventData.payload),
        metadata: this.formatMetadata(eventData.metadata)
      };

      return formatted;

    } catch (error) {
      if (error instanceof FormatEventDataError) {
        throw error;
      }
      throw new FormatEventDataError(`Failed to format event data: ${error.message}`);
    }
  }

  /**
   * Formats event ID
   * @param id - Raw event ID
   * @returns Formatted ID
   */
  private static formatId(id?: string): string {
    if (!id) {
      return crypto.randomUUID();
    }
    return id.trim();
  }

  /**
   * Formats event timestamp
   * @param timestamp - Raw timestamp
   * @returns Formatted timestamp as number
   */
  private static formatTimestamp(timestamp?: number | string): number {
    if (!timestamp) {
      return Date.now();
    }

    const parsed = typeof timestamp === 'string' ? Date.parse(timestamp) : timestamp;

    if (isNaN(parsed)) {
      throw new FormatEventDataError('Invalid timestamp format');
    }

    return parsed;
  }

  /**
   * Formats event type
   * @param type - Raw event type
   * @returns Formatted type
   */
  private static formatType(type?: string): string {
    if (!type) {
      throw new FormatEventDataError('Event type is required');
    }
    return type.trim().toLowerCase();
  }

  /**
   * Formats event payload
   * @param payload - Raw payload data
   * @returns Formatted payload
   */
  private static formatPayload(payload?: Record<string, any>): Record<string, any> {
    return payload || {};
  }

  /**
   * Formats event metadata
   * @param metadata - Raw metadata
   * @returns Formatted metadata
   */
  private static formatMetadata(metadata?: Record<string, any>): Record<string, any> {
    return {
      formattedAt: new Date().toISOString(),
      ...metadata
    };
  }

  /**
   * Validates formatted event data
   * @param formatted - Formatted event data to validate
   * @throws {FormatEventDataError} When validation fails
   */
  private static validate(formatted: FormattedEventData): void {
    if (!formatted.id) {
      throw new FormatEventDataError('Formatted event must have an ID');
    }

    if (!formatted.timestamp) {
      throw new FormatEventDataError('Formatted event must have a timestamp');
    }

    if (!formatted.type) {
      throw new FormatEventDataError('Formatted event must have a type');
    }
  }
}