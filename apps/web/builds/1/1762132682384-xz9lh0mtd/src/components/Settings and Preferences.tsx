```typescript
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InstagramAPI } from '../services/instagram-api';
import { updateSettings, SettingsState } from '../store/settingsSlice';
import { RootState } from '../store/store';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface SettingsProps {
  onSave?: () => void;
}

/**
 * Settings and preferences component that allows users to configure their Instagram integration
 * and other app preferences
 * @param props - Component props
 * @returns Settings component
 */
export const Settings: React.FC<SettingsProps> = ({ onSave }) => {
  const dispatch = useDispatch();
  const currentSettings = useSelector((state: RootState) => state.settings);
  
  const [settings, setSettings] = useState<SettingsState>({
    instagramConnected: false,
    notificationsEnabled: true,
    theme: 'light',
    language: 'en',
    ...currentSettings
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkInstagramConnection = async () => {
      try {
        const isConnected = await InstagramAPI.checkConnection();
        setSettings(prev => ({
          ...prev,
          instagramConnected: isConnected
        }));
      } catch (err) {
        setError('Failed to check Instagram connection');
        console.error(err);
      }
    };

    checkInstagramConnection();
  }, []);

  /**
   * Handles connecting to Instagram account
   */
  const handleInstagramConnect = async () => {
    try {
      await InstagramAPI.connect();
      setSettings(prev => ({
        ...prev,
        instagramConnected: true
      }));
      setError(null);
    } catch (err) {
      setError('Failed to connect to Instagram');
      console.error(err);
    }
  };

  /**
   * Handles disconnecting from Instagram account
   */
  const handleInstagramDisconnect = async () => {
    try {
      await InstagramAPI.disconnect();
      setSettings(prev => ({
        ...prev,
        instagramConnected: false
      }));
      setError(null);
    } catch (err) {
      setError('Failed to disconnect from Instagram');
      console.error(err);
    }
  };

  /**
   * Handles toggling notification settings
   */
  const handleNotificationToggle = () => {
    setSettings(prev => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled
    }));
  };

  /**
   * Handles theme changes
   * @param theme - Selected theme
   */
  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
  };

  /**
   * Handles language changes
   * @param language - Selected language code
   */
  const handleLanguageChange = (language: string) => {
    setSettings(prev => ({
      ...prev,
      language
    }));
  };

  /**
   * Saves all settings
   */
  const handleSave = async () => {
    try {
      dispatch(updateSettings(settings));
      onSave?.();
      setError(null);
    } catch (err) {
      setError('Failed to save settings');
      console.error(err);
    }
  };

  return (
    <ErrorBoundary>
      <div className="settings-container">
        <h2>Settings</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="instagram-settings">
          <h3>Instagram Connection</h3>
          {settings.instagramConnected ? (
            <button 
              onClick={handleInstagramDisconnect}
              className="disconnect-button"
            >
              Disconnect Instagram
            </button>
          ) : (
            <button 
              onClick={handleInstagramConnect}
              className="connect-button"
            >
              Connect Instagram
            </button>
          )}
        </section>

        <section className="notification-settings">
          <h3>Notifications</h3>
          <label>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={handleNotificationToggle}
            />
            Enable Notifications
          </label>
        </section>

        <section className="theme-settings">
          <h3>Theme</h3>
          <select
            value={settings.theme}
            onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark')}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </section>

        <section className="language-settings">
          <h3>Language</h3>
          <select
            value={settings.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </section>

        <button 
          onClick={handleSave}
          className="save-button"
        >
          Save Settings
        </button>
      </div>
    </ErrorBoundary>
  );
};

export default Settings;
```