'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Target,
  Zap,
  Clock,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ExplainButton } from '../../../components/explain/ExplainButton';

interface WalkthroughStep {
  id: string;
  type: 'milestone' | 'step' | 'microstep';
  title: string;
  description: string;
  phase: number;
  entityId: string;
  explanation?: string;
  completed?: boolean;
}

export default function ExplainPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [lastViewed, setLastViewed] = useState<string | null>(null);
  const [walkthroughSteps, setWalkthroughSteps] = useState<WalkthroughStep[]>([]);

  useEffect(() => {
    // Load walkthrough steps from project plan
    loadWalkthroughSteps();
    
    // Load last viewed step from localStorage
    const saved = localStorage.getItem('explain-walkthrough-last-viewed');
    if (saved) {
      setLastViewed(saved);
      const stepIndex = walkthroughSteps.findIndex(step => step.id === saved);
      if (stepIndex >= 0) {
        setCurrentStep(stepIndex);
      }
    }
  }, []);

  useEffect(() => {
    // Auto-play functionality
    let interval: NodeJS.Timeout;
    
    if (isAutoPlay && currentStep < walkthroughSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 5000); // 5 seconds per step
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlay, currentStep, walkthroughSteps.length]);

  const loadWalkthroughSteps = async () => {
    // Mock walkthrough steps - in production, this would load from the actual project plan
    const mockSteps: WalkthroughStep[] = [
      {
        id: 'p1',
        type: 'milestone',
        title: 'Foundation Setup',
        description: 'Setting up the core infrastructure and development environment',
        phase: 1,
        entityId: 'p1',
        explanation: 'This milestone establishes the foundation of your project with repository setup, CLI tools, and basic infrastructure.',
      },
      {
        id: 'p1.s1',
        type: 'step',
        title: 'Repository Scaffolding',
        description: 'Initialize repository structure and basic configuration',
        phase: 1,
        entityId: 'p1.s1',
        explanation: 'Creates the initial project structure with proper folder organization and configuration files.',
      },
      {
        id: 'p1.s1.ms1',
        type: 'microstep',
        title: 'Git Repository Setup',
        description: 'Initialize git repository with proper .gitignore and README',
        phase: 1,
        entityId: 'p1.s1.ms1',
        explanation: 'Sets up version control with git, including ignore patterns and documentation.',
        completed: true,
      },
      {
        id: 'p2',
        type: 'milestone',
        title: 'Database Integration',
        description: 'Setting up Supabase database and authentication',
        phase: 2,
        entityId: 'p2',
        explanation: 'Integrates Supabase for database operations, authentication, and real-time features.',
      },
      {
        id: 'p2.s1',
        type: 'step',
        title: 'Supabase Setup',
        description: 'Configure Supabase project and database schema',
        phase: 2,
        entityId: 'p2.s1',
        explanation: 'Establishes the database foundation with tables, relationships, and security policies.',
      },
      {
        id: 'p3',
        type: 'milestone',
        title: 'UI Development',
        description: 'Building the user interface and core components',
        phase: 3,
        entityId: 'p3',
        explanation: 'Creates the user-facing interface with modern React components and responsive design.',
      },
    ];

    setWalkthroughSteps(mockSteps);
  };

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveLastViewed(walkthroughSteps[nextStep].id);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveLastViewed(walkthroughSteps[prevStep].id);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    saveLastViewed(walkthroughSteps[index].id);
  };

  const saveLastViewed = (stepId: string) => {
    setLastViewed(stepId);
    localStorage.setItem('explain-walkthrough-last-viewed', stepId);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsAutoPlay(false);
    localStorage.removeItem('explain-walkthrough-last-viewed');
    setLastViewed(null);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Target className="h-4 w-4" />;
      case 'step':
        return <Zap className="h-4 w-4" />;
      case 'microstep':
        return <Clock className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'step':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'microstep':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (walkthroughSteps.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Walkthrough...</h1>
          <p className="text-gray-600">Preparing your guided tour of the project.</p>
        </div>
      </div>
    );
  }

  const currentStepData = walkthroughSteps[currentStep];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Teach Me My App
            </h1>
            <p className="text-gray-600">
              A guided walkthrough of your project's architecture and components
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
            >
              {isAutoPlay ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Auto Play
                </>
              )}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / walkthroughSteps.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Step {currentStep + 1} of {walkthroughSteps.length}</span>
          <span>{Math.round(((currentStep + 1) / walkthroughSteps.length) * 100)}% Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Step Navigation */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Steps</h3>
          <div className="space-y-2">
            {walkthroughSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  index === currentStep
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1 rounded ${getStepColor(step.type)}`}>
                    {getStepIcon(step.type)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Phase {step.phase}
                  </Badge>
                  {step.completed && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <p className="font-medium text-sm">{step.title}</p>
                <p className="text-xs text-gray-600 mt-1">{step.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Step Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${getStepColor(currentStepData.type)}`}>
                  {getStepIcon(currentStepData.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">
                      Phase {currentStepData.phase}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {currentStepData.type}
                    </Badge>
                    {currentStepData.completed && (
                      <Badge variant="default" className="bg-green-600">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentStepData.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {currentStepData.description}
                  </p>
                </div>
              </div>

              <ExplainButton
                scope={currentStepData.type}
                entityId={currentStepData.entityId}
                projectId="current-project"
                audience="business"
                variant="outline"
                size="md"
              />
            </div>

            {/* Step Explanation */}
            <div className="prose prose-sm max-w-none mb-6">
              <p className="text-gray-700">
                {currentStepData.explanation || 'No detailed explanation available for this step.'}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="text-sm text-gray-500">
                {currentStep + 1} / {walkthroughSteps.length}
              </div>

              <Button
                onClick={handleNext}
                disabled={currentStep === walkthroughSteps.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
