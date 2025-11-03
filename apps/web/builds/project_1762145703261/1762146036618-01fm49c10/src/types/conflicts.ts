/**
 * Conflict resolution types
 */

export enum ConflictResolutionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  FAILED = 'failed',
}

export interface Conflict {
  id: string;
  type: string;
  status: ConflictResolutionStatus;
  description: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ConflictResolution {
  conflictId: string;
  resolution: string;
  resolvedBy: string;
  timestamp: Date;
}
