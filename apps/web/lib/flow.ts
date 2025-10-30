import { z } from 'zod';
import { BuildSpec, Milestone, Step, Microstep } from './types';

// Flow-specific types for graph visualization
export const FlowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['milestone', 'step', 'microstep']),
  title: z.string(),
  status: z.enum(['todo', 'doing', 'done']),
  priority: z.enum(['P1', 'P2', 'P3']).optional(),
  risk_level: z.enum(['low', 'medium', 'high']).optional(),
  effort_points: z.number().optional(),
  impact_score: z.number().optional(),
  owner: z.string().optional(),
  criteria: z.array(z.string()).optional(),
  depends_on: z.array(z.string()).optional(),
  links: z.record(z.string()).optional(),
  parent_id: z.string().optional(),
  children: z.array(z.string()).optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  drift_status: z.enum(['none', 'suspected', 'confirmed']).default('none'),
});

export const FlowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.enum(['hierarchy', 'dependency']),
});

export const FlowDataSchema = z.object({
  nodes: z.array(FlowNodeSchema),
  edges: z.array(FlowEdgeSchema),
  metadata: z.object({
    total_nodes: z.number(),
    completion_percentage: z.number(),
    last_updated: z.string(),
    drift_count: z.number(),
  }),
});

export type FlowNode = z.infer<typeof FlowNodeSchema>;
export type FlowEdge = z.infer<typeof FlowEdgeSchema>;
export type FlowData = z.infer<typeof FlowDataSchema>;

// Progress summary for each phase
export const ProgressSummarySchema = z.object({
  phase: z.number(),
  title: z.string(),
  total_microsteps: z.number(),
  completed_microsteps: z.number(),
  in_progress_microsteps: z.number(),
  completion_percentage: z.number(),
  estimated_completion: z.string().optional(),
  risk_score: z.number().min(0).max(10),
});

export type ProgressSummary = z.infer<typeof ProgressSummarySchema>;

/**
 * Fetch hierarchical plan data and convert to flow graph format
 */
export async function fetchFlowData(): Promise<FlowData> {
  try {
    // Load local plan data
    const response = await fetch('/api/plans/local');
    if (!response.ok) {
      throw new Error('Failed to fetch plan data');
    }
    
    const plan: BuildSpec = await response.json();
    if (!plan) {
      throw new Error('No plan data available');
    }

    // Convert plan to flow nodes and edges
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    let nodeCount = 0;
    let completedCount = 0;

    // Process each milestone
    plan.milestones.forEach((milestone, mIndex) => {
      const milestoneNode: FlowNode = {
        id: milestone.id,
        type: 'milestone',
        title: milestone.title,
        status: calculateMilestoneStatus(milestone),
        position: { x: mIndex * 400, y: 0 },
        children: milestone.steps.map(s => s.id),
        drift_status: 'none', // TODO: Get from spec-diff
      };
      
      nodes.push(milestoneNode);
      nodeCount++;
      if (milestoneNode.status === 'done') completedCount++;

      // Process each step
      milestone.steps.forEach((step, sIndex) => {
        const stepNode: FlowNode = {
          id: step.id,
          type: 'step',
          title: step.title,
          status: calculateStepStatus(step),
          position: { x: mIndex * 400, y: (sIndex + 1) * 120 },
          parent_id: milestone.id,
          children: step.microsteps.map(ms => ms.id),
          drift_status: 'none',
        };
        
        nodes.push(stepNode);
        nodeCount++;
        if (stepNode.status === 'done') completedCount++;

        // Add hierarchy edge from milestone to step
        edges.push({
          id: `${milestone.id}-${step.id}`,
          source: milestone.id,
          target: step.id,
          type: 'hierarchy',
        });

        // Process each microstep
        step.microsteps.forEach((microstep, msIndex) => {
          const microstepNode: FlowNode = {
            id: microstep.id,
            type: 'microstep',
            title: microstep.title,
            status: microstep.status,
            priority: microstep.priority,
            risk_level: microstep.risk_level,
            effort_points: microstep.effort_points,
            impact_score: microstep.impact_score,
            owner: microstep.owner,
            criteria: microstep.criteria,
            depends_on: microstep.depends_on,
            links: microstep.links,
            position: { 
              x: mIndex * 400 + (msIndex % 2) * 200, 
              y: (sIndex + 1) * 120 + Math.floor(msIndex / 2 + 1) * 80 
            },
            parent_id: step.id,
            drift_status: 'none',
          };
          
          nodes.push(microstepNode);
          nodeCount++;
          if (microstepNode.status === 'done') completedCount++;

          // Add hierarchy edge from step to microstep
          edges.push({
            id: `${step.id}-${microstep.id}`,
            source: step.id,
            target: microstep.id,
            type: 'hierarchy',
          });

          // Add dependency edges
          if (microstep.depends_on) {
            microstep.depends_on.forEach(depId => {
              edges.push({
                id: `dep-${depId}-${microstep.id}`,
                source: depId,
                target: microstep.id,
                type: 'dependency',
              });
            });
          }
        });
      });
    });

    const flowData: FlowData = {
      nodes,
      edges,
      metadata: {
        total_nodes: nodeCount,
        completion_percentage: nodeCount > 0 ? Math.round((completedCount / nodeCount) * 100) : 0,
        last_updated: plan.updatedAt,
        drift_count: 0, // TODO: Get from spec-diff
      },
    };

    return FlowDataSchema.parse(flowData);
  } catch (error) {
    console.error('Failed to fetch flow data:', error);
    throw error;
  }
}

