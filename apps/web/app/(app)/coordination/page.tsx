'use client';

import { useState, useEffect } from 'react';
import { CoordinationMonitor, AgentEvent, CoordinationProblem, AgentType, AgentActivity } from '@/components/ai-coordination/CoordinationMonitor';

export default function CoordinationPage() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [problems, setProblems] = useState<CoordinationProblem[]>([]);

  useEffect(() => {
    // Generate mock events for demonstration
    generateMockEvents();
    generateMockProblems();

    // Simulate real-time updates
    const interval = setInterval(() => {
      addRandomEvent();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateMockEvents = () => {
    const mockEvents: AgentEvent[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 60000),
        agentType: 'StrategyGPT' as AgentType,
        activity: 'analyzing' as AgentActivity,
        message: 'Analyzing PRD requirements for feasibility',
        details: 'Reviewing 12 features for technical complexity and dependencies',
        status: 'completed',
        processingTime: 847,
        cost: 0.012,
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 45000),
        agentType: 'CodeGPT' as AgentType,
        activity: 'generating' as AgentActivity,
        message: 'Generating authentication module',
        details: 'Creating JWT-based auth with refresh tokens',
        status: 'completed',
        processingTime: 1234,
        cost: 0.008,
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 30000),
        agentType: 'TestGPT' as AgentType,
        activity: 'reviewing' as AgentActivity,
        message: 'Reviewing generated test coverage',
        details: 'Analyzing 15 test files for completeness',
        relatedAgents: ['CodeGPT' as AgentType],
        status: 'completed',
        processingTime: 456,
        cost: 0.004,
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 15000),
        agentType: 'StrategyGPT' as AgentType,
        activity: 'resolving_conflict' as AgentActivity,
        message: 'Resolving feature priority conflict',
        details: 'Payment integration vs Analytics dashboard - determining optimal sequence',
        relatedAgents: ['ProductGPT' as AgentType, 'MonetizationGPT' as AgentType],
        status: 'in_progress',
        processingTime: 2100,
        cost: 0.015,
      },
    ];
    setEvents(mockEvents);
  };

  const generateMockProblems = () => {
    const mockProblems: CoordinationProblem[] = [
      {
        id: 'p1',
        title: 'API Rate Limit Approaching',
        description: 'DeepSeek V3 requests approaching rate limit (450/500 per minute)',
        severity: 'medium',
        detectedAt: new Date(Date.now() - 120000),
        status: 'resolving',
        involvedAgents: ['CodeGPT' as AgentType, 'StrategyGPT' as AgentType],
        resolutionSteps: [
          'Switching to DeepSeek R1 for non-critical tasks',
          'Implementing request queue with exponential backoff',
          'Monitoring rate limit recovery',
        ],
        autoResolved: false,
      },
      {
        id: 'p2',
        title: 'Dependency Conflict Detected',
        description: 'Two features require incompatible versions of React Router',
        severity: 'high',
        detectedAt: new Date(Date.now() - 300000),
        resolvedAt: new Date(Date.now() - 60000),
        status: 'resolved',
        involvedAgents: ['CodeGPT' as AgentType],
        resolutionSteps: [
          'Analyzed dependency trees',
          'Upgraded React Router to v6.20',
          'Updated all route definitions',
          'Ran integration tests',
        ],
        autoResolved: true,
      },
    ];
    setProblems(mockProblems);
  };

  const addRandomEvent = () => {
    const agents: AgentType[] = ['StrategyGPT', 'CodeGPT', 'TestGPT', 'ProductGPT'];
    const activities: AgentActivity[] = ['analyzing', 'generating', 'reviewing', 'consulting_peer'];
    const messages = [
      'Processing user feedback analysis',
      'Optimizing database queries',
      'Reviewing security implementation',
      'Coordinating feature dependencies',
    ];

    const newEvent: AgentEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      agentType: agents[Math.floor(Math.random() * agents.length)],
      activity: activities[Math.floor(Math.random() * activities.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      status: 'in_progress',
      processingTime: 500 + Math.random() * 1500,
      cost: 0.001 + Math.random() * 0.02,
    };

    setEvents((prev) => [newEvent, ...prev].slice(0, 50));
  };

  const handleEscalate = (problemId: string) => {
    console.log('Escalating problem:', problemId);
    // In production, would create a ticket or notification
    alert('Problem escalated to human review');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <CoordinationMonitor
        events={events}
        problems={problems}
        onEscalate={handleEscalate}
        maxEvents={20}
      />
    </div>
  );
}
