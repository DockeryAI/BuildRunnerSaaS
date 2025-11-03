```typescript
/**
 * @fileoverview Service for integrating with the Daily.co video platform
 */

import DailyIframe from '@daily-co/daily-js';

export interface DailyConfig {
  url: string;
  token?: string;
  userName?: string;
  roomName?: string;
}

export interface DailyParticipant {
  id: string;
  userName: string;
  video: boolean;
  audio: boolean;
}

export interface DailyError {
  code: string;
  message: string;
}

/**
 * Service class for managing Daily.co video calls
 */
export class DailyService {
  private callFrame: DailyIframe.DailyCall | null = null;
  private participants: Map<string, DailyParticipant> = new Map();
  private onParticipantUpdateCallbacks: ((participants: DailyParticipant[]) => void)[] = [];

  /**
   * Initializes a Daily.co video call
   * @param config - Configuration options for the call
   * @throws {Error} If initialization fails
   */
  public async initializeCall(config: DailyConfig): Promise<void> {
    try {
      this.callFrame = await DailyIframe.createFrame({
        url: config.url,
        token: config.token,
        userName: config.userName,
        showLeaveButton: true,
      });

      this.setupEventListeners();
      
      await this.callFrame.join({
        userName: config.userName,
      });
    } catch (error) {
      this.handleError('Failed to initialize call', error as Error);
    }
  }

  /**
   * Leaves and destroys the current video call
   */
  public async leaveCall(): Promise<void> {
    try {
      if (this.callFrame) {
        await this.callFrame.leave();
        this.callFrame.destroy();
        this.callFrame = null;
        this.participants.clear();
        this.notifyParticipantUpdate();
      }
    } catch (error) {
      this.handleError('Failed to leave call', error as Error);
    }
  }

  /**
   * Toggles local participant's video
   * @returns Current video enabled state
   */
  public async toggleVideo(): Promise<boolean> {
    try {
      if (!this.callFrame) throw new Error('Call not initialized');
      const state = await this.callFrame.setLocalVideo(!this.callFrame.localVideo());
      return state;
    } catch (error) {
      this.handleError('Failed to toggle video', error as Error);
      return false;
    }
  }

  /**
   * Toggles local participant's audio
   * @returns Current audio enabled state
   */
  public async toggleAudio(): Promise<boolean> {
    try {
      if (!this.callFrame) throw new Error('Call not initialized');
      const state = await this.callFrame.setLocalAudio(!this.callFrame.localAudio());
      return state;
    } catch (error) {
      this.handleError('Failed to toggle audio', error as Error);
      return false;
    }
  }

  /**
   * Subscribes to participant updates
   * @param callback - Function to be called when participants change
   */
  public onParticipantsUpdate(callback: (participants: DailyParticipant[]) => void): void {
    this.onParticipantUpdateCallbacks.push(callback);
  }

  /**
   * Gets current call statistics
   * @returns Call statistics object
   */
  public async getCallStats(): Promise<DailyIframe.DailyCallStats | null> {
    try {
      if (!this.callFrame) throw new Error('Call not initialized');
      return await this.callFrame.getNetworkStats();
    } catch (error) {
      this.handleError('Failed to get call stats', error as Error);
      return null;
    }
  }

  private setupEventListeners(): void {
    if (!this.callFrame) return;

    this.callFrame
      .on('participant-joined', this.handleParticipantJoined.bind(this))
      .on('participant-left', this.handleParticipantLeft.bind(this))
      .on('participant-updated', this.handleParticipantUpdated.bind(this))
      .on('error', this.handleDailyError.bind(this));
  }

  private handleParticipantJoined(event: DailyIframe.DailyEventObjectParticipant): void {
    const participant: DailyParticipant = {
      id: event.participant.session_id,
      userName: event.participant.user_name || 'Anonymous',
      video: event.participant.video,
      audio: event.participant.audio,
    };
    this.participants.set(participant.id, participant);
    this.notifyParticipantUpdate();
  }

  private handleParticipantLeft(event: DailyIframe.DailyEventObjectParticipant): void {
    this.participants.delete(event.participant.session_id);
    this.notifyParticipantUpdate();
  }

  private handleParticipantUpdated(event: DailyIframe.DailyEventObjectParticipant): void {
    const participant: DailyParticipant = {
      id: event.participant.session_id,
      userName: event.participant.user_name || 'Anonymous',
      video: event.participant.video,
      audio: event.participant.audio,
    };
    this.participants.set(participant.id, participant);
    this.notifyParticipantUpdate();
  }

  private notifyParticipantUpdate(): void {
    const participantsList = Array.from(this.participants.values());
    this.onParticipantUpdateCallbacks.forEach(callback => callback(participantsList));
  }

  private handleDailyError(error: DailyError): void {
    console.error('Daily.co error:', error);
    // Implement custom error handling logic here
  }

  private handleError(message: string, error: Error): void {
    console.error(message, error);
    throw new Error(`${message}: ${error.message}`);
  }
}

export default DailyService;
```