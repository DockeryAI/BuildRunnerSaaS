import React, { useState, useEffect } from 'react';
import { Trip, ApiError } from '../types';

/**
 * Props for TripManagementInterface component
 */
interface TripManagementProps {
  /** User ID for loading trips */
  userId: string;
  /** Optional callback when trips are updated */
  onTripsUpdated?: (trips: Trip[]) => void;
}

/**
 * Component for managing user trips
 */
const TripManagementInterface: React.FC<TripManagementProps> = ({ userId, onTripsUpdated }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newTripName, setNewTripName] = useState<string>('');

  useEffect(() => {
    fetchTrips();
  }, [userId]);

  /**
   * Fetches trips for current user
   */
  const fetchTrips = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      const data = await response.json();
      setTrips(data);
      onTripsUpdated?.(data);
    } catch (err) {
      setError((err as ApiError).message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new trip
   */
  const createTrip = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newTripName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name: newTripName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create trip');
      }

      const newTrip = await response.json();
      setTrips([...trips, newTrip]);
      setNewTripName('');
      onTripsUpdated?.([...trips, newTrip]);
    } catch (err) {
      setError((err as ApiError).message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes a trip
   */
  const deleteTrip = async (tripId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }

      const updatedTrips = trips.filter(trip => trip.id !== tripId);
      setTrips(updatedTrips);
      onTripsUpdated?.(updatedTrips);
    } catch (err) {
      setError((err as ApiError).message || 'Failed to delete trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trip-management">
      <h2>My Trips</h2>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={createTrip} className="new-trip-form">
        <input
          type="text"
          value={newTripName}
          onChange={(e) => setNewTripName(e.target.value)}
          placeholder="Enter trip name"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !newTripName.trim()}>
          Add Trip
        </button>
      </form>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <ul className="trips-list">
          {trips.map((trip) => (
            <li key={trip.id} className="trip-item">
              <span>{trip.name}</span>
              <button
                onClick={() => deleteTrip(trip.id)}
                disabled={loading}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TripManagementInterface;