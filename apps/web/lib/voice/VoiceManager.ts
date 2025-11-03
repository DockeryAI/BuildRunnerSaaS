/**
 * Voice Manager
 * Main orchestrator for voice input/output system
 */

import { DeepgramClient, TranscriptResult } from './DeepgramClient';
import { ElevenLabsClient } from './ElevenLabsClient';
import { IntentRouter, Intent, IntentHandler } from './IntentRouter';
import { voiceContext, VoicePage } from './VoiceContext';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface VoiceConfig {
  deepgramApiKey: string;
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
  anthropicApiKey: string;
  autoSpeak?: boolean; // Automatically speak responses
  interimResults?: boolean; // Show interim transcripts
}

export interface VoiceEvent {
  type: 'transcript' | 'state' | 'intent' | 'response' | 'error';
  data: any;
}

export class VoiceManager {
  private deepgram: DeepgramClient;
  private elevenlabs: ElevenLabsClient;
  private intentRouter: IntentRouter;
  private config: VoiceConfig;
  private state: VoiceState = 'idle';
  private listeners: ((event: VoiceEvent) => void)[] = [];
  private currentTranscript: string = '';
  private transcriptTimeout: NodeJS.Timeout | null = null;

  constructor(config: VoiceConfig) {
    this.config = config;
    this.deepgram = new DeepgramClient(config.deepgramApiKey);
    this.elevenlabs = new ElevenLabsClient(config.elevenLabsApiKey, config.elevenLabsVoiceId);
    this.intentRouter = new IntentRouter(config.anthropicApiKey);
  }

  /**
   * Start listening to user voice
   */
  async startListening(): Promise<void> {
    if (this.state === 'listening') {
      console.warn('Already listening');
      return;
    }

    try {
      this.setState('listening');
      this.currentTranscript = '';

      await this.deepgram.startListening(
        (result: TranscriptResult) => this.handleTranscript(result),
        (error: Error) => this.handleError(error)
      );

      this.emit({ type: 'state', data: { state: 'listening' } });
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.state !== 'listening') {
      return;
    }

    this.deepgram.stopListening();
    this.setState('idle');
    this.emit({ type: 'state', data: { state: 'idle' } });

    // Process final transcript if exists
    if (this.currentTranscript.trim().length > 0) {
      this.processTranscript(this.currentTranscript);
    }
  }

  /**
   * Speak text via TTS
   */
  async speak(text: string): Promise<void> {
    try {
      this.setState('speaking');
      this.emit({ type: 'state', data: { state: 'speaking' } });

      await this.elevenlabs.speak(text);

      this.setState('idle');
      this.emit({ type: 'state', data: { state: 'idle' } });
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    this.elevenlabs.stop();
    if (this.state === 'speaking') {
      this.setState('idle');
      this.emit({ type: 'state', data: { state: 'idle' } });
    }
  }

  /**
   * Register intent handler
   */
  registerHandler(name: string, handler: IntentHandler): void {
    this.intentRouter.registerHandler(name, handler);
  }

  /**
   * Set current page context
   */
  setPage(page: VoicePage): void {
    voiceContext.setCurrentPage(page);
  }

  /**
   * Set current project context
   */
  setProject(projectId: string, projectName?: string): void {
    voiceContext.setProject(projectId, projectName);
  }

  /**
   * Get current state
   */
  getState(): VoiceState {
    return this.state;
  }

  /**
   * Check if microphone permission is granted
   */
  static async checkMicrophonePermission(): Promise<PermissionState> {
    return DeepgramClient.checkMicrophonePermission();
  }

  /**
   * Subscribe to voice events
   */
  on(listener: (event: VoiceEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Handle transcript from Deepgram
   */
  private handleTranscript(result: TranscriptResult): void {
    // Emit interim or final transcript
    this.emit({
      type: 'transcript',
      data: {
        transcript: result.transcript,
        isFinal: result.isFinal,
        confidence: result.confidence,
      },
    });

    // Update current transcript
    if (result.isFinal) {
      this.currentTranscript = result.transcript;

      // Clear any pending timeout
      if (this.transcriptTimeout) {
        clearTimeout(this.transcriptTimeout);
      }

      // Wait for more speech or process after silence
      this.transcriptTimeout = setTimeout(() => {
        if (this.currentTranscript.trim().length > 0) {
          this.processTranscript(this.currentTranscript);
          this.currentTranscript = '';
        }
      }, 1500); // 1.5s of silence triggers processing
    } else if (this.config.interimResults) {
      // Show interim results
      this.emit({
        type: 'transcript',
        data: {
          transcript: result.transcript,
          isFinal: false,
          confidence: result.confidence,
        },
      });
    }
  }

  /**
   * Process final transcript through intent router
   */
  private async processTranscript(transcript: string): Promise<void> {
    try {
      this.setState('processing');
      this.emit({ type: 'state', data: { state: 'processing' } });

      console.log('Processing transcript:', transcript);

      // Route through intent router
      const { intent, result } = await this.intentRouter.processCommand(transcript);

      console.log('Intent:', intent);
      console.log('Result:', result);

      this.emit({ type: 'intent', data: intent });
      this.emit({ type: 'response', data: result });

      // Speak response if autoSpeak is enabled
      if (this.config.autoSpeak && result.message) {
        await this.speak(result.message);
      } else {
        this.setState('idle');
        this.emit({ type: 'state', data: { state: 'idle' } });
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    console.error('Voice error:', error);
    this.setState('error');
    this.emit({
      type: 'error',
      data: { message: error.message, error },
    });

    // Reset to idle after error
    setTimeout(() => {
      if (this.state === 'error') {
        this.setState('idle');
        this.emit({ type: 'state', data: { state: 'idle' } });
      }
    }, 2000);
  }

  /**
   * Set state
   */
  private setState(state: VoiceState): void {
    this.state = state;
  }

  /**
   * Emit event to listeners
   */
  private emit(event: VoiceEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.deepgram.stopListening();
    this.elevenlabs.stop();
    this.listeners = [];
    if (this.transcriptTimeout) {
      clearTimeout(this.transcriptTimeout);
    }
  }
}

// Singleton instance (initialized in app)
let voiceManager: VoiceManager | null = null;

export function initializeVoiceManager(config: VoiceConfig): VoiceManager {
  voiceManager = new VoiceManager(config);
  return voiceManager;
}

export function getVoiceManager(): VoiceManager | null {
  return voiceManager;
}
