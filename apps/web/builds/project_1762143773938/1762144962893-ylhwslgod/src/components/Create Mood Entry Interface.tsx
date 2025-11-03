```typescript
import React, { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { openRouterClient } from '../lib/openRouterClient';
import { MoodEntry, MoodLevel, MoodTags } from '../types/mood';

interface MoodEntryFormProps {
  onSubmit: (entry: MoodEntry) => void;
  isLoading?: boolean;
  error?: Error | null;
}

/**
 * Component for creating new mood entries with optional AI-enhanced insights
 * @component
 */
export const MoodEntryForm: React.FC<MoodEntryFormProps> = ({
  onSubmit,
  isLoading = false,
  error = null,
}) => {
  const [moodLevel, setMoodLevel] = useState<MoodLevel>(3);
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<MoodTags[]>([]);

  const { mutate: getAiInsights, isLoading: isLoadingAI } = useMutation({
    mutationFn: async (text: string) => {
      try {
        const response = await openRouterClient.post('/chat/completions', {
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Analyze the mood entry and provide brief emotional insights.',
            },
            {
              role: 'user',
              content: text,
            },
          ],
        });
        return response.data.choices[0].message.content;
      } catch (err) {
        throw new Error('Failed to get AI insights');
      }
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!description) {
        return;
      }

      try {
        let aiInsights = '';
        
        if (description.length > 10) {
          await getAiInsights(description, {
            onSuccess: (data) => {
              aiInsights = data;
            },
          });
        }

        const newEntry: MoodEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          moodLevel,
          description,
          tags: selectedTags,
          aiInsights,
        };

        onSubmit(newEntry);
        
        // Reset form
        setMoodLevel(3);
        setDescription('');
        setSelectedTags([]);
      } catch (err) {
        console.error('Error submitting mood entry:', err);
      }
    },
    [description, moodLevel, selectedTags, getAiInsights, onSubmit]
  );

  const handleTagToggle = useCallback((tag: MoodTags) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          How are you feeling? (1-5)
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={moodLevel}
          onChange={(e) => setMoodLevel(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>😢</span>
          <span>😐</span>
          <span>😊</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          What's on your mind?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.values(MoodTags).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`rounded-full px-3 py-1 text-sm ${
                selectedTags.includes(tag)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error.message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || isLoadingAI}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading || isLoadingAI ? 'Saving...' : 'Save Entry'}
      </button>
    </form>
  );
};

export default MoodEntryForm;
```