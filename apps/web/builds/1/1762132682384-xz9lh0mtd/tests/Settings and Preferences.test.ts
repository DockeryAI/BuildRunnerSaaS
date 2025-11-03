Here's a comprehensive set of unit tests for the Settings component:

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Settings } from './Settings';
import { InstagramAPI } from '../services/instagram-api';
import settingsReducer from '../store/settingsSlice';

// Mock the Instagram API
jest.mock('../services/instagram-api');
const mockInstagramAPI = InstagramAPI as jest.Mocked<typeof InstagramAPI>;

// Mock Redux store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      settings: settingsReducer
    },
    preloadedState: {
      settings: {
        instagramConnected: false,
        notificationsEnabled: true,
        theme: 'light',
        language: 'en',
        ...initialState
      }
    }
  });
};

const renderWithProvider = (ui: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      {ui}
    </Provider>
  );
};

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInstagramAPI.checkConnection.mockResolvedValue(false);
  });

  it('renders all settings sections', () => {
    renderWithProvider(<Settings />);

    expect(screen.getByText('Instagram Connection')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  it('checks Instagram connection on mount', async () => {
    renderWithProvider(<Settings />);

    expect(mockInstagramAPI.checkConnection).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Connect Instagram')).toBeInTheDocument();
    });
  });

  it('handles Instagram connection', async () => {
    mockInstagramAPI.connect.mockResolvedValue(undefined);
    renderWithProvider(<Settings />);

    const connectButton = screen.getByText('Connect Instagram');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(mockInstagramAPI.connect).toHaveBeenCalled();
    });
  });

  it('handles Instagram disconnection', async () => {
    mockInstagramAPI.disconnect.mockResolvedValue(undefined);
    renderWithProvider(<Settings />, { instagramConnected: true });

    const disconnectButton = screen.getByText('Disconnect Instagram');
    fireEvent.click(disconnectButton);

    await waitFor(() => {
      expect(mockInstagramAPI.disconnect).toHaveBeenCalled();
    });
  });

  it('toggles notifications', () => {
    renderWithProvider(<Settings />);

    const notificationToggle = screen.getByRole('checkbox');
    expect(notificationToggle).toBeChecked();

    fireEvent.click(notificationToggle);
    expect(notificationToggle).not.toBeChecked();
  });

  it('changes theme', () => {
    renderWithProvider(<Settings />);

    const themeSelect = screen.getByRole('combobox', { name: /theme/i });
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    expect(themeSelect).toHaveValue('dark');
  });

  it('changes language', () => {
    renderWithProvider(<Settings />);

    const languageSelect = screen.getByRole('combobox', { name: /language/i });
    fireEvent.change(languageSelect, { target: { value: 'es' } });

    expect(languageSelect).toHaveValue('es');
  });

  it('saves settings and calls onSave callback', async () => {
    const onSaveMock = jest.fn();
    renderWithProvider(<Settings onSave={onSaveMock} />);

    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalled();
    });
  });

  it('displays error message when Instagram connection fails', async () => {
    mockInstagramAPI.connect.mockRejectedValue(new Error('Connection failed'));
    renderWithProvider(<Settings />);

    const connectButton = screen.getByText('Connect Instagram');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to connect to Instagram')).toBeInTheDocument();
    });
  });

  it('displays error message when Instagram disconnection fails', async () => {
    mockInstagramAPI.disconnect.mockRejectedValue(new Error('Disconnection failed'));
    renderWithProvider(<Settings />, { instagramConnected: true });

    const disconnectButton = screen.getByText('Disconnect Instagram');
    fireEvent.click(disconnectButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to disconnect from Instagram')).toBeInTheDocument();
    });
  });

  it('initializes with default settings when no current settings provided', () => {
    renderWithProvider(<Settings />);

    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByRole('combobox', { name: /theme/i })).toHaveValue('light');
    expect(screen.getByRole('combobox', { name: /language/i })).toHaveValue('en');
  });

  it('handles Instagram API check connection error', async () => {
    mockInstagramAPI.checkConnection.mockRejectedValue(new Error('Check connection failed'));
    renderWithProvider(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Failed to check Instagram connection')).toBeInTheDocument();
    });
  });
});
```

This test suite includes:

1. Setup for Redux store and mock Instagram API
2. Tests for initial rendering
3. Tests for Instagram connection/disconnection functionality
4. Tests for notification toggle
5. Tests for theme changes
6. Tests for language changes
7. Tests for saving settings
8. Error handling tests
9. Tests for default settings initialization
10. Tests for API error scenarios

The tests use:
- Jest for test running and assertions
- React Testing Library for component rendering and interaction
- Mock functions for external dependencies (InstagramAPI)
- Redux store integration testing
- Async/await testing for API calls
- Event handling testing
- Error scenario testing

Make sure to have these dependencies in your package.json:
```json
{
  "devDependencies": {
    "@testing-library/react": "^12.0.0",
    "@testing-library/jest-dom": "^5.11.4",
    "jest": "^27.0.6"
  }
}
```

And include this in your test setup:
```javascript
import '@testing-library/jest-dom';
```