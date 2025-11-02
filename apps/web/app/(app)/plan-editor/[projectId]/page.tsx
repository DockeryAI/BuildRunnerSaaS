'use client';

import { useState, useEffect } from 'react';
import { VisualPlanEditor, Milestone } from '@/components/plan-editor/VisualPlanEditor';
import { addDays } from 'date-fns';

export default function PlanEditorPage({ params }: { params: { projectId: string } }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMilestones();
  }, [params.projectId]);

  const loadMilestones = () => {
    // Mock milestones for demonstration
    const mockMilestones: Milestone[] = [
      {
        id: 'm1',
        title: 'Project Setup & Foundation',
        description: 'Initialize project, setup development environment, configure CI/CD',
        startDate: new Date(),
        endDate: addDays(new Date(), 7),
        status: 'completed',
        dependencies: [],
        assignee: 'Dev Team',
        isExpanded: false,
        tasks: [
          { id: 't1', title: 'Initialize Git repository', description: '', estimatedHours: 1, status: 'completed' },
          { id: 't2', title: 'Setup Next.js project', description: '', estimatedHours: 2, status: 'completed' },
          { id: 't3', title: 'Configure ESLint and Prettier', description: '', estimatedHours: 1, status: 'completed' },
        ],
      },
      {
        id: 'm2',
        title: 'Authentication System',
        description: 'Implement JWT-based authentication with refresh tokens',
        startDate: addDays(new Date(), 7),
        endDate: addDays(new Date(), 14),
        status: 'in_progress',
        dependencies: ['m1'],
        assignee: 'Backend Team',
        isExpanded: false,
        tasks: [
          { id: 't4', title: 'Create auth API routes', description: '', estimatedHours: 8, status: 'completed' },
          { id: 't5', title: 'Implement JWT middleware', description: '', estimatedHours: 4, status: 'in_progress' },
          { id: 't6', title: 'Add refresh token rotation', description: '', estimatedHours: 6, status: 'not_started' },
        ],
      },
      {
        id: 'm3',
        title: 'Core Features Development',
        description: 'Build main application features and user flows',
        startDate: addDays(new Date(), 14),
        endDate: addDays(new Date(), 28),
        status: 'not_started',
        dependencies: ['m2'],
        isExpanded: false,
        tasks: [
          { id: 't7', title: 'Design database schema', description: '', estimatedHours: 8, status: 'not_started' },
          { id: 't8', title: 'Create API endpoints', description: '', estimatedHours: 20, status: 'not_started' },
          { id: 't9', title: 'Build UI components', description: '', estimatedHours: 30, status: 'not_started' },
        ],
      },
      {
        id: 'm4',
        title: 'Testing & QA',
        description: 'Comprehensive testing and quality assurance',
        startDate: addDays(new Date(), 28),
        endDate: addDays(new Date(), 35),
        status: 'not_started',
        dependencies: ['m3'],
        isExpanded: false,
        tasks: [
          { id: 't10', title: 'Write unit tests', description: '', estimatedHours: 16, status: 'not_started' },
          { id: 't11', title: 'Integration testing', description: '', estimatedHours: 12, status: 'not_started' },
          { id: 't12', title: 'E2E testing', description: '', estimatedHours: 10, status: 'not_started' },
        ],
      },
    ];

    setMilestones(mockMilestones);
    setLoading(false);
  };

  const handleMilestoneUpdate = (updated: Milestone[]) => {
    setMilestones(updated);
    // In production, save to database
    console.log('Saving milestones:', updated);
  };

  const handleMilestoneEdit = (milestone: Milestone) => {
    console.log('Edit milestone:', milestone);
    // Open edit modal
  };

  const handleMilestoneDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      setMilestones(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleTaskAdd = (milestoneId: string) => {
    console.log('Add task to milestone:', milestoneId);
    // Open add task modal
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <VisualPlanEditor
        initialMilestones={milestones}
        onMilestoneUpdate={handleMilestoneUpdate}
        onMilestoneEdit={handleMilestoneEdit}
        onMilestoneDelete={handleMilestoneDelete}
        onTaskAdd={handleTaskAdd}
      />
    </div>
  );
}
