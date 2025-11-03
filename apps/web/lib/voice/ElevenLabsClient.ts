/**
 * ElevenLabs Client for Text-to-Speech
 * Handles natural voice generation
 */

import { ElevenLabsClient as ElevenLabsSDK, play } from '@elevenlabs/elevenlabs-js';

export interface SpeechOptions {
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  speed?: number;
}

export class ElevenLabsClient {
  private client: ElevenLabsSDK;
  private defaultVoiceId: string;
  private audioQueue: HTMLAudioElement[] = [];
  private isPlaying: boolean = false;

  constructor(apiKey: string, defaultVoiceId: string) {
    this.client = new ElevenLabsSDK({ apiKey });
    this.defaultVoiceId = defaultVoiceId;
  }

  /**
   * Speak text using ElevenLabs TTS
   */
  async speak(text: string, options?: SpeechOptions): Promise<void> {
    try {
      const voiceId = options?.voiceId || this.defaultVoiceId;

      console.log('🔊 Generating speech with ElevenLabs...', { text: text.substring(0, 50) });

      // Generate audio stream using correct API
      const audio = await this.client.textToSpeech.convert(voiceId, {
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: options?.stability || 0.5,
          similarity_boost: options?.similarityBoost || 0.75,
        },
      });

      console.log('✅ Speech generated, converting to blob...');

      // Convert audio stream to blob
      const chunks: Uint8Array[] = [];
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      console.log('✅ Audio ready, queuing for playback...');

      // Create audio element
      const audioElement = new Audio(url);

      // Add to queue
      this.audioQueue.push(audioElement);

      // Play if not already playing
      if (!this.isPlaying) {
        await this.playNext();
      }
    } catch (error) {
      console.error('Failed to speak:', error);
      throw error;
    }
  }

  /**
   * Play next audio in queue
   */
  private async playNext(): Promise<void> {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audio = this.audioQueue.shift()!;

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audio.src);
        this.playNext();
        resolve();
      };

      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        URL.revokeObjectURL(audio.src);
        this.playNext();
        resolve();
      };

      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        URL.revokeObjectURL(audio.src);
        this.playNext();
        resolve();
      });
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    // Clear queue
    this.audioQueue.forEach((audio) => {
      audio.pause();
      URL.revokeObjectURL(audio.src);
    });
    this.audioQueue = [];
    this.isPlaying = false;
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.isPlaying || this.audioQueue.length > 0;
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<any[]> {
    try {
      const response = await this.client.voices.getAll();
      return response.voices || [];
    } catch (error) {
      console.error('Failed to get voices:', error);
      return [];
    }
  }

  /**
   * Get character count for text (for cost estimation)
   */
  static getCharacterCount(text: string): number {
    return text.length;
  }

  /**
   * Estimate cost for text (ElevenLabs pricing: $0.015/1000 chars)
   */
  static estimateCost(text: string): number {
    const chars = this.getCharacterCount(text);
    return (chars / 1000) * 0.015;
  }
}
