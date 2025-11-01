/**
 * Connection Store
 *
 * Manages user connections to external services (GitHub, Supabase, etc.)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserConnection,
  IntegrationType,
  ConnectionStatus,
  OpenRouterConnection,
} from '../integrations/types';

interface ConnectionState {
  // Connections
  connections: UserConnection[];

  // OpenRouter configuration
  openRouterConfig: OpenRouterConnection;

  // Actions
  addConnection: (connection: Omit<UserConnection, 'id' | 'connectedAt'>) => void;
  updateConnection: (id: string, updates: Partial<UserConnection>) => void;
  removeConnection: (id: string) => void;
  getConnection: (type: IntegrationType) => UserConnection | null;
  isConnected: (type: IntegrationType) => boolean;
  getAccessToken: (type: IntegrationType) => string | null;

  // OpenRouter specific
  setOpenRouterConfig: (config: OpenRouterConnection) => void;
  getOpenRouterKey: () => string | null;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      connections: [],
      openRouterConfig: {
        useOwnKey: false,
        useBuildRunnerKey: true,
        acceptedPricing: false,
      },

      addConnection: (connection) => {
        const newConnection: UserConnection = {
          ...connection,
          id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          connectedAt: new Date().toISOString(),
        };

        set((state) => ({
          connections: [
            ...state.connections.filter((c) => c.integrationType !== connection.integrationType),
            newConnection,
          ],
        }));
      },

      updateConnection: (id, updates) => {
        set((state) => ({
          connections: state.connections.map((conn) =>
            conn.id === id ? { ...conn, ...updates } : conn
          ),
        }));
      },

      removeConnection: (id) => {
        set((state) => ({
          connections: state.connections.filter((conn) => conn.id !== id),
        }));
      },

      getConnection: (type) => {
        const connections = get().connections;
        return connections.find((c) => c.integrationType === type && c.status === 'connected') || null;
      },

      isConnected: (type) => {
        return get().getConnection(type) !== null;
      },

      getAccessToken: (type) => {
        const connection = get().getConnection(type);
        if (!connection) return null;

        if (connection.oauth) {
          return connection.oauth.accessToken;
        }

        if (connection.apiKey) {
          return connection.apiKey.key;
        }

        return null;
      },

      setOpenRouterConfig: (config) => {
        set({ openRouterConfig: config });
      },

      getOpenRouterKey: () => {
        const config = get().openRouterConfig;

        if (config.useOwnKey && config.apiKey) {
          return config.apiKey;
        }

        if (config.useBuildRunnerKey) {
          // Use BuildRunner's key (server-side only)
          return 'USE_BUILDRUNNER_KEY';
        }

        return null;
      },
    }),
    {
      name: 'connection-storage',
      version: 1,
    }
  )
);
