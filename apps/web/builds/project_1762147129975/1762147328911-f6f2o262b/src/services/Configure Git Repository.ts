import React, { useState, useCallback } from 'react';

interface GitConfig {
  repositoryUrl: string;
  branch: string;
  username: string;
  token: string;
}

interface GitConfigServiceProps {
  onConfigSaved: (config: GitConfig) => void;
  initialConfig?: GitConfig;
}

/**
 * Component for configuring Git repository settings
 * @param {GitConfigServiceProps} props - Component props
 * @returns {JSX.Element} Git configuration form
 */
export const GitConfigService: React.FC<GitConfigServiceProps> = ({ 
  onConfigSaved,
  initialConfig
}) => {
  const [config, setConfig] = useState<GitConfig>({
    repositoryUrl: initialConfig?.repositoryUrl || '',
    branch: initialConfig?.branch || 'main',
    username: initialConfig?.username || '',
    token: initialConfig?.token || ''
  });

  const [error, setError] = useState<string>('');

  /**
   * Validates the Git configuration
   * @returns {boolean} Whether config is valid
   */
  const validateConfig = useCallback((): boolean => {
    if (!config.repositoryUrl) {
      setError('Repository URL is required');
      return false;
    }
    if (!config.branch) {
      setError('Branch name is required');
      return false;
    }
    if (!config.username) {
      setError('Username is required');
      return false;
    }
    if (!config.token) {
      setError('Access token is required');
      return false;
    }
    return true;
  }, [config]);

  /**
   * Handles form submission
   * @param {React.FormEvent} e - Form event
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (validateConfig()) {
      try {
        onConfigSaved(config);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save configuration');
      }
    }
  }, [config, validateConfig, onConfigSaved]);

  /**
   * Updates config state when form fields change
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  return (
    <div className="git-config-service">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="repositoryUrl">Repository URL</label>
          <input
            type="text"
            id="repositoryUrl"
            name="repositoryUrl"
            value={config.repositoryUrl}
            onChange={handleChange}
            placeholder="https://github.com/username/repo.git"
          />
        </div>

        <div className="form-group">
          <label htmlFor="branch">Branch</label>
          <input
            type="text"
            id="branch"
            name="branch"
            value={config.branch}
            onChange={handleChange}
            placeholder="main"
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={config.username}
            onChange={handleChange}
            placeholder="Git username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="token">Access Token</label>
          <input
            type="password"
            id="token"
            name="token"
            value={config.token}
            onChange={handleChange}
            placeholder="Git access token"
          />
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <button type="submit">Save Configuration</button>
      </form>
    </div>
  );
};

export default GitConfigService;