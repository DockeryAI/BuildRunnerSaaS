/**
 * Feature Extractor Component
 *
 * Allows users to input product idea and automatically extract features
 * using Claude Haiku via the orchestration system.
 */

'use client';

import React, { useState } from 'react';
import {
  SparklesIcon,
  LightBulbIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useOrchestrationStore } from '@/lib/stores/orchestration-store';

export function FeatureExtractor({ onComplete }: { onComplete?: () => void }) {
  const { productIdea, setProductIdea, extractFeaturesFromIdea } = useOrchestrationStore();
  const [localIdea, setLocalIdea] = useState(productIdea);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedCount, setExtractedCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!localIdea.trim()) {
      return;
    }

    setIsExtracting(true);
    setExtractedCount(null);
    setError(null);

    try {
      // Save product idea
      setProductIdea(localIdea);

      // Extract features
      const features = await extractFeaturesFromIdea(localIdea);

      setExtractedCount(features.length);

      // Wait a moment to show success
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Feature extraction failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if it's an API key error
      if (errorMessage.includes('API key not configured') || errorMessage.includes('No cookie auth credentials')) {
        setError('OpenRouter API key not configured. Please add it in Settings → API Keys.');
      } else {
        setError('Feature extraction failed. Please try again.');
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const exampleIdeas = [
    'A task management app with AI-powered prioritization',
    'A fitness tracker that creates personalized workout plans',
    'A social platform for book lovers to share reviews',
    'An AI writing assistant for technical documentation',
    'A meal planning app with recipe suggestions',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <LightBulbIcon className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            What do you want to build?
          </h2>
          <p className="text-lg text-gray-600">
            Describe your product idea and our AI will automatically extract features
          </p>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Your Product Idea
          </label>
          <textarea
            value={localIdea}
            onChange={(e) => setLocalIdea(e.target.value)}
            placeholder="E.g., I want to build a task management app that uses AI to automatically prioritize tasks based on deadlines, importance, and user behavior patterns. It should have smart notifications, team collaboration features, and integrations with popular tools like Slack and Google Calendar..."
            rows={6}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
            disabled={isExtracting}
          />
          <p className="text-sm text-gray-500 mt-2">
            Be as detailed as possible. Mention features, target users, and key functionality.
          </p>
        </div>

        {/* Action Button */}
        {!isExtracting && extractedCount === null && (
          <button
            onClick={handleExtract}
            disabled={!localIdea.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-3"
          >
            <SparklesIcon className="h-6 w-6" />
            <span>Extract Features with AI</span>
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        )}

        {/* Extracting State */}
        {isExtracting && (
          <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-6 text-center">
            <div className="inline-flex p-4 bg-blue-600 rounded-full mb-4">
              <SparklesIcon className="h-8 w-8 text-white animate-pulse" />
            </div>
            <p className="text-lg font-semibold text-blue-900 mb-2">
              Analyzing your product idea...
            </p>
            <p className="text-sm text-blue-700">
              Our AI is extracting features, identifying user stories, and building your PRD
            </p>
            <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        )}

        {/* Success State */}
        {extractedCount !== null && (
          <div className="bg-green-100 border-2 border-green-300 rounded-xl p-6 text-center">
            <div className="inline-flex p-4 bg-green-600 rounded-full mb-4">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
            <p className="text-xl font-bold text-green-900 mb-2">
              ✅ Extracted {extractedCount} Features!
            </p>
            <p className="text-sm text-green-700">
              Features have been added to your PRD. You can now drag AI suggestions or continue building.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 mb-1">
                  Feature Extraction Failed
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  {error}
                </p>
                {error.includes('API key') && (
                  <a
                    href="/settings"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Go to Settings →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Examples */}
        {!isExtracting && extractedCount === null && !error && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              💡 Need inspiration? Try these examples:
            </p>
            <div className="space-y-2">
              {exampleIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  onClick={() => setLocalIdea(idea)}
                  className="w-full text-left px-4 py-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all text-sm text-gray-700 hover:text-blue-900"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <InfoCard
          icon={<SparklesIcon className="h-6 w-6" />}
          title="AI-Powered"
          description="Uses Claude Haiku for fast, accurate feature extraction"
        />
        <InfoCard
          icon={<CheckCircleIcon className="h-6 w-6" />}
          title="Instant Results"
          description="Features extracted and added to your PRD in seconds"
        />
        <InfoCard
          icon={<LightBulbIcon className="h-6 w-6" />}
          title="Smart Analysis"
          description="Identifies features, user stories, and acceptance criteria"
        />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, description }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 text-center">
      <div className="inline-flex p-3 bg-blue-100 rounded-lg text-blue-600 mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
