import { createClient } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserPresence {
  userId: string;
  username: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  entityType?: string;
  entityId?: string;
  lastSeen: string;
}

export interface PresenceState {
  [userId: string]: UserPresence;
}

export class PresenceManager {
  private channel: RealtimeChannel | null = null;
  private projectId: string;
  private currentUser: UserPresence;
  private presenceState: PresenceState = {};
  private listeners: Array<(state: PresenceState) => void> = [];

  constructor(projectId: string, currentUser: Omit<UserPresence, 'lastSeen'>) {
    this.projectId = projectId;
    this.currentUser = {
      ...currentUser,
      lastSeen: new Date().toISOString(),
    };
  }

  /**
   * Join presence channel
   */
  async join(): Promise<void> {
    if (this.channel) {
      await this.leave();
    }

    this.channel = supabase.channel(`presence:project_${this.projectId}`, {
      config: {
        presence: {
          key: this.currentUser.userId,
        },
      },
    });

    // Track presence state changes
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState();
        this.updatePresenceState(state || {});
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      });

    // Subscribe to channel
    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track current user presence
        await this.channel?.track(this.currentUser);
      }
    });
  }

  /**
   * Leave presence channel
   */
  async leave(): Promise<void> {
    if (this.channel) {
      await this.channel.untrack();
      await this.channel.unsubscribe();
      this.channel = null;
    }
    this.presenceState = {};
    this.notifyListeners();
  }

  /**
   * Update user's active entity
   */
  async updateActiveEntity(entityType?: string, entityId?: string): Promise<void> {
    if (!this.channel) return;

    this.currentUser = {
      ...this.currentUser,
      entityType,
      entityId,
      lastSeen: new Date().toISOString(),
    };

    await this.channel.track(this.currentUser);
  }

  /**
   * Update user status
   */
  async updateStatus(status: 'online' | 'away' | 'offline'): Promise<void> {
    if (!this.channel) return;

    this.currentUser = {
      ...this.currentUser,
      status,
      lastSeen: new Date().toISOString(),
    };

    await this.channel.track(this.currentUser);
  }

  /**
   * Get current presence state
   */
  getPresenceState(): PresenceState {
    return this.presenceState;
  }

  /**
   * Get users present on a specific entity
   */
  getUsersOnEntity(entityType: string, entityId: string): UserPresence[] {
    return Object.values(this.presenceState).filter(
      user => user.entityType === entityType && user.entityId === entityId
    );
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return Object.values(this.presenceState).filter(
      user => user.status === 'online'
    ).length;
  }

  /**
   * Add presence state listener
   */
  addListener(listener: (state: PresenceState) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove presence state listener
   */
  removeListener(listener: (state: PresenceState) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Update presence state from channel
   */
  private updatePresenceState(channelState: any): void {
    const newState: PresenceState = {};

    Object.entries(channelState).forEach(([userId, presences]) => {
      const presenceArray = presences as any[];
      if (presenceArray.length > 0) {
        // Take the most recent presence
        const presence = presenceArray[0];
        newState[userId] = {
          userId: presence.userId,
          username: presence.username,
          avatar: presence.avatar,
          status: presence.status,
          entityType: presence.entityType,
          entityId: presence.entityId,
          lastSeen: presence.lastSeen,
        };
      }
    });

    this.presenceState = newState;
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.presenceState);
      } catch (error) {
        console.error('Error in presence listener:', error);
      }
    });
  }
}

/**
 * React hook for presence management
 */
export function usePresence(
  projectId: string,
  currentUser: Omit<UserPresence, 'lastSeen'>
) {
  const [presenceManager] = React.useState(
    () => new PresenceManager(projectId, currentUser)
  );
  const [presenceState, setPresenceState] = React.useState<PresenceState>({});

  React.useEffect(() => {
    const handlePresenceChange = (state: PresenceState) => {
      setPresenceState(state);
    };

    presenceManager.addListener(handlePresenceChange);
    presenceManager.join();

    return () => {
      presenceManager.removeListener(handlePresenceChange);
      presenceManager.leave();
    };
  }, [presenceManager]);

  const updateActiveEntity = React.useCallback(
    (entityType?: string, entityId?: string) => {
      presenceManager.updateActiveEntity(entityType, entityId);
    },
    [presenceManager]
  );

  const updateStatus = React.useCallback(
    (status: 'online' | 'away' | 'offline') => {
      presenceManager.updateStatus(status);
    },
    [presenceManager]
  );

  const getUsersOnEntity = React.useCallback(
    (entityType: string, entityId: string) => {
      return presenceManager.getUsersOnEntity(entityType, entityId);
    },
    [presenceManager]
  );

  return {
    presenceState,
    updateActiveEntity,
    updateStatus,
    getUsersOnEntity,
    onlineUsersCount: presenceManager.getOnlineUsersCount(),
  };
}

// Import React for the hook
import React from 'react';
