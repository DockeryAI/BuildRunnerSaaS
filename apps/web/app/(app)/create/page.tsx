'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { generatePlan, saveLocalPlan } from '../../../lib/api';
import { CreatePlanRequest } from '../../../lib/types';

export default function CreatePage() {
  const [prompt, setPrompt] = useState('');
  const [template, setTemplate] = useState<CreatePlanRequest['template']>('web-app');
  const [timeline, setTimeline] = useState<CreatePlanRequest['timeline']>('1-month');
  const [teamSize, setTeamSize] = useState<CreatePlanRequest['team_size']>('solo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGenerate = async () => {
    if (prompt.length < 10) {
      setError('Please provide a more detailed description (at least 10 characters)');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const plan = await generatePlan({
        prompt,
        template,
        timeline,
        team_size: teamSize,
      });

      // Save to local storage and redirect to plan editor
      await saveLocalPlan(plan);
      router.push('/plan');
    } catch (error) {
      console.error('Plan generation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Plan</h1>
        <p className="text-gray-600">
          Describe what you want to build and we'll generate a detailed plan with milestones, steps, and microsteps.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe what you want to build...
            </label>
            <Textarea
              className="w-full h-32"
              placeholder="I want to build a web application that..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={template}
                onChange={(e) => setTemplate(e.target.value as CreatePlanRequest['template'])}
              >
                <option value="web-app">Web Application</option>
                <option value="mobile-app">Mobile App</option>
                <option value="api-service">API Service</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value as CreatePlanRequest['timeline'])}
              >
                <option value="2-weeks">2 weeks</option>
                <option value="1-month">1 month</option>
                <option value="3-months">3 months</option>
                <option value="6-months">6 months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Size
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value as CreatePlanRequest['team_size'])}
              >
                <option value="solo">Solo</option>
                <option value="2-3">2-3 people</option>
                <option value="4-6">4-6 people</option>
                <option value="7+">7+ people</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || prompt.length < 10}
              className="px-6 py-2"
            >
              {isGenerating ? 'Generating Plan...' : 'Generate Plan'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
