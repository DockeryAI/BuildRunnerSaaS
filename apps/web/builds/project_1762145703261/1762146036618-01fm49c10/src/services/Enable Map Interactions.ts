/**
 * @fileoverview Service to enable/disable map interactions
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service for managing map interaction states
 */
@Injectable({
  providedIn: 'root'
})
export class MapInteractionsService {
  private readonly _isPanEnabled = new BehaviorSubject<boolean>(true);
  private readonly _isZoomEnabled = new BehaviorSubject<boolean>(true);
  private readonly _isRotateEnabled = new BehaviorSubject<boolean>(true);
  private readonly _isDragEnabled = new BehaviorSubject<boolean>(true);

  /**
   * Observable for pan interaction state
   */
  public readonly isPanEnabled$: Observable<boolean> = this._isPanEnabled.asObservable();

  /**
   * Observable for zoom interaction state
   */
  public readonly isZoomEnabled$: Observable<boolean> = this._isZoomEnabled.asObservable();

  /**
   * Observable for rotate interaction state
   */
  public readonly isRotateEnabled$: Observable<boolean> = this._isRotateEnabled.asObservable();

  /**
   * Observable for drag interaction state
   */
  public readonly isDragEnabled$: Observable<boolean> = this._isDragEnabled.asObservable();

  /**
   * Enables or disables map panning
   * @param enabled - Whether panning should be enabled
   */
  public setPanEnabled(enabled: boolean): void {
    try {
      this._isPanEnabled.next(enabled);
    } catch (error) {
      console.error('Error setting pan state:', error);
      throw new Error('Failed to set pan state');
    }
  }

  /**
   * Enables or disables map zooming
   * @param enabled - Whether zooming should be enabled
   */
  public setZoomEnabled(enabled: boolean): void {
    try {
      this._isZoomEnabled.next(enabled);
    } catch (error) {
      console.error('Error setting zoom state:', error);
      throw new Error('Failed to set zoom state');
    }
  }

  /**
   * Enables or disables map rotation
   * @param enabled - Whether rotation should be enabled
   */
  public setRotateEnabled(enabled: boolean): void {
    try {
      this._isRotateEnabled.next(enabled);
    } catch (error) {
      console.error('Error setting rotate state:', error);
      throw new Error('Failed to set rotate state');
    }
  }

  /**
   * Enables or disables map dragging
   * @param enabled - Whether dragging should be enabled
   */
  public setDragEnabled(enabled: boolean): void {
    try {
      this._isDragEnabled.next(enabled);
    } catch (error) {
      console.error('Error setting drag state:', error);
      throw new Error('Failed to set drag state');
    }
  }

  /**
   * Gets current pan interaction state
   * @returns Current pan enabled state
   */
  public getPanEnabled(): boolean {
    return this._isPanEnabled.value;
  }

  /**
   * Gets current zoom interaction state
   * @returns Current zoom enabled state
   */
  public getZoomEnabled(): boolean {
    return this._isZoomEnabled.value;
  }

  /**
   * Gets current rotate interaction state
   * @returns Current rotate enabled state
   */
  public getRotateEnabled(): boolean {
    return this._isRotateEnabled.value;
  }

  /**
   * Gets current drag interaction state
   * @returns Current drag enabled state
   */
  public getDragEnabled(): boolean {
    return this._isDragEnabled.value;
  }

  /**
   * Enables all map interactions
   */
  public enableAllInteractions(): void {
    try {
      this.setPanEnabled(true);
      this.setZoomEnabled(true);
      this.setRotateEnabled(true);
      this.setDragEnabled(true);
    } catch (error) {
      console.error('Error enabling all interactions:', error);
      throw new Error('Failed to enable all interactions');
    }
  }

  /**
   * Disables all map interactions
   */
  public disableAllInteractions(): void {
    try {
      this.setPanEnabled(false);
      this.setZoomEnabled(false);
      this.setRotateEnabled(false);
      this.setDragEnabled(false);
    } catch (error) {
      console.error('Error disabling all interactions:', error);
      throw new Error('Failed to disable all interactions');
    }
  }
}