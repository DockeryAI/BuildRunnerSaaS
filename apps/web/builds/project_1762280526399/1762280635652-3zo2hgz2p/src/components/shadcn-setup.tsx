'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, Download, ExternalLink, Package, Settings, Zap } from 'lucide-react'

interface ShadcnSetupProps {
  projectName?: string;
  onComplete?: () => void;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  command?: string;
  completed: boolean;
  optional?: boolean;
}

export function ShadcnSetup({
  projectName = "off-road-planner",
  onComplete = () => console.log('Setup complete')
}: ShadcnSetupProps = {}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'init',
      title: 'Initialize shadcn/ui',
      description: 'Set up shadcn/ui in your Next.js project with our custom configuration',
      command: 'npx shadcn-ui@latest init',
      completed: false
    },
    {
      id: 'components',
      title: 'Install Core Components',
      description: 'Add essential UI components for the off-road planning app',
      command: 'npx shadcn-ui@latest add button card input label select textarea',
      completed: false
    },
    {
      id: 'advanced',
      title: 'Install Advanced Components',
      description: 'Add components for complex features like calendars and data tables',
      command: 'npx shadcn-ui@latest add calendar dialog dropdown-menu table toast',
      completed: false
    },
    {
      id: 'forms',
      title: 'Install Form Components',
      description: 'Add form handling components for trip planning and RSVPs',
      command: 'npx shadcn-ui@latest add form checkbox radio-group switch',
      completed: false
    },
    {
      id: 'navigation',
      title: 'Install Navigation Components',
      description: 'Add navigation and layout components',
      command: 'npx shadcn-ui@latest add navigation-menu tabs sheet',
      completed: false
    },
    {
      id: 'config',
      title: 'Configure Theme',
      description: 'Apply the outdoor adventure theme configuration',
      completed: false
    }
  ])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCommand(text)
      setTimeout(() => setCopiedCommand(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const markStepComplete = (stepId: string) => {
    setSetupSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ))
    
    const nextIncompleteIndex = setupSteps.findIndex((step, index) => 
      index > currentStep && !step.completed
    )
    
    if (nextIncompleteIndex !== -1) {
      setCurrentStep(nextIncompleteIndex)
    } else if (currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const allStepsComplete = setupSteps.every(step => step.completed)

  useEffect(() => {
    if (allStepsComplete) {
      onComplete()
    }
  }, [allStepsComplete, onComplete])

  const themeConfig = `// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(34, 139, 34)',
          foreground: 'rgb(255, 255, 255)',
        },
        secondary: {
          DEFAULT: 'rgb(248, 250, 252)',
          foreground: 'rgb(15, 23, 42)',
        },
        accent: {
          DEFAULT: 'rgb(245, 158, 11)',
          foreground: 'rgb(15, 23, 42)',
        },
        background: 'rgb(255, 255, 255)',
        foreground: 'rgb(15, 23, 42)',
        border: 'rgb(226, 232, 240)',
        muted: {
          DEFAULT: 'rgb(241, 245, 249)',
          foreground: 'rgb(100, 116, 139)',
        },
        destructive: {
          DEFAULT: 'rgb(239, 68, 68)',
          foreground: 'rgb(255, 255, 255)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}`

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-[rgb(34,139,34)] rounded-lg">
              <Zap className="w-6 h-6 text-[rgb(255,255,255)]" />
            </div>
            <h1 className="text-3xl font-bold text-[rgb(15,23,42)]">
              Off-Road Planner Setup
            </h1>
          </div>
          <p className="text-lg text-[rgb(100,116,139)] max-w-2xl mx-auto">
            Configure shadcn/ui components for your outdoor adventure planning application
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[rgb(15,23,42)]">
              Setup Progress
            </span>
            <span className="text-sm text-[rgb(100,116,139)]">
              {setupSteps.filter(step => step.completed).length} of {setupSteps.length} complete
            </span>
          </div>
          <div className="w-full bg-[rgb(241,245,249)] rounded-full h-2">
            <div 
              className="bg-[rgb(34,139,34)] h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(setupSteps.filter(step => step.completed).length / setupSteps.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-4 mb-8">
          {setupSteps.map((step, index) => (
            <div
              key={step.id}
              className={`p-6 rounded-lg border transition-all duration-200 ${
                step.completed
                  ? 'bg-[rgb(248,250,252)] border-[rgb(34,139,34)]'
                  : index === currentStep
                  ? 'bg-[rgb(255,255,255)] border-[rgb(245,158,11)] shadow-md'
                  : 'bg-[rgb(255,255,255)] border-[rgb(226,232,240)]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed
                    ? 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)]'
                    : index === currentStep
                    ? 'bg-[rgb(245,158,11)] text-[rgb(255,255,255)]'
                    : 'bg-[rgb(241,245,249)] text-[rgb(100,116,139)]'
                }`}>
                  {step.completed ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-[rgb(100,116,139)] mb-3">
                    {step.description}
                  </p>
                  
                  {step.command && (
                    <div className="bg-[rgb(15,23,42)] rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-[rgb(255,255,255)] text-sm font-mono flex-1">
                          {step.command}
                        </code>
                        <button
                          onClick={() => copyToClipboard(step.command!)}
                          className="flex-shrink-0 p-2 hover:bg-[rgb(51,65,85)] rounded transition-colors"
                          aria-label="Copy command"
                        >
                          {copiedCommand === step.command ? (
                            <Check className="w-4 h-4 text-[rgb(34,139,34)]" />
                          ) : (
                            <Copy className="w-4 h-4 text-[rgb(148,163,184)]" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!step.completed && (
                    <button
                      onClick={() => markStepComplete(step.id)}
                      className="px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(22,101,22)] transition-colors font-medium"
                    >
                      Mark as Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Theme Configuration */}
        <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-[rgb(34,139,34)]" />
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">
              Theme Configuration
            </h3>
          </div>
          <p className="text-[rgb(100,116,139)] mb-4">
            Copy this configuration to your tailwind.config.js file to apply the outdoor adventure theme:
          </p>
          
          <div className="bg-[rgb(15,23,42)] rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[rgb(148,163,184)] text-sm font-mono">
                tailwind.config.js
              </span>
              <button
                onClick={() => copyToClipboard(themeConfig)}
                className="flex-shrink-0 p-2 hover:bg-[rgb(51,65,85)] rounded transition-colors"
                aria-label="Copy theme configuration"
              >
                {copiedCommand === themeConfig ? (
                  <Check className="w-4 h-4 text-[rgb(34,139,34)]" />
                ) : (
                  <Copy className="w-4 h-4 text-[rgb(148,163,184)]" />
                )}
              </button>
            </div>
            <pre className="text-[rgb(255,255,255)] text-sm font-mono overflow-x-auto">
              {themeConfig}
            </pre>
          </div>
        </div>

        {/* Completion Status */}
        {allStepsComplete && (
          <div className="bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Check className="w-6 h-6" />
              <h3 className="text-xl font-semibold">Setup Complete!</h3>
            </div>
            <p className="mb-4">
              Your off-road planning application is now ready with shadcn/ui components and the adventure theme.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-2 bg-[rgb(255,255,255)] text-[rgb(34,139,34)] rounded-lg hover:bg-[rgb(241,245,249)] transition-colors font-medium">
                <ExternalLink className="w-4 h-4 inline mr-2" />
                View Documentation
              </button>
              <button className="px-6 py-2 bg-[rgb(22,101,22)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(16,78,16)] transition-colors font-medium">
                <Package className="w-4 h-4 inline mr-2" />
                Start Building
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Demo component for page.tsx
export default function ShadcnSetupDemo() {
  return <ShadcnSetup />
}