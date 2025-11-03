```typescript
/**
 * @fileoverview Agora.io service for handling real-time communication
 */

import AgoraRTC, { 
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  UID,
  IRemoteAudioTrack,
  IRemoteVideoTrack
} from 'agora-rtc-sdk-ng';

/**
 * Configuration options for Agora service
 */
export interface AgoraConfig {
  appId: string;
  channel: string;
  token?: string;
  uid?: number;
}

/**
 * Service class for managing Agora.io real-time communication
 */
export class AgoraService {
  private client: IAgoraRTCClient;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private config: AgoraConfig;

  /**
   * Creates an instance of AgoraService
   * @param config - Configuration options for Agora
   */
  constructor(config: AgoraConfig) {
    this.config = config;
    this.client = AgoraRTC.createClient({ 
      mode: 'rtc',
      codec: 'vp8'
    });
  }

  /**
   * Initializes the Agora client and joins the specified channel
   * @throws {Error} If initialization fails
   */
  public async initialize(): Promise<void> {
    try {
      await this.client.join(
        this.config.appId,
        this.config.channel,
        this.config.token || null,
        this.config.uid || null
      );
    } catch (error) {
      throw new Error(`Failed to initialize Agora client: ${error}`);
    }
  }

  /**
   * Creates and publishes local audio and video tracks
   * @throws {Error} If track creation or publishing fails
   */
  public async publishTracks(): Promise<void> {
    try {
      [this.localAudioTrack, this.localVideoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()
      ]);

      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
    } catch (error) {
      throw new Error(`Failed to publish tracks: ${error}`);
    }
  }

  /**
   * Unpublishes and closes local tracks
   */
  public async unpublishTracks(): Promise<void> {
    try {
      if (this.localAudioTrack) {
        await this.client.unpublish(this.localAudioTrack);
        this.localAudioTrack.close();
      }
      if (this.localVideoTrack) {
        await this.client.unpublish(this.localVideoTrack);
        this.localVideoTrack.close();
      }
    } catch (error) {
      throw new Error(`Failed to unpublish tracks: ${error}`);
    }
  }

  /**
   * Leaves the current channel and releases resources
   */
  public async leave(): Promise<void> {
    try {
      await this.unpublishTracks();
      await this.client.leave();
    } catch (error) {
      throw new Error(`Failed to leave channel: ${error}`);
    }
  }

  /**
   * Subscribes to remote user events
   * @param onUserJoined - Callback when a user joins
   * @param onUserLeft - Callback when a user leaves
   */
  public subscribeToUserEvents(
    onUserJoined: (uid: UID, tracks: { audioTrack: IRemoteAudioTrack, videoTrack: IRemoteVideoTrack }) => void,
    onUserLeft: (uid: UID) => void
  ): void {
    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        onUserJoined(user.uid, {
          audioTrack: user.audioTrack as IRemoteAudioTrack,
          videoTrack: user.videoTrack as IRemoteVideoTrack
        });
      }
    });

    this.client.on('user-left', user => {
      onUserLeft(user.uid);
    });
  }

  /**
   * Mutes/unmutes local audio
   * @param mute - Whether to mute audio
   */
  public muteAudio(mute: boolean): void {
    if (this.localAudioTrack) {
      this.localAudioTrack.setEnabled(!mute);
    }
  }

  /**
   * Mutes/unmutes local video
   * @param mute - Whether to mute video
   */
  public muteVideo(mute: boolean): void {
    if (this.localVideoTrack) {
      this.localVideoTrack.setEnabled(!mute);
    }
  }

  /**
   * Gets the local video track
   * @returns The local video track or null if not created
   */
  public getLocalVideoTrack(): ICameraVideoTrack | null {
    return this.localVideoTrack;
  }

  /**
   * Gets the local audio track
   * @returns The local audio track or null if not created
   */
  public getLocalAudioTrack(): IMicrophoneAudioTrack | null {
    return this.localAudioTrack;
  }

  /**
   * Gets the Agora client instance
   * @returns The Agora RTC client
   */
  public getClient(): IAgoraRTCClient {
    return this.client;
  }
}
```