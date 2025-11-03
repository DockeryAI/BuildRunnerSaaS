/**
 * Deepgram Client for Speech-to-Text
 * Handles real-time audio streaming and transcription
 */

import { createClient, LiveTranscriptionEvents, LiveClient } from '@deepgram/sdk';

export interface TranscriptResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

export class DeepgramClient {
  private client: ReturnType<typeof createClient>;
  private connection: LiveClient | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;

  constructor(apiKey: string) {
    this.client = createClient(apiKey);
  }

  /**
   * Start listening to microphone
   */
  async startListening(
    onTranscript: (result: TranscriptResult) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create Deepgram connection
      this.connection = this.client.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        punctuate: true,
        interim_results: true,
        endpointing: 300, // 300ms of silence = end of utterance
      });

      // Handle transcription results
      this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        if (transcript && transcript.trim().length > 0) {
          onTranscript({
            transcript,
            confidence: data.channel?.alternatives?.[0]?.confidence || 0,
            isFinal: data.is_final || false,
            timestamp: Date.now(),
          });
        }
      });

      // Handle errors
      this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('Deepgram error:', error);
        if (onError) {
          onError(new Error(error.message || 'Deepgram connection error'));
        }
      });

      // Handle connection close
      this.connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed');
      });

      // Start streaming audio
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm',
      });

      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0 && this.connection?.getReadyState() === 1) {
          this.connection.send(event.data);
        }
      });

      this.mediaRecorder.start(250); // Send data every 250ms
    } catch (error) {
      console.error('Failed to start listening:', error);
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.connection) {
      this.connection.finish();
      this.connection = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.mediaRecorder = null;
  }

  /**
   * Check if currently listening
   */
  isListening(): boolean {
    return (
      this.mediaRecorder !== null &&
      this.mediaRecorder.state === 'recording' &&
      this.connection !== null
    );
  }

  /**
   * Get microphone permission status
   */
  static async checkMicrophonePermission(): Promise<PermissionState> {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state;
    } catch (error) {
      console.error('Failed to check microphone permission:', error);
      return 'prompt';
    }
  }
}