/**
 * Calculate milestone status based on steps
 */
function calculateMilestoneStatus(milestone: Milestone): 'todo' | 'doing' | 'done' {
  const stepStatuses = milestone.steps.map(step => calculateStepStatus(step));
  
  if (stepStatuses.every(status => status === 'done')) return 'done';
  if (stepStatuses.some(status => status === 'doing' || status === 'done')) return 'doing';
  return 'todo';
}

/**
 * Calculate step status based on microsteps
 */
function calculateStepStatus(step: Step): 'todo' | 'doing' | 'done' {
  const microstepStatuses = step.microsteps.map(ms => ms.status);
  
  if (microstepStatuses.every(status => status === 'done')) return 'done';
  if (microstepStatuses.some(status => status === 'doing' || status === 'done')) return 'doing';
  return 'todo';
}

/**
 * Fetch progress summary by phase
 */
export async function fetchProgressSummary(): Promise<ProgressSummary[]> {
  try {
    const flowData = await fetchFlowData();
    const summaries: ProgressSummary[] = [];
    
    // Group nodes by phase (extract from milestone ID)
    const phaseGroups = new Map<number, FlowNode[]>();
    
    flowData.nodes.forEach(node => {
      if (node.type === 'microstep') {
        // Extract phase number from ID (e.g., p4.s1.ms1 -> 4)
        const phaseMatch = node.id.match(/^p(\d+)\./);
        if (phaseMatch) {
          const phase = parseInt(phaseMatch[1]);
          if (!phaseGroups.has(phase)) {
            phaseGroups.set(phase, []);
          }
          phaseGroups.get(phase)!.push(node);
        }
      }
    });

    // Calculate summary for each phase
    phaseGroups.forEach((nodes, phase) => {
      const totalMicrosteps = nodes.length;
      const completedMicrosteps = nodes.filter(n => n.status === 'done').length;
      const inProgressMicrosteps = nodes.filter(n => n.status === 'doing').length;
      
      // Calculate risk score based on risk levels
      const riskScores = nodes
        .map(n => n.risk_level === 'high' ? 3 : n.risk_level === 'medium' ? 2 : 1)
        .reduce((sum, score) => sum + score, 0);
      const avgRiskScore = totalMicrosteps > 0 ? riskScores / totalMicrosteps : 0;

      summaries.push({
        phase,
        title: `Phase ${phase}`,
        total_microsteps: totalMicrosteps,
        completed_microsteps: completedMicrosteps,
        in_progress_microsteps: inProgressMicrosteps,
        completion_percentage: totalMicrosteps > 0 ? Math.round((completedMicrosteps / totalMicrosteps) * 100) : 0,
        risk_score: Math.round(avgRiskScore * 10) / 10,
      });
    });

    return summaries.sort((a, b) => a.phase - b.phase);
  } catch (error) {
    console.error('Failed to fetch progress summary:', error);
    return [];
  }
}
