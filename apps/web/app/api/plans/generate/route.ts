import { NextRequest, NextResponse } from 'next/server';
import { CreatePlanRequestSchema, BuildSpec } from '../../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, template, timeline, team_size } = CreatePlanRequestSchema.parse(body);

    console.log(`[PLAN_GENERATOR] Generating plan for prompt: ${prompt.substring(0, 100)}...`);

    // For MVP, generate a mock plan based on the prompt
    // In production, this would call ChatGPT/Claude API
    const mockPlan: BuildSpec = {
      projectId: `project-${Date.now()}`,
      title: extractProjectTitle(prompt),
      version: "0.4.0",
      updatedAt: new Date().toISOString(),
      milestones: generateMockMilestones(prompt, template, timeline, team_size),
      changeHistory: [{
        timestamp: new Date().toISOString(),
        version: "0.4.0",
        phase: 4,
        description: `Generated plan from prompt: ${prompt.substring(0, 50)}...`,
        author: "AI Planner",
        microsteps_completed: 0,
        files_added: []
      }]
    };

    console.log(`[PLAN_GENERATOR] Generated plan with ${mockPlan.milestones.length} milestones`);

    return NextResponse.json(mockPlan);

  } catch (error) {
    console.error('[PLAN_GENERATOR] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Plan generation failed' },
      { status: 500 }
    );
  }
}

function extractProjectTitle(prompt: string): string {
  // Simple extraction - in production would use AI
  const words = prompt.split(' ').slice(0, 5);
  return words.join(' ').replace(/[^\w\s]/g, '').trim() || 'Generated Project';
}

function generateMockMilestones(prompt: string, template: string, timeline: string, teamSize: string) {
  const baseMilestones = [
    {
      id: "m1",
      title: "Project Setup & Planning",
      steps: [
        {
          id: "m1.s1",
          title: "Initialize project structure",
          microsteps: [
            {
              id: "m1.s1.ms1",
              title: "Set up development environment",
              status: "todo" as const,
              criteria: ["Development tools installed", "Repository created", "Initial commit made"],
              priority: "P1" as const,
              effort_points: 5,
              impact_score: 8
            },
            {
              id: "m1.s1.ms2", 
              title: "Define project requirements",
              status: "todo" as const,
              criteria: ["Requirements documented", "User stories created", "Acceptance criteria defined"],
              priority: "P1" as const,
              effort_points: 8,
              impact_score: 9
            }
          ]
        }
      ]
    },
    {
      id: "m2",
      title: "Core Development",
      steps: [
        {
          id: "m2.s1",
          title: "Implement core features",
          microsteps: [
            {
              id: "m2.s1.ms1",
              title: "Build main functionality",
              status: "todo" as const,
              criteria: ["Core features implemented", "Basic UI created", "Data models defined"],
              priority: "P1" as const,
              effort_points: 20,
              impact_score: 10
            }
          ]
        }
      ]
    },
    {
      id: "m3",
      title: "Testing & Deployment",
      steps: [
        {
          id: "m3.s1",
          title: "Quality assurance",
          microsteps: [
            {
              id: "m3.s1.ms1",
              title: "Comprehensive testing",
              status: "todo" as const,
              criteria: ["Unit tests written", "Integration tests pass", "User acceptance testing completed"],
              priority: "P2" as const,
              effort_points: 15,
              impact_score: 8
            },
            {
              id: "m3.s1.ms2",
              title: "Deploy to production",
              status: "todo" as const,
              criteria: ["Production environment configured", "Application deployed", "Monitoring set up"],
              priority: "P1" as const,
              effort_points: 10,
              impact_score: 9
            }
          ]
        }
      ]
    }
  ];

  return baseMilestones;
}
