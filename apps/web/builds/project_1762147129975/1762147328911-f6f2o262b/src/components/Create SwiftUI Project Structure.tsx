/**
 * @file ProjectStructure.tsx
 * Types and components for managing project structure
 */

import React, { useState, useEffect } from 'react';

interface ApiConfig {
  apiKey: string;
  endpoint: string;
}

interface ProjectConfig {
  name: string;
  description: string;
  apiConfig: ApiConfig;
}

interface ProjectStructureProps {
  initialConfig?: ProjectConfig;
  onConfigUpdate?: (config: ProjectConfig) => void;
}

/**
 * Component for setting up and managing project structure
 * @param props - Component props
 * @returns Project structure configuration component
 */
export const ProjectStructure: React.FC<ProjectStructureProps> = ({
  initialConfig,
  onConfigUpdate
}) => {
  const [config, setConfig] = useState<ProjectConfig>({
    name: '',
    description: '',
    apiConfig: {
      apiKey: '',
      endpoint: ''
    }
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  /**
   * Validates project configuration
   * @param config - Project config to validate
   * @returns True if valid, false otherwise
   */
  const validateConfig = (config: ProjectConfig): boolean => {
    if (!config.name || config.name.trim() === '') {
      setError('Project name is required');
      return false;
    }
    if (!config.apiConfig.apiKey || config.apiConfig.apiKey.trim() === '') {
      setError('API key is required');
      return false;
    }
    if (!config.apiConfig.endpoint || config.apiConfig.endpoint.trim() === '') {
      setError('API endpoint is required');
      return false;
    }
    return true;
  };

  /**
   * Updates project configuration
   * @param field - Field to update
   * @param value - New value
   */
  const handleConfigUpdate = (
    field: keyof ProjectConfig | 'apiKey' | 'endpoint',
    value: string
  ) => {
    setError(null);

    const newConfig = { ...config };
    if (field === 'apiKey' || field === 'endpoint') {
      newConfig.apiConfig = {
        ...newConfig.apiConfig,
        [field]: value
      };
    } else {
      newConfig[field] = value;
    }

    setConfig(newConfig);

    if (onConfigUpdate && validateConfig(newConfig)) {
      onConfigUpdate(newConfig);
    }
  };

  return (
    <div className="project-structure">
      <h2>Project Configuration</h2>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor="projectName">Project Name:</label>
          <input
            id="projectName"
            type="text"
            value={config.name}
            onChange={(e) => handleConfigUpdate('name', e.target.value)}
            placeholder="Enter project name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectDescription">Description:</label>
          <textarea
            id="projectDescription"
            value={config.description}
            onChange={(e) => handleConfigUpdate('description', e.target.value)}
            placeholder="Enter project description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="apiKey">API Key:</label>
          <input
            id="apiKey"
            type="password"
            value={config.apiConfig.apiKey}
            onChange={(e) => handleConfigUpdate('apiKey', e.target.value)}
            placeholder="Enter API key"
          />
        </div>

        <div className="form-group">
          <label htmlFor="apiEndpoint">API Endpoint:</label>
          <input
            id="apiEndpoint"
            type="text"
            value={config.apiConfig.endpoint}
            onChange={(e) => handleConfigUpdate('endpoint', e.target.value)}
            placeholder="Enter API endpoint"
          />
        </div>
      </form>

      <style jsx>{`
        .project-structure {
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .form-group {
          margin-bottom: 15px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        input,
        textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        textarea {
          min-height: 100px;
          resize: vertical;
        }

        .error-message {
          color: #dc3545;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #dc3545;
          border-radius: 4px;
          background-color: #f8d7da;
        }
      `}</style>
    </div>
  );
};

export default ProjectStructure;