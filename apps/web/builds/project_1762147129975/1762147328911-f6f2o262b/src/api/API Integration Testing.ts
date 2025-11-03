/**
 * @file APIIntegrationTest.tsx
 * API integration testing component for validating endpoints and data flow
 */

import React, { useState, useEffect } from 'react';

interface APITestResult {
  endpoint: string;
  status: 'success' | 'failure' | 'pending';
  responseTime: number;
  error?: string;
}

interface APITestConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: any;
  expectedStatus: number;
}

const defaultTests: APITestConfig[] = [
  {
    endpoint: '/api/users',
    method: 'GET',
    expectedStatus: 200
  },
  {
    endpoint: '/api/auth',
    method: 'POST',
    payload: {
      username: 'test',
      password: 'test123'
    },
    expectedStatus: 200
  }
];

export const APIIntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<APITestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Executes a single API test
   * @param config Test configuration object
   * @returns Test result object
   */
  const runSingleTest = async (config: APITestConfig): Promise<APITestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(config.endpoint, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: config.payload ? JSON.stringify(config.payload) : undefined
      });

      const endTime = Date.now();
      
      return {
        endpoint: config.endpoint,
        status: response.status === config.expectedStatus ? 'success' : 'failure',
        responseTime: endTime - startTime,
        error: response.status !== config.expectedStatus ? 
          `Expected status ${config.expectedStatus}, got ${response.status}` : undefined
      };

    } catch (err) {
      const endTime = Date.now();
      
      return {
        endpoint: config.endpoint,
        status: 'failure', 
        responseTime: endTime - startTime,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      };
    }
  };

  /**
   * Runs all configured API tests
   */
  const runAllTests = async () => {
    setIsRunning(true);
    setError(null);
    setTestResults([]);

    try {
      const results = await Promise.all(
        defaultTests.map(async (test) => {
          const result = await runSingleTest(test);
          setTestResults(prev => [...prev, result]);
          return result;
        })
      );

      console.log('All tests completed:', results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run tests');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="api-test-container">
      <h2>API Integration Tests</h2>
      
      <button 
        onClick={runAllTests}
        disabled={isRunning}
        className="run-tests-button"
      >
        {isRunning ? 'Running Tests...' : 'Run Tests'}
      </button>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      <div className="test-results">
        {testResults.map((result, index) => (
          <div 
            key={`${result.endpoint}-${index}`}
            className={`test-result ${result.status}`}
          >
            <div className="endpoint">{result.endpoint}</div>
            <div className="status">Status: {result.status}</div>
            <div className="response-time">
              Response Time: {result.responseTime}ms
            </div>
            {result.error && (
              <div className="error">Error: {result.error}</div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .api-test-container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .run-tests-button {
          padding: 10px 20px;
          margin: 20px 0;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .run-tests-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          color: #dc3545;
          margin: 10px 0;
          padding: 10px;
          border: 1px solid #dc3545;
          border-radius: 4px;
        }

        .test-result {
          margin: 10px 0;
          padding: 15px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .test-result.success {
          border-color: #28a745;
        }

        .test-result.failure {
          border-color: #dc3545;
        }

        .test-result.pending {
          border-color: #ffc107;
        }

        .endpoint {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .status {
          margin-bottom: 5px;
        }

        .response-time {
          color: #666;
          font-size: 0.9em;
        }

        .error {
          color: #dc3545;
          margin-top: 5px;
        }
      `}</style>
    </div>
  );
};

export default APIIntegrationTest;