import { z } from 'zod';

// Build Spec Types
export const MicrostepSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['todo', 'doing', 'done']),
  criteria: z.array(z.string()),
  links: z.record(z.string()).optional(),
  depends_on: z.array(z.string()).optional(),
  owner: z.string().optional(),
  effort_points: z.number().min(1).max(100).optional(),
  impact_score: z.number().min(1).max(10).optional(),
  priority: z.enum(['P1', 'P2', 'P3']).optional(),
  risk_level: z.enum(['low', 'medium', 'high']).optional(),
  risk_notes: z.string().optional(),
  demo_script: z.array(z.string()).optional(),
  rollback_plan: z.string().optional(),
  post_check: z.string().optional(),
});

export const StepSchema = z.object({
  id: z.string(),
  title: z.string(),
  microsteps: z.array(MicrostepSchema),
});

export const MilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  steps: z.array(StepSchema),
});

export const BuildSpecSchema = z.object({
  projectId: z.string(),
  title: z.string(),
  version: z.string(),
  updatedAt: z.string(),
  milestones: z.array(MilestoneSchema),
  changeHistory: z.array(z.object({
    timestamp: z.string(),
    version: z.string(),
    phase: z.number(),
    description: z.string(),
    author: z.string(),
    microsteps_completed: z.number(),
    files_added: z.array(z.string()),
  })).optional(),
});

export type Microstep = z.infer<typeof MicrostepSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type BuildSpec = z.infer<typeof BuildSpecSchema>;

// API Response Types
export const SpecSyncResponseSchema = z.object({
  success: z.boolean(),
  records_synced: z.number(),
  spec_hash: z.string(),
  plan_id: z.string(),
});

export const SpecDiffResponseSchema = z.object({
  status: z.enum(['equal', 'drift', 'no_remote']),
  message: z.string(),
  remote_version: z.string().optional(),
  remote_hash: z.string().optional(),
  local_hash: z.string().optional(),
  last_synced_at: z.string().optional(),
  diff_summary: z.object({
    total_microsteps: z.number(),
    status_counts: z.record(z.number()),
    last_updated: z.string().nullable(),
  }).optional(),
});

export type SpecSyncResponse = z.infer<typeof SpecSyncResponseSchema>;
export type SpecDiffResponse = z.infer<typeof SpecDiffResponseSchema>;

// Create Plan Request
export const CreatePlanRequestSchema = z.object({
  prompt: z.string().min(10),
  template: z.enum(['web-app', 'mobile-app', 'api-service', 'custom']),
  timeline: z.enum(['2-weeks', '1-month', '3-months', '6-months']),
  team_size: z.enum(['solo', '2-3', '4-6', '7+']),
});

export type CreatePlanRequest = z.infer<typeof CreatePlanRequestSchema>;
