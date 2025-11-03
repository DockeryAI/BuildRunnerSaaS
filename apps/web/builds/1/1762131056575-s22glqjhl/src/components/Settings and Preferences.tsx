```typescript
import React, { useState, useEffect } from 'react';
import { useInstagramAuth } from '../hooks/useInstagramAuth';
import { UserPreferences, Theme, NotificationSettings } from '../types/settings';

/**
 * Interface for Settings component props
 */
interface SettingsProps {
  userId: string;
  onSave: (preferences: UserPreferences) => Promise<void>;
}

/**
 * Component for managing user settings and preferences
 * @component
 */
const Settings: React.FC<SettingsProps> = ({ userId, onSave }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    language: 'en',
    instagramConnected: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connectInstagram, disconnectInstagram, isConnected } = useInstagramAuth();

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/preferences/${userId}`);
        if (!response.ok) throw new Error('Failed to load preferences');
        const data = await response.json();
        setPreferences(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [userId]);

  /**
   * Handles theme changes
   * @param theme - Selected theme
   */
  const handleThemeChange = (theme: Theme) => {
    setPreferences(prev => ({
      ...prev,
      theme
    }));
  };

  /**
   * Handles notification setting changes
   * @param setting - Notification setting to update
   * @param enabled - New value
   */
  const handleNotificationChange = (setting: keyof NotificationSettings, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: enabled
      }
    }));
  };

  /**
   * Handles language selection
   * @param language - Selected language code
   */
  const handleLanguageChange = (language: string) => {
    setPreferences(prev => ({
      ...prev,
      language
    }));
  };

  /**
   * Handles Instagram connection
   */
  const handleInstagramConnect = async () => {
    try {
      setLoading(true);
      await connectInstagram();
      setPreferences(prev => ({
        ...prev,
        instagramConnected: true
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Instagram');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form submission
   * @param e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave(preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading...</div>;
  }

  return (
    <form className="settings-container" onSubmit={handleSubmit}>
      {error && (
        <div className="settings-error">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <section className="settings-section">
        <h2>Theme</h2>
        <select
          value={preferences.theme}
          onChange={e => handleThemeChange(e.target.value as Theme)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </section>

      <section className="settings-section">
        <h2>Notifications</h2>
        {Object.entries(preferences.notifications).map(([key, value]) => (
          <label key={key} className="notification-option">
            <input
              type="checkbox"
              checked={value}
              onChange={e => handleNotificationChange(key as keyof NotificationSettings, e.target.checked)}
            />
            {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
          </label>
        ))}
      </section>

      <section className="settings-section">
        <h2>Language</h2>
        <select
          value={preferences.language}
          onChange={e => handleLanguageChange(e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </section>

      <section className="settings-section">
        <h2>Connected Accounts</h2>
        {preferences.instagramConnected ? (
          <button
            type="button"
            className="instagram-disconnect"
            onClick={disconnectInstagram}
          >
            Disconnect Instagram
          </button>
        ) : (
          <button
            type="button"
            className="instagram-connect"
            onClick={handleInstagramConnect}
          >
            Connect Instagram
          </button>
        )}
      </section>

      <button
        type="submit"
        className="settings-save"
        disabled={loading}
      >
        Save Changes
      </button>
    </form>
  );
};

export default Settings;
```