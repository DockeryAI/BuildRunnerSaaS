```typescript
/**
 * @file TripDetailService.ts
 * @description Service for managing and retrieving trip details
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Interface representing trip location details
 */
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Interface representing trip details
 */
export interface TripDetail {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  locations: Location[];
  participants: string[];
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service for managing trip details
 */
@Injectable({
  providedIn: 'root'
})
export class TripDetailService {
  private readonly apiUrl = '/api/trips';

  constructor(private http: HttpClient) {}

  /**
   * Retrieves trip details by ID
   * @param tripId - The unique identifier of the trip
   * @returns Observable of trip details
   * @throws HttpErrorResponse if request fails
   */
  getTripById(tripId: string): Observable<TripDetail> {
    return this.http.get<TripDetail>(`${this.apiUrl}/${tripId}`).pipe(
      map(trip => ({
        ...trip,
        startDate: new Date(trip.startDate),
        endDate: new Date(trip.endDate),
        createdAt: new Date(trip.createdAt),
        updatedAt: new Date(trip.updatedAt)
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Updates trip details
   * @param tripId - The unique identifier of the trip
   * @param updates - Partial trip details to update
   * @returns Observable of updated trip details
   * @throws HttpErrorResponse if request fails
   */
  updateTrip(tripId: string, updates: Partial<TripDetail>): Observable<TripDetail> {
    return this.http.patch<TripDetail>(`${this.apiUrl}/${tripId}`, updates).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Adds a location to a trip
   * @param tripId - The unique identifier of the trip
   * @param location - Location details to add
   * @returns Observable of updated trip details
   * @throws HttpErrorResponse if request fails
   */
  addLocation(tripId: string, location: Omit<Location, 'id'>): Observable<TripDetail> {
    return this.http.post<TripDetail>(`${this.apiUrl}/${tripId}/locations`, location).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Removes a location from a trip
   * @param tripId - The unique identifier of the trip
   * @param locationId - The unique identifier of the location
   * @returns Observable of updated trip details
   * @throws HttpErrorResponse if request fails
   */
  removeLocation(tripId: string, locationId: string): Observable<TripDetail> {
    return this.http.delete<TripDetail>(`${this.apiUrl}/${tripId}/locations/${locationId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Adds a participant to a trip
   * @param tripId - The unique identifier of the trip
   * @param participantId - The unique identifier of the participant
   * @returns Observable of updated trip details
   * @throws HttpErrorResponse if request fails
   */
  addParticipant(tripId: string, participantId: string): Observable<TripDetail> {
    return this.http.post<TripDetail>(`${this.apiUrl}/${tripId}/participants`, { participantId }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Removes a participant from a trip
   * @param tripId - The unique identifier of the trip
   * @param participantId - The unique identifier of the participant
   * @returns Observable of updated trip details
   * @throws HttpErrorResponse if request fails
   */
  removeParticipant(tripId: string, participantId: string): Observable<TripDetail> {
    return this.http.delete<TripDetail>(`${this.apiUrl}/${tripId}/participants/${participantId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Updates trip status
   * @param tripId - The unique identifier of the trip
   * @param status - New trip status
   * @returns Observable of updated trip details
   * @throws HttpErrorResponse if request fails
   */
  updateStatus(tripId: string, status: TripDetail['status']): Observable<TripDetail> {
    return this.http.patch<TripDetail>(`${this.apiUrl}/${tripId}/status`, { status }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handles HTTP errors
   * @param error - HTTP error response
   * @returns Observable error
   * @private
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```