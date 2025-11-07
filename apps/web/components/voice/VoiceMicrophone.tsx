'use client';

/**
 * Voice Microphone Button
 * Floating button for voice control
 */

import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoice } from './VoiceProvider';

export function VoiceMicrophone() {
  const { isListening, state, startListening, stopListening, error } = useVoice();

  const handleClick = async () => {
    console.log('🎤 Microphone clicked! Current state:', state, 'isListening:', isListening);

    if (isListening) {
      console.log('🎤 Stopping listening...');
      stopListening();
    } else {
      try {
        console.log('🎤 Starting listening...');
        await startListening();
        console.log('🎤 Listening started successfully');
      } catch (err) {
        console.error('❌ Failed to start listening:', err);
      }
    }
  };

  const getButtonClass = () => {
    if (error) return 'bg-red-600 hover:bg-red-700';
    if (isListening) return 'bg-red-500 animate-pulse hover:bg-red-600';
    if (state === 'processing') return 'bg-yellow-500 hover:bg-yellow-600';
    if (state === 'speaking') return 'bg-green-500 animate-pulse hover:bg-green-600';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  const getIcon = () => {
    if (state === 'processing') {
      return <Loader2 className="w-6 h-6 text-white animate-spin" />;
    }
    if (isListening) {
      return <MicOff className="w-6 h-6 text-white" />;
    }
    return <Mic className="w-6 h-6 text-white" />;
  };

  const getTooltip = () => {
    if (error) return 'Voice Error - Click to retry';
    if (isListening) return 'Click to stop listening';
    if (state === 'processing') return 'Processing...';
    if (state === 'speaking') return 'Speaking...';
    return 'Click to start voice control';
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === 'processing' || state === 'speaking'}
      title={getTooltip()}
      className={`
        fixed bottom-6 right-24 z-50
        w-14 h-14 rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-200
        ${getButtonClass()}
        ${state === 'processing' || state === 'speaking' ? 'cursor-wait' : 'hover:scale-110'}
        disabled:opacity-75
        focus:outline-none focus:ring-4 focus:ring-blue-300
      `}
      aria-label={getTooltip()}
    >
      {getIcon()}

      {/* Pulse ring for listening state */}
      {isListening && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
      )}
    </button>
  );
}
