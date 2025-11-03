import { useEffect, useState, useCallback } from 'react';

/**
 * Interface for user interaction data
 */
interface UserInteraction {
  eventType: string;
  timestamp: number;
  target: string;
  path: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for session recording data
 */
interface SessionRecording {
  sessionId: string;
  startTime: number;
  endTime: number;
  interactions: UserInteraction[];
}

/**
 * Hook for tracking user experience metrics and interactions
 * @returns Object containing tracking methods and session data
 */
export const useUXTracking = () => {
  const [sessionData, setSessionData] = useState<SessionRecording>({
    sessionId: crypto.randomUUID(),
    startTime: Date.now(),
    endTime: 0,
    interactions: []
  });

  const [isRecording, setIsRecording] = useState(false);

  /**
   * Tracks a user interaction
   * @param event The interaction event to track
   */
  const trackInteraction = useCallback((interaction: UserInteraction) => {
    setSessionData(prev => ({
      ...prev,
      interactions: [...prev.interactions, interaction]
    }));
  }, []);

  /**
   * Starts recording user interactions
   */
  const startRecording = useCallback(() => {
    setIsRecording(true);
    setSessionData(prev => ({
      ...prev,
      startTime: Date.now()
    }));
  }, []);

  /**
   * Stops recording user interactions
   */
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setSessionData(prev => ({
      ...prev,
      endTime: Date.now()
    }));
  }, []);

  /**
   * Tracks click events
   */
  const handleClick = useCallback((e: MouseEvent) => {
    if (!isRecording) return;

    const target = e.target as HTMLElement;
    trackInteraction({
      eventType: 'click',
      timestamp: Date.now(),
      target: target.tagName.toLowerCase(),
      path: window.location.pathname,
      metadata: {
        x: e.clientX,
        y: e.clientY,
        id: target.id,
        className: target.className
      }
    });
  }, [isRecording, trackInteraction]);

  /**
   * Tracks page navigation
   */
  const handleNavigation = useCallback(() => {
    if (!isRecording) return;

    trackInteraction({
      eventType: 'navigation',
      timestamp: Date.now(),
      target: 'window',
      path: window.location.pathname
    });
  }, [isRecording, trackInteraction]);

  useEffect(() => {
    if (isRecording) {
      window.addEventListener('click', handleClick);
      window.addEventListener('popstate', handleNavigation);
      
      return () => {
        window.removeEventListener('click', handleClick);
        window.removeEventListener('popstate', handleNavigation);
      };
    }
  }, [isRecording, handleClick, handleNavigation]);

  return {
    sessionData,
    isRecording,
    startRecording,
    stopRecording,
    trackInteraction
  };
};

/**
 * Component for testing user experience and tracking interactions
 */
export const UXTesting: React.FC = () => {
  const { 
    sessionData,
    isRecording,
    startRecording,
    stopRecording
  } = useUXTracking();

  return (
    <div className="ux-testing">
      <div className="ux-testing__controls">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="ux-testing__start"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="ux-testing__stop"
          >
            Stop Recording
          </button>
        )}
      </div>

      {isRecording && (
        <div className="ux-testing__status">
          Recording in progress...
        </div>
      )}

      {sessionData.endTime > 0 && (
        <div className="ux-testing__summary">
          <h3>Session Summary</h3>
          <p>Session ID: {sessionData.sessionId}</p>
          <p>Duration: {Math.round((sessionData.endTime - sessionData.startTime) / 1000)}s</p>
          <p>Interactions: {sessionData.interactions.length}</p>
        </div>
      )}
    </div>
  );
};

export default UXTesting;