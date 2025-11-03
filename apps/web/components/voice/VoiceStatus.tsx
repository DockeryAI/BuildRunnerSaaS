'use client';

/**
 * Voice Status Indicator
 * Compact status display for voice system
 */

import React from 'react';
import { useVoice } from './VoiceProvider';
import { Mic, Brain, Volume2, AlertCircle, Check } from 'lucide-react';

export function VoiceStatus() {
  const { state, error, lastIntent } = useVoice();

  // Don't show when idle
  if (state === 'idle' && !error) return null;

  const getStatusConfig = () => {
    if (error) {
      return {
        icon: AlertCircle,
        text: 'Voice Error',
        color: 'text-red-600 bg-red-50 border-red-200',
      };
    }

    switch (state) {
      case 'listening':
        return {
          icon: Mic,
          text: 'Listening...',
          color: 'text-blue-600 bg-blue-50 border-blue-200',
        };
      case 'processing':
        return {
          icon: Brain,
          text: lastIntent ? `Understanding: ${lastIntent.action}` : 'Processing...',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        };
      case 'speaking':
        return {
          icon: Volume2,
          text: 'Speaking...',
          color: 'text-green-600 bg-green-50 border-green-200',
        };
      default:
        return {
          icon: Check,
          text: 'Ready',
          color: 'text-gray-600 bg-gray-50 border-gray-200',
        };
    }
  };

  const { icon: Icon, text, color } = getStatusConfig();

  return (
    <div className="fixed top-4 right-4 z-40 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm
        ${color}
      `}>
        <Icon className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-medium">{text}</span>
      </div>
    </div>
  );
}
