```typescript
/**
 * @fileoverview Crisis Language Detection System component
 */

import { useState, useCallback } from 'react';
import { OpenRouterClient } from '@/lib/openrouter';

type DetectionResult = {
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  detectedPhrases: string[];
  summary: string;
}

interface CrisisLanguageDetectorProps {
  apiKey: string;
  onDetectionComplete?: (result: DetectionResult) => void;
  onError?: (error: Error) => void;
  threshold?: number;
}

/**
 * Component for detecting crisis/concerning language in text
 * @param props Component props
 * @returns JSX Element
 */
export const CrisisLanguageDetector: React.FC<CrisisLanguageDetectorProps> = ({
  apiKey,
  onDetectionComplete,
  onError,
  threshold = 0.7
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState<DetectionResult | null>(null);

  const client = new OpenRouterClient(apiKey);

  /**
   * Analyzes text for crisis language
   * @param content Text to analyze
   * @returns Detection result
   */
  const analyzeText = useCallback(async (content: string): Promise<DetectionResult> => {
    const prompt = `
      Analyze the following text for concerning or crisis language. 
      Provide a severity rating (low/medium/high), confidence score (0-1),
      specific concerning phrases detected, and a brief summary:
      
      ${content}
    `;

    try {
      const response = await client.complete({
        prompt,
        model: 'anthropic/claude-2',
        max_tokens: 500
      });

      // Parse response
      const result = JSON.parse(response.choices[0].text) as DetectionResult;
      
      return {
        severity: result.severity,
        confidence: result.confidence,
        detectedPhrases: result.detectedPhrases,
        summary: result.summary
      };
    } catch (error) {
      throw new Error('Failed to analyze text: ' + error.message);
    }
  }, [client]);

  /**
   * Handles form submission
   * @param e Submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      return;
    }

    setIsAnalyzing(true);

    try {
      const detectionResult = await analyzeText(text);
      
      setResult(detectionResult);
      onDetectionComplete?.(detectionResult);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="crisis-detector">
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze..."
          rows={5}
          className="w-full p-2 border rounded"
          disabled={isAnalyzing}
        />
        
        <button 
          type="submit"
          disabled={isAnalyzing || !text.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
        </button>
      </form>

      {result && (
        <div className="mt-4">
          <h3 className="font-bold">Analysis Results:</h3>
          <div className="mt-2">
            <p>Severity: <span className={`font-bold ${
              result.severity === 'high' ? 'text-red-500' :
              result.severity === 'medium' ? 'text-yellow-500' :
              'text-green-500'
            }`}>{result.severity}</span></p>
            <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
            
            {result.detectedPhrases.length > 0 && (
              <>
                <p className="mt-2 font-bold">Detected Concerning Phrases:</p>
                <ul className="list-disc pl-5">
                  {result.detectedPhrases.map((phrase, i) => (
                    <li key={i}>{phrase}</li>
                  ))}
                </ul>
              </>
            )}
            
            <p className="mt-2">
              <span className="font-bold">Summary: </span>
              {result.summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Type guard
export const isCrisisDetectionResult = (obj: any): obj is DetectionResult => {
  return (
    typeof obj === 'object' &&
    ('severity' in obj) &&
    ('confidence' in obj) &&
    ('detectedPhrases' in obj) &&
    ('summary' in obj) &&
    Array.isArray(obj.detectedPhrases)
  );
};

export default CrisisLanguageDetector;
```