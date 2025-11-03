'use client';

/**
 * Voice Provider
 * React context for voice system
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { VoiceManager, VoiceState, VoiceEvent, initializeVoiceManager, getVoiceManager } from '@/lib/voice/VoiceManager';
import { Intent } from '@/lib/voice/IntentRouter';
import { VoicePage } from '@/lib/voice/VoiceContext';

interface VoiceContextType {
  state: VoiceState;
  transcript: string;
  isListening: boolean;
  isSpeaking: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  setPage: (page: VoicePage) => void;
  setProject: (projectId: string, projectName?: string) => void;
  lastIntent?: Intent;
  lastResponse?: { success: boolean; message: string; data?: any };
  error?: string;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}

interface VoiceProviderProps {
  children: React.ReactNode;
  deepgramApiKey: string;
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
  anthropicApiKey: string;
  autoSpeak?: boolean;
}

export function VoiceProvider({
  children,
  deepgramApiKey,
  elevenLabsApiKey,
  elevenLabsVoiceId,
  anthropicApiKey,
  autoSpeak = true,
}: VoiceProviderProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [lastIntent, setLastIntent] = useState<Intent>();
  const [lastResponse, setLastResponse] = useState<{ success: boolean; message: string; data?: any }>();
  const [error, setError] = useState<string>();
  const voiceManagerRef = useRef<VoiceManager | null>(null);

  // Initialize voice manager
  useEffect(() => {
    if (!voiceManagerRef.current) {
      console.log('🎤 Initializing Voice Manager...');
      console.log('API Keys present:', {
        deepgram: !!deepgramApiKey,
        elevenlabs: !!elevenLabsApiKey,
        voiceId: !!elevenLabsVoiceId,
        anthropic: !!anthropicApiKey,
      });

      if (!deepgramApiKey || !elevenLabsApiKey || !anthropicApiKey) {
        console.error('❌ Missing API keys! Voice system will not work.');
        setError('Voice API keys not configured');
        return;
      }

      voiceManagerRef.current = initializeVoiceManager({
        deepgramApiKey,
        elevenLabsApiKey,
        elevenLabsVoiceId,
        anthropicApiKey,
        autoSpeak,
        interimResults: true,
      });

      // Register all voice controllers
      const { PRDVoiceController } = require('@/lib/voice/controllers/PRDVoiceController');
      const { WorkbenchVoiceController } = require('@/lib/voice/controllers/WorkbenchVoiceController');
      const { ProjectsVoiceController } = require('@/lib/voice/controllers/ProjectsVoiceController');
      const { PlanVoiceController } = require('@/lib/voice/controllers/PlanVoiceController');
      const { CostVoiceController } = require('@/lib/voice/controllers/CostVoiceController');
      const { AnalyticsVoiceController } = require('@/lib/voice/controllers/AnalyticsVoiceController');
      const { SettingsVoiceController } = require('@/lib/voice/controllers/SettingsVoiceController');

      voiceManagerRef.current.registerHandler('prd', new PRDVoiceController());
      voiceManagerRef.current.registerHandler('workbench', new WorkbenchVoiceController());
      voiceManagerRef.current.registerHandler('projects', new ProjectsVoiceController());
      voiceManagerRef.current.registerHandler('plan', new PlanVoiceController());
      voiceManagerRef.current.registerHandler('cost', new CostVoiceController());
      voiceManagerRef.current.registerHandler('analytics', new AnalyticsVoiceController());
      voiceManagerRef.current.registerHandler('settings', new SettingsVoiceController());

      // Subscribe to events
      const unsubscribe = voiceManagerRef.current.on((event: VoiceEvent) => {
        switch (event.type) {
          case 'state':
            setState(event.data.state);
            break;

          case 'transcript':
            if (event.data.isFinal) {
              setTranscript(event.data.transcript);
            }
            break;

          case 'intent':
            setLastIntent(event.data);
            break;

          case 'response':
            setLastResponse(event.data);
            break;

          case 'error':
            setError(event.data.message);
            setState('error');
            break;
        }
      });

      return () => {
        unsubscribe();
        voiceManagerRef.current?.destroy();
      };
    }
  }, [deepgramApiKey, elevenLabsApiKey, elevenLabsVoiceId, anthropicApiKey, autoSpeak]);

  const startListening = useCallback(async () => {
    if (!voiceManagerRef.current) return;
    setError(undefined);
    await voiceManagerRef.current.startListening();
  }, []);

  const stopListening = useCallback(() => {
    if (!voiceManagerRef.current) return;
    voiceManagerRef.current.stopListening();
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!voiceManagerRef.current) return;
    await voiceManagerRef.current.speak(text);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (!voiceManagerRef.current) return;
    voiceManagerRef.current.stopSpeaking();
  }, []);

  const setPage = useCallback((page: VoicePage) => {
    if (!voiceManagerRef.current) return;
    voiceManagerRef.current.setPage(page);
  }, []);

  const setProject = useCallback((projectId: string, projectName?: string) => {
    if (!voiceManagerRef.current) return;
    voiceManagerRef.current.setProject(projectId, projectName);
  }, []);

  const value: VoiceContextType = {
    state,
    transcript,
    isListening: state === 'listening',
    isSpeaking: state === 'speaking',
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setPage,
    setProject,
    lastIntent,
    lastResponse,
    error,
  };

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}
