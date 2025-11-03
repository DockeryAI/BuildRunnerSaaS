import React, { useState, useEffect } from 'react';
import { ApiKeyConfig } from '../types/apiConfig';

interface SwiftComponentProps {
  apiEndpoint: string;
  onError?: (error: Error) => void;
}

/**
 * Component for handling Swift-like animations and transitions in React
 * @param {SwiftComponentProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export const SwiftComponent: React.FC<SwiftComponentProps> = ({ 
  apiEndpoint,
  onError
}) => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch API keys');
        }
        const keys = await response.json();
        setApiKeys(keys);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
      }
    };

    fetchApiKeys();
  }, [apiEndpoint, onError]);

  /**
   * Handles animation trigger
   */
  const handleAnimationTrigger = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  /**
   * Renders error state
   */
  if (error) {
    return (
      <div className="swift-error" role="alert">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div 
      className={`swift-container ${isAnimating ? 'animating' : ''}`}
      onClick={handleAnimationTrigger}
    >
      <div className="swift-content">
        {apiKeys ? (
          <div className="swift-data">
            <h3>API Configuration</h3>
            <pre>{JSON.stringify(apiKeys, null, 2)}</pre>
          </div>
        ) : (
          <div className="swift-loading">Loading...</div>
        )}
      </div>

      <style jsx>{`
        .swift-container {
          padding: 20px;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .swift-container.animating {
          transform: scale(0.98);
        }

        .swift-content {
          min-height: 100px;
        }

        .swift-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100px;
        }

        .swift-error {
          padding: 16px;
          color: #721c24;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
        }

        .swift-data {
          padding: 16px;
        }

        .swift-data pre {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
};

export default SwiftComponent;