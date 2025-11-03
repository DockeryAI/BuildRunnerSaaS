```typescript
/**
 * @file AppReviewGuidelines.tsx
 * @description Component to handle Instagram API compliance and review guidelines
 */

import React, { useEffect, useState } from 'react';
import { InstagramAPI } from '../services/instagram';

interface ComplianceStatus {
  isCompliant: boolean;
  violations: string[];
  lastChecked: Date;
}

interface AppReviewGuidelinesProps {
  apiKey: string;
  onComplianceChange?: (status: ComplianceStatus) => void;
}

/**
 * Component that checks and displays Instagram API compliance status
 * @param props Component props
 * @returns JSX.Element
 */
export const AppReviewGuidelines: React.FC<AppReviewGuidelinesProps> = ({
  apiKey,
  onComplianceChange
}) => {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    isCompliant: false,
    violations: [],
    lastChecked: new Date()
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Checks API compliance status
   * @throws {Error} If API request fails
   */
  const checkCompliance = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const api = new InstagramAPI(apiKey);
      const status = await api.checkComplianceStatus();

      const newStatus: ComplianceStatus = {
        isCompliant: status.compliant,
        violations: status.violations || [],
        lastChecked: new Date()
      };

      setComplianceStatus(newStatus);
      onComplianceChange?.(newStatus);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check compliance');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void checkCompliance();
    
    // Check compliance every 12 hours
    const interval = setInterval(() => {
      void checkCompliance();
    }, 12 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [apiKey]);

  if (isLoading) {
    return <div className="compliance-loader">Checking compliance status...</div>;
  }

  if (error) {
    return (
      <div className="compliance-error" role="alert">
        <h3>Error Checking Compliance</h3>
        <p>{error}</p>
        <button 
          onClick={() => void checkCompliance()}
          className="retry-button"
        >
          Retry Check
        </button>
      </div>
    );
  }

  return (
    <div className="compliance-status">
      <h2>App Review Guidelines Status</h2>
      
      <div className={`status-indicator ${complianceStatus.isCompliant ? 'compliant' : 'non-compliant'}`}>
        {complianceStatus.isCompliant ? 'Compliant' : 'Non-Compliant'}
      </div>

      {complianceStatus.violations.length > 0 && (
        <div className="violations">
          <h3>Violations Found:</h3>
          <ul>
            {complianceStatus.violations.map((violation, index) => (
              <li key={index}>{violation}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="last-checked">
        Last checked: {complianceStatus.lastChecked.toLocaleString()}
      </div>

      <button 
        onClick={() => void checkCompliance()}
        className="refresh-button"
      >
        Refresh Status
      </button>
    </div>
  );
};

/**
 * CSS Styles
 */
const styles = `
.compliance-status {
  padding: 20px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-indicator {
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  font-weight: bold;
}

.status-indicator.compliant {
  background: #e6ffe6;
  color: #006600;
}

.status-indicator.non-compliant {
  background: #ffe6e6;
  color: #cc0000;
}

.violations {
  margin: 15px 0;
  padding: 15px;
  background: #fff8f8;
  border-left: 4px solid #cc0000;
}

.last-checked {
  font-size: 0.9em;
  color: #666;
  margin: 10px 0;
}

.refresh-button,
.retry-button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-button:hover,
.retry-button:hover {
  background: #0056b3;
}

.compliance-loader {
  padding: 20px;
  text-align: center;
  color: #666;
}

.compliance-error {
  padding: 20px;
  background: #fff8f8;
  border: 1px solid #cc0000;
  border-radius: 8px;
  color: #cc0000;
}
`;

export default AppReviewGuidelines;
```