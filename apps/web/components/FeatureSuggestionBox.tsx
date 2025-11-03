'use client';

import React from 'react';
import { CheckIcon, XMarkIcon, LightBulbIcon, ArchiveBoxIcon, ClockIcon } from '@heroicons/react/24/outline';
import { FeatureSuggestion } from '../lib/strategery-context';

interface FeatureSuggestionBoxProps {
  suggestion: FeatureSuggestion;
  onAccept: (suggestionId: string) => void;
  onDismiss: (suggestionId: string) => void;
  onShelve?: (suggestionId: string) => void;
  onAddToV2?: (suggestionId: string) => void;
}

export default function FeatureSuggestionBox({
  suggestion,
  onAccept,
  onDismiss,
  onShelve,
  onAddToV2,
}: FeatureSuggestionBoxProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4 mb-4 shadow-md animate-in slide-in-from-top duration-300">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="bg-purple-100 rounded-full p-2">
            <LightBulbIcon className="h-5 w-5 text-purple-600" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-base font-semibold text-gray-900">{suggestion.title}</h4>
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full whitespace-nowrap">
              AI Suggestion
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>

          {suggestion.reasoning && (
            <p className="text-xs text-gray-600 italic mb-3">
              💡 {suggestion.reasoning}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onAccept(suggestion.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <CheckIcon className="h-4 w-4" />
              Add to V1
            </button>
            {onAddToV2 && (
              <button
                onClick={() => onAddToV2(suggestion.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <ClockIcon className="h-4 w-4" />
                Add to V2
              </button>
            )}
            {onShelve && (
              <button
                onClick={() => onShelve(suggestion.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <ArchiveBoxIcon className="h-4 w-4" />
                Shelve
              </button>
            )}
            <button
              onClick={() => onDismiss(suggestion.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
