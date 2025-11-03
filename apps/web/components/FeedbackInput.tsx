'use client';

import React, { useState } from 'react';
import { Send, MapPin, Smartphone } from 'lucide-react';

interface FeedbackInputProps {
  buildId: string;
  projectId: string;
  currentRoute: string;
  deviceType: string;
  onScreenshotCapture: () => Promise<string>;
}

type FeedbackType = 'bug' | 'feature' | 'design' | 'performance';
type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';

export function FeedbackInput({
  buildId,
  projectId,
  currentRoute,
  deviceType,
  onScreenshotCapture,
}: FeedbackInputProps) {
  const [description, setDescription] = useState('');
  const [type, setType] = useState<FeedbackType>('bug');
  const [priority, setPriority] = useState<FeedbackPriority>('medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setSubmitting(true);

    try {
      // Capture screenshot
      const screenshot = await onScreenshotCapture();

      // Submit feedback
      const response = await fetch('/api/build/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          buildId,
          type,
          priority,
          description,
          context: {
            route: currentRoute,
            deviceType,
            screenshot,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear form
        setDescription('');
        setType('bug');
        setPriority('medium');

        // Show success notification
        console.log('Feedback submitted:', data.feedback);
      } else {
        console.error('Failed to submit feedback:', data.error);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="px-4 py-3">
        {/* Context info */}
        <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{currentRoute}</span>
          </div>
          <div className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            <span className="capitalize">{deviceType}</span>
          </div>
        </div>

        {/* Input area */}
        <div className="flex items-start gap-3">
          {/* Type selector */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value as FeedbackType)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={submitting}
          >
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="design">Design</option>
            <option value="performance">Performance</option>
          </select>

          {/* Priority selector */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as FeedbackPriority)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={submitting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {/* Text input */}
          <input
            type="text"
            placeholder="Describe the issue or suggestion... (Cmd+Enter to submit)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={submitting}
          />

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!description.trim() || submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <span className="text-sm">Submitting...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="text-sm">Submit</span>
              </>
            )}
          </button>
        </div>

        {/* Help text */}
        <div className="mt-2 text-xs text-gray-500">
          AI will automatically analyze and fix issues when you submit feedback
        </div>
      </div>
    </div>
  );
}
