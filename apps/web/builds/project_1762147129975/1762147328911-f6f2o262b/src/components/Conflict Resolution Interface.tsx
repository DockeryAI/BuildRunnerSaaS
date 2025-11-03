import React, { useState, useEffect } from 'react';
import { ConflictResolutionStatus } from '../types/conflicts';

/**
 * Interface for conflict item data structure
 */
interface ConflictItem {
  id: string;
  title: string;
  description: string;
  status: ConflictResolutionStatus;
  createdAt: Date;
  assignedTo?: string;
}

/**
 * Props interface for ConflictResolutionInterface component
 */
interface ConflictResolutionInterfaceProps {
  onResolve: (conflictId: string, resolution: string) => Promise<void>;
  onEscalate: (conflictId: string) => Promise<void>;
  fetchConflicts: () => Promise<ConflictItem[]>;
}

/**
 * Component for managing and resolving conflicts
 */
export const ConflictResolutionInterface: React.FC<ConflictResolutionInterfaceProps> = ({
  onResolve,
  onEscalate,
  fetchConflicts
}) => {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<string>('');
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);

  useEffect(() => {
    loadConflicts();
  }, []);

  /**
   * Loads conflicts from the backend
   */
  const loadConflicts = async (): Promise<void> => {
    try {
      setLoading(true);
      const conflictData = await fetchConflicts();
      setConflicts(conflictData);
      setError(null);
    } catch (err) {
      setError('Failed to load conflicts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles conflict resolution submission
   */
  const handleResolve = async (conflictId: string): Promise<void> => {
    try {
      if (!resolution.trim()) {
        throw new Error('Resolution cannot be empty');
      }
      
      await onResolve(conflictId, resolution);
      setConflicts(conflicts.map(conflict => 
        conflict.id === conflictId 
          ? { ...conflict, status: ConflictResolutionStatus.RESOLVED }
          : conflict
      ));
      setResolution('');
      setSelectedConflict(null);
    } catch (err) {
      setError('Failed to resolve conflict. Please try again.');
    }
  };

  /**
   * Handles conflict escalation
   */
  const handleEscalate = async (conflictId: string): Promise<void> => {
    try {
      await onEscalate(conflictId);
      setConflicts(conflicts.map(conflict => 
        conflict.id === conflictId 
          ? { ...conflict, status: ConflictResolutionStatus.ESCALATED }
          : conflict
      ));
    } catch (err) {
      setError('Failed to escalate conflict. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading conflicts...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={loadConflicts}>Retry</button>
      </div>
    );
  }

  return (
    <div className="conflict-resolution-interface">
      <h2>Conflict Resolution</h2>
      
      {conflicts.length === 0 ? (
        <p>No conflicts to resolve</p>
      ) : (
        <div className="conflicts-list">
          {conflicts.map(conflict => (
            <div key={conflict.id} className="conflict-item">
              <h3>{conflict.title}</h3>
              <p>{conflict.description}</p>
              <p>Status: {conflict.status}</p>
              
              {conflict.status === ConflictResolutionStatus.PENDING && (
                <div className="conflict-actions">
                  {selectedConflict === conflict.id ? (
                    <div className="resolution-form">
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Enter resolution details..."
                      />
                      <div className="button-group">
                        <button 
                          onClick={() => handleResolve(conflict.id)}
                          disabled={!resolution.trim()}
                        >
                          Submit Resolution
                        </button>
                        <button onClick={() => setSelectedConflict(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="button-group">
                      <button onClick={() => setSelectedConflict(conflict.id)}>
                        Resolve
                      </button>
                      <button onClick={() => handleEscalate(conflict.id)}>
                        Escalate
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConflictResolutionInterface;