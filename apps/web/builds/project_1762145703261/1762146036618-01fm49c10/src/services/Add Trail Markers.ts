/**
 * @fileoverview Service for managing trail markers on hiking/walking trails
 */

import { v4 as uuidv4 } from 'uuid';

export interface TrailMarker {
  id: string;
  latitude: number;
  longitude: number;
  elevation: number;
  type: MarkerType;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MarkerType {
  WAYPOINT = 'waypoint',
  WARNING = 'warning', 
  INFORMATION = 'information',
  SCENIC_VIEW = 'scenic_view',
  CAMPING = 'camping',
  WATER_SOURCE = 'water_source'
}

export class TrailMarkerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrailMarkerError';
  }
}

export class TrailMarkerService {
  private markers: Map<string, TrailMarker>;

  constructor() {
    this.markers = new Map<string, TrailMarker>();
  }

  /**
   * Adds a new trail marker
   * @param latitude - Marker latitude coordinate
   * @param longitude - Marker longitude coordinate
   * @param elevation - Marker elevation in meters
   * @param type - Type of marker
   * @param description - Optional description of the marker
   * @returns The newly created trail marker
   * @throws {TrailMarkerError} If coordinates are invalid
   */
  public addMarker(
    latitude: number,
    longitude: number, 
    elevation: number,
    type: MarkerType,
    description?: string
  ): TrailMarker {
    // Validate coordinates
    if (!this.isValidCoordinate(latitude, longitude, elevation)) {
      throw new TrailMarkerError('Invalid coordinates provided');
    }

    const marker: TrailMarker = {
      id: uuidv4(),
      latitude,
      longitude,
      elevation,
      type,
      description,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.markers.set(marker.id, marker);
    return marker;
  }

  /**
   * Updates an existing trail marker
   * @param id - ID of marker to update
   * @param updates - Partial marker object with fields to update
   * @returns Updated trail marker
   * @throws {TrailMarkerError} If marker not found or invalid updates
   */
  public updateMarker(
    id: string, 
    updates: Partial<Omit<TrailMarker, 'id' | 'createdAt' | 'updatedAt'>>
  ): TrailMarker {
    const marker = this.markers.get(id);
    if (!marker) {
      throw new TrailMarkerError('Marker not found');
    }

    if (updates.latitude || updates.longitude || updates.elevation) {
      if (!this.isValidCoordinate(
        updates.latitude || marker.latitude,
        updates.longitude || marker.longitude,
        updates.elevation || marker.elevation
      )) {
        throw new TrailMarkerError('Invalid coordinate updates');
      }
    }

    const updatedMarker = {
      ...marker,
      ...updates,
      updatedAt: new Date()
    };

    this.markers.set(id, updatedMarker);
    return updatedMarker;
  }

  /**
   * Deletes a trail marker
   * @param id - ID of marker to delete
   * @returns True if marker was deleted
   * @throws {TrailMarkerError} If marker not found
   */
  public deleteMarker(id: string): boolean {
    if (!this.markers.has(id)) {
      throw new TrailMarkerError('Marker not found');
    }
    return this.markers.delete(id);
  }

  /**
   * Gets a trail marker by ID
   * @param id - ID of marker to retrieve
   * @returns The requested trail marker
   * @throws {TrailMarkerError} If marker not found
   */
  public getMarker(id: string): TrailMarker {
    const marker = this.markers.get(id);
    if (!marker) {
      throw new TrailMarkerError('Marker not found');
    }
    return marker;
  }

  /**
   * Gets all trail markers
   * @returns Array of all trail markers
   */
  public getAllMarkers(): TrailMarker[] {
    return Array.from(this.markers.values());
  }

  /**
   * Gets markers within a radius of a point
   * @param latitude - Center point latitude
   * @param longitude - Center point longitude 
   * @param radiusKm - Search radius in kilometers
   * @returns Array of markers within radius
   */
  public getMarkersInRadius(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): TrailMarker[] {
    return this.getAllMarkers().filter(marker => 
      this.calculateDistance(
        latitude,
        longitude,
        marker.latitude,
        marker.longitude
      ) <= radiusKm
    );
  }

  /**
   * Validates coordinates are within acceptable ranges
   * @param latitude - Latitude coordinate to validate
   * @param longitude - Longitude coordinate to validate
   * @param elevation - Elevation to validate
   * @returns True if coordinates are valid
   */
  private isValidCoordinate(
    latitude: number,
    longitude: number,
    elevation: number
  ): boolean {
    return (
      latitude >= -90 && 
      latitude <= 90 &&
      longitude >= -180 && 
      longitude <= 180 &&
      elevation >= -500 && // Dead Sea is ~-430m
      elevation <= 9000 // Mt Everest is ~8848m
    );
  }

  /**
   * Calculates distance between two points using Haversine formula
   * @param lat1 - First point latitude
   * @param lon1 - First point longitude
   * @param lat2 - Second point latitude 
   * @param lon2 - Second point longitude
   * @returns Distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Converts degrees to radians
   * @param degrees - Value in degrees
   * @returns Value in radians
   */
  private toRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }
}