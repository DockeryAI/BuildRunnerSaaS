'use client';

/**
 * Voice Transcript Display
 * Shows live transcription and assistant responses
 */

import React from 'react';
import { useVoice } from './VoiceProvider';
import { User, Bot, Volume2 } from 'lucide-react';

export function VoiceTranscript() {
  const { transcript, lastResponse, isListening, isSpeaking, state } = useVoice();

  // Don't show if no content
  if (!transcript && !lastResponse) return null;

  return (
    <div className="fixed bottom-28 right-8 z-40 w-96 max-w-[calc(100vw-4rem)]">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Voice Assistant</span>
            {state !== 'idle' && (
              <span className="ml-auto text-xs text-white/80 capitalize">
                {state}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-64 overflow-y-auto p-4 space-y-3">
          {/* User Transcript */}
          {transcript && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  You said:
                </div>
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {transcript}
                  {isListening && (
                    <span className="inline-block ml-2 w-2 h-4 bg-blue-500 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Assistant Response */}
          {lastResponse && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Assistant:
                </div>
                <div className={`text-sm ${
                  lastResponse.success
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {lastResponse.message}
                  {isSpeaking && (
                    <span className="inline-block ml-2">
                      <Volume2 className="w-3 h-3 inline animate-pulse" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Processing State */}
          {state === 'processing' && !lastResponse && (
            <div className="flex gap-3 animate-in fade-in duration-300">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        {isListening && (
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Listening... Speak naturally
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
