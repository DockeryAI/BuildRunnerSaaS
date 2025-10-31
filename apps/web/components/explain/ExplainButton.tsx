'use client';

import React, { useState } from 'react';
import { HelpCircle, Loader2, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { ExplainModal } from './ExplainModal';

interface ExplainButtonProps {
  scope: 'project' | 'milestone' | 'step' | 'microstep';
  entityId?: string;
  projectId?: string;
  audience?: 'technical' | 'business' | 'general';
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ExplainButton({
  scope,
  entityId,
  projectId,
  audience = 'technical',
  variant = 'ghost',
  size = 'sm',
  className = '',
}: ExplainButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<{
    id: string;
    title: string;
    content: string;
    scope: string;
    entity_id?: string;
    model_name: string;
    tokens_used: number;
    generation_time_ms: number;
    created_at: string;
  } | null>(null);

  const handleExplain = async () => {
    setIsLoading(true);
    setIsModalOpen(true);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'current-user', // Would come from auth context
        },
        body: JSON.stringify({
          project_id: projectId,
          scope,
          entity_id: entityId,
          audience,
          language: 'en',
          model_name: 'gpt-4',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate explanation');
      }

      const data = await response.json();
      
      if (data.success) {
        setExplanation(data.explanation);
      } else {
        throw new Error(data.error || 'Failed to generate explanation');
      }
    } catch (error) {
      console.error('Failed to generate explanation:', error);
      // Set error state in explanation
      setExplanation({
        id: 'error',
        title: 'Explanation Error',
        content: `Sorry, I couldn't generate an explanation right now. ${error instanceof Error ? error.message : 'Please try again later.'}`,
        scope,
        entity_id: entityId,
        model_name: 'error',
        tokens_used: 0,
        generation_time_ms: 0,
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    switch (scope) {
      case 'project':
        return 'Explain Project';
      case 'milestone':
        return 'Explain Milestone';
      case 'step':
        return 'Explain Step';
      case 'microstep':
        return 'Explain Microstep';
      default:
        return 'Explain';
    }
  };

  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    return <HelpCircle className="h-4 w-4" />;
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleExplain}
        disabled={isLoading}
        className={className}
        title={`Get an AI explanation of this ${scope}`}
      >
        {getButtonIcon()}
        {size !== 'sm' && (
          <span className="ml-2">{getButtonText()}</span>
        )}
      </Button>

      <ExplainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        explanation={explanation}
        isLoading={isLoading}
        scope={scope}
        entityId={entityId}
        projectId={projectId}
      />
    </>
  );
}
