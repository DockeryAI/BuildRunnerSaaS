```typescript
/**
 * @fileoverview Service for managing trip-related weather notifications and alerts
 */

import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

/**
 * Weather condition severity levels
 */
export enum WeatherSeverity {
  NORMAL = 'normal',
  ADVISORY = 'advisory', 
  WARNING = 'warning',
  SEVERE = 'severe'
}

/**
 * Weather notification data structure
 */
export interface WeatherNotification {
  id: string;
  tripId: string;
  timestamp: Date;
  condition: string;
  severity: WeatherSeverity;
  message: string;
  location: {
    lat: number;
    lng: number;
  };
}

/**
 * Service for managing trip weather notifications
 */
export class TripWeatherNotificationService {
  private notifications$ = new BehaviorSubject<WeatherNotification[]>([]);
  private errorSubject$ = new Subject<Error>();

  /**
   * Get observable stream of weather notifications
   */
  public getNotifications(): Observable<WeatherNotification[]> {
    return this.notifications$.asObservable();
  }

  /**
   * Get observable stream of errors
   */
  public getErrors(): Observable<Error> {
    return this.errorSubject$.asObservable();
  }

  /**
   * Add a new weather notification
   * @param notification - The notification to add
   * @throws {Error} If notification is invalid
   */
  public addNotification(notification: WeatherNotification): void {
    try {
      this.validateNotification(notification);
      const current = this.notifications$.getValue();
      this.notifications$.next([...current, notification]);
    } catch (error) {
      this.errorSubject$.next(error as Error);
    }
  }

  /**
   * Remove a notification by ID
   * @param id - ID of notification to remove
   */
  public removeNotification(id: string): void {
    try {
      const current = this.notifications$.getValue();
      const updated = current.filter(n => n.id !== id);
      this.notifications$.next(updated);
    } catch (error) {
      this.errorSubject$.next(error as Error);
    }
  }

  /**
   * Clear all notifications for a trip
   * @param tripId - ID of trip to clear notifications for
   */
  public clearTripNotifications(tripId: string): void {
    try {
      const current = this.notifications$.getValue();
      const updated = current.filter(n => n.tripId !== tripId);
      this.notifications$.next(updated);
    } catch (error) {
      this.errorSubject$.next(error as Error);
    }
  }

  /**
   * Get notifications filtered by severity level
   * @param severity - Severity level to filter by
   */
  public getNotificationsBySeverity(severity: WeatherSeverity): Observable<WeatherNotification[]> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(n => n.severity === severity)),
      catchError(error => {
        this.errorSubject$.next(error);
        throw error;
      })
    );
  }

  /**
   * Get notifications for a specific trip
   * @param tripId - ID of trip to get notifications for
   */
  public getTripNotifications(tripId: string): Observable<WeatherNotification[]> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(n => n.tripId === tripId)),
      catchError(error => {
        this.errorSubject$.next(error);
        throw error;
      })
    );
  }

  /**
   * Validate notification object
   * @param notification - Notification to validate
   * @throws {Error} If notification is invalid
   */
  private validateNotification(notification: WeatherNotification): void {
    if (!notification.id) {
      throw new Error('Notification ID is required');
    }
    if (!notification.tripId) {
      throw new Error('Trip ID is required');
    }
    if (!notification.timestamp) {
      throw new Error('Timestamp is required');
    }
    if (!notification.condition) {
      throw new Error('Weather condition is required');
    }
    if (!Object.values(WeatherSeverity).includes(notification.severity)) {
      throw new Error('Invalid severity level');
    }
    if (!notification.message) {
      throw new Error('Notification message is required');
    }
    if (!notification.location || 
        typeof notification.location.lat !== 'number' || 
        typeof notification.location.lng !== 'number') {
      throw new Error('Valid location coordinates are required');
    }
  }
}

/**
 * Factory function to create new TripWeatherNotificationService instance
 */
export const createTripWeatherNotificationService = (): TripWeatherNotificationService => {
  return new TripWeatherNotificationService();
};
```