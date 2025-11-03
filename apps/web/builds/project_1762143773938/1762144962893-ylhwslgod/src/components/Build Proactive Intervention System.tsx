```typescript
import { useState, useEffect, useCallback } from 'react';
import { OpenRouterClient } from '@/lib/openrouter';
import { Alert, Button, Card, Spinner, TextArea } from '@/components/ui';
import { InterventionConfig, InterventionTrigger, InterventionResponse } from '@/types';

interface ProactiveInterventionProps {
  config?: InterventionConfig;
  onIntervention?: (response: InterventionResponse) => void;
  disabled?: boolean;
}

/**
 * Component that monitors for intervention triggers and provides AI-powered responses
 * @param props Component properties
 * @returns JSX element
 */
export const ProactiveIntervention: React.FC<ProactiveInterventionProps> = ({
  config,
  onIntervention,
  disabled = false
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triggers, setTriggers] = useState<InterventionTrigger[]>([]);
  const [response, setResponse] = useState<InterventionResponse | null>(null);

  const openRouter = new OpenRouterClient();

  /**
   * Analyzes the current context for potential intervention triggers
   */
  const analyzeTriggers = useCallback(async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const detectedTriggers = await openRouter.detectTriggers({
        config: config || {},
        context: window.location.pathname
      });

      setTriggers(detectedTriggers);

      if (detectedTriggers.length > 0) {
        const aiResponse = await openRouter.generateIntervention({
          triggers: detectedTriggers,
          config: config || {}
        });

        setResponse(aiResponse);
        onIntervention?.(aiResponse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze triggers');
    } finally {
      setIsAnalyzing(false);
    }
  }, [config, onIntervention]);

  useEffect(() => {
    if (!disabled) {
      const intervalId = setInterval(analyzeTriggers, 30000);
      return () => clearInterval(intervalId);
    }
  }, [disabled, analyzeTriggers]);

  const handleManualTrigger = () => {
    analyzeTriggers();
  };

  if (disabled) {
    return null;
  }

  return (
    <Card className="proactive-intervention">
      <div className="intervention-header">
        <h3>Proactive Intervention System</h3>
        <Button 
          onClick={handleManualTrigger}
          disabled={isAnalyzing}
          variant="secondary"
        >
          {isAnalyzing ? <Spinner size="sm" /> : 'Analyze Now'}
        </Button>
      </div>

      {error && (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      )}

      {triggers.length > 0 && (
        <div className="triggers-container mt-4">
          <h4>Detected Triggers:</h4>
          <ul>
            {triggers.map((trigger, index) => (
              <li key={index}>
                {trigger.type}: {trigger.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {response && (
        <div className="response-container mt-4">
          <h4>AI Response:</h4>
          <TextArea
            value={response.content}
            readOnly
            rows={4}
            className="w-full"
          />
          <div className="response-meta mt-2">
            <span>Confidence: {response.confidence}%</span>
            <span>Model: {response.model}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .proactive-intervention {
          padding: 1rem;
        }
        
        .intervention-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .triggers-container ul {
          list-style: none;
          padding-left: 0;
        }

        .response-meta {
          display: flex;
          gap: 1rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
      `}</style>
    </Card>
  );
};

export default ProactiveIntervention;
```