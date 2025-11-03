```typescript
import { useState, useEffect, useCallback } from 'react';
import { OpenRouterClient } from '@/lib/openrouter';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type StressLevel = 'low' | 'medium' | 'high';

interface StressAlert {
  level: StressLevel;
  message: string;
  timestamp: Date;
}

interface StressAlertsProps {
  /** User ID to monitor stress levels for */
  userId: string;
  /** How frequently to check stress levels (ms) */
  pollInterval?: number;
  /** Callback when stress level changes */
  onStressLevelChange?: (level: StressLevel) => void;
}

/**
 * Real-time stress monitoring and alert component
 * Uses OpenRouter API to analyze user input and determine stress levels
 */
export const StressAlerts: React.FC<StressAlertsProps> = ({
  userId,
  pollInterval = 30000,
  onStressLevelChange
}) => {
  const [alerts, setAlerts] = useState<StressAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openRouter = new OpenRouterClient();

  /**
   * Analyzes recent user activity to determine stress level
   */
  const checkStressLevel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await openRouter.analyze({
        userId,
        context: 'stress_detection'
      });

      const stressLevel = response.stressLevel as StressLevel;
      
      if (stressLevel) {
        const newAlert: StressAlert = {
          level: stressLevel,
          message: response.analysis || 'Stress level detected',
          timestamp: new Date()
        };

        setAlerts(prev => [newAlert, ...prev].slice(0, 10));
        onStressLevelChange?.(stressLevel);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check stress level');
    } finally {
      setLoading(false);
    }
  }, [userId, openRouter, onStressLevelChange]);

  useEffect(() => {
    checkStressLevel();
    const interval = setInterval(checkStressLevel, pollInterval);
    return () => clearInterval(interval);
  }, [checkStressLevel, pollInterval]);

  const getAlertVariant = (level: StressLevel): 'default' | 'warning' | 'destructive' => {
    switch(level) {
      case 'low': return 'default';
      case 'medium': return 'warning';
      case 'high': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Stress Alerts</h3>
        <Button
          size="sm"
          onClick={checkStressLevel}
          disabled={loading}
        >
          {loading && <Spinner className="mr-2" />}
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <Alert key={i} variant={getAlertVariant(alert.level)}>
            <div className="flex justify-between items-center">
              <div>
                <AlertTitle className="capitalize">
                  {alert.level} Stress Level
                </AlertTitle>
                {alert.message}
              </div>
              <time className="text-sm text-muted-foreground">
                {alert.timestamp.toLocaleTimeString()}
              </time>
            </div>
          </Alert>
        ))}

        {!alerts.length && !loading && (
          <p className="text-muted-foreground text-center py-4">
            No stress alerts detected
          </p>
        )}
      </div>
    </div>
  );
};
```