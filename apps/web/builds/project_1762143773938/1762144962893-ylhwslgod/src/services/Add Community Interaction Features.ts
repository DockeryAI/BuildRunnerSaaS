```typescript
/**
 * @fileoverview Service for managing community interaction features
 */

import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Interface for community interaction response
 */
export interface CommunityInteractionResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Interface for interaction payload
 */
export interface InteractionPayload {
  userId: string;
  targetId: string;
  type: InteractionType;
  content?: string;
}

/**
 * Enum for interaction types
 */
export enum InteractionType {
  LIKE = 'like',
  COMMENT = 'comment',
  SHARE = 'share',
  FOLLOW = 'follow',
  FLAG = 'flag'
}

/**
 * Service for managing community interactions
 */
export class CommunityInteractionService {
  private readonly interactionSubject = new BehaviorSubject<InteractionPayload[]>([]);
  private readonly API_ENDPOINT = '/api/community';

  /**
   * Gets all interactions for a target
   * @param targetId - ID of the target content
   * @returns Observable of interaction payloads
   */
  public getInteractions(targetId: string): Observable<InteractionPayload[]> {
    try {
      return fetch(`${this.API_ENDPOINT}/interactions/${targetId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch interactions');
          }
          return response.json();
        })
        .then(data => {
          this.interactionSubject.next(data);
          return data;
        });
    } catch (error) {
      return throwError(() => new Error(`Error fetching interactions: ${error.message}`));
    }
  }

  /**
   * Adds a new interaction
   * @param payload - Interaction payload
   * @returns Observable of interaction response
   */
  public addInteraction(payload: InteractionPayload): Observable<CommunityInteractionResponse> {
    try {
      if (!this.validatePayload(payload)) {
        return throwError(() => new Error('Invalid interaction payload'));
      }

      return fetch(`${this.API_ENDPOINT}/interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add interaction');
        }
        return response.json();
      })
      .then(data => {
        const currentInteractions = this.interactionSubject.getValue();
        this.interactionSubject.next([...currentInteractions, payload]);
        return {
          success: true,
          message: 'Interaction added successfully',
          data
        };
      });
    } catch (error) {
      return throwError(() => new Error(`Error adding interaction: ${error.message}`));
    }
  }

  /**
   * Removes an interaction
   * @param payload - Interaction payload
   * @returns Observable of interaction response
   */
  public removeInteraction(payload: InteractionPayload): Observable<CommunityInteractionResponse> {
    try {
      return fetch(`${this.API_ENDPOINT}/interaction`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to remove interaction');
        }
        return response.json();
      })
      .then(data => {
        const currentInteractions = this.interactionSubject.getValue();
        const updatedInteractions = currentInteractions.filter(
          interaction => 
            interaction.userId !== payload.userId || 
            interaction.targetId !== payload.targetId ||
            interaction.type !== payload.type
        );
        this.interactionSubject.next(updatedInteractions);
        return {
          success: true,
          message: 'Interaction removed successfully',
          data
        };
      });
    } catch (error) {
      return throwError(() => new Error(`Error removing interaction: ${error.message}`));
    }
  }

  /**
   * Gets the interaction stream
   * @returns Observable of interaction payloads
   */
  public getInteractionStream(): Observable<InteractionPayload[]> {
    return this.interactionSubject.asObservable();
  }

  /**
   * Validates an interaction payload
   * @param payload - Interaction payload to validate
   * @returns boolean indicating if payload is valid
   */
  private validatePayload(payload: InteractionPayload): boolean {
    if (!payload.userId || !payload.targetId || !payload.type) {
      return false;
    }

    if (!Object.values(InteractionType).includes(payload.type)) {
      return false;
    }

    if (payload.type === InteractionType.COMMENT && !payload.content) {
      return false;
    }

    return true;
  }

  /**
   * Gets interaction statistics for a target
   * @param targetId - ID of the target content
   * @returns Observable of interaction stats
   */
  public getInteractionStats(targetId: string): Observable<Record<InteractionType, number>> {
    return this.getInteractions(targetId).pipe(
      map(interactions => {
        const stats = {} as Record<InteractionType, number>;
        
        Object.values(InteractionType).forEach(type => {
          stats[type] = interactions.filter(i => i.type === type).length;
        });

        return stats;
      }),
      catchError(error => throwError(() => new Error(`Error getting interaction stats: ${error.message}`)))
    );
  }
}
```