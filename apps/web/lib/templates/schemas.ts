import { z } from 'zod';

// Base schemas for validation
export const SlugSchema = z.string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be 100 characters or less')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

export const VersionSchema = z.string()
  .regex(/^\d+\.\d+\.\d+$/, 'Version must follow semantic versioning (e.g., 1.0.0)');

export const TagsSchema = z.array(z.string().min(1).max(50))
  .max(10, 'Maximum 10 tags allowed');

// BuildRunner plan schema (simplified for validation)
export const MicrostepSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['todo', 'doing', 'done', 'blocked']),
  criteria: z.array(z.string()),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
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

export const BuildRunnerPlanSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  version: VersionSchema.optional(),
  milestones: z.array(MilestoneSchema),
  metadata: z.record(z.any()).optional(),
});

// Template definition schema
export const TemplateDefSchema = z.object({
  id: z.string().uuid().optional(),
  slug: SlugSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  json_spec: BuildRunnerPlanSchema,
  version: VersionSchema,
  tags: TagsSchema.default([]),
  installs_count: z.number().int().min(0).default(0),
  author_id: z.string().optional(),
  is_public: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateTemplateDefSchema = TemplateDefSchema.omit({
  id: true,
  installs_count: true,
  created_at: true,
  updated_at: true,
});

export const UpdateTemplateDefSchema = TemplateDefSchema.partial().omit({
  id: true,
  created_at: true,
});

// Template version schema
export const TemplateVersionSchema = z.object({
  id: z.string().uuid().optional(),
  template_id: z.string().uuid(),
  version: VersionSchema,
  json_spec: BuildRunnerPlanSchema,
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
  created_by: z.string().optional(),
  created_at: z.string().datetime().optional(),
});

export const CreateTemplateVersionSchema = TemplateVersionSchema.omit({
  id: true,
  created_at: true,
});

// JSON Patch operation schema (RFC 6902)
export const JsonPatchOperationSchema = z.object({
  op: z.enum(['add', 'remove', 'replace', 'move', 'copy', 'test']),
  path: z.string(),
  value: z.any().optional(),
  from: z.string().optional(),
});

export const JsonPatchSchema = z.array(JsonPatchOperationSchema);

// Template pack schema
export const TemplatePackSchema = z.object({
  id: z.string().uuid().optional(),
  slug: SlugSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  json_patch: JsonPatchSchema,
  tags: TagsSchema.default([]),
  installs_count: z.number().int().min(0).default(0),
  author_id: z.string().optional(),
  is_public: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  dependencies: z.array(SlugSchema).default([]),
  conflicts: z.array(SlugSchema).default([]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateTemplatePackSchema = TemplatePackSchema.omit({
  id: true,
  installs_count: true,
  created_at: true,
  updated_at: true,
});

export const UpdateTemplatePackSchema = TemplatePackSchema.partial().omit({
  id: true,
  created_at: true,
});

// Template audit schema
export const TemplateAuditSchema = z.object({
  id: z.string().uuid().optional(),
  actor: z.string(),
  action: z.enum([
    'template_created', 'template_updated', 'template_deleted', 'template_published',
    'template_installed', 'template_dry_run', 'pack_created', 'pack_updated', 
    'pack_installed', 'pack_dry_run', 'version_created', 'merge_applied',
    'conflict_resolved', 'template_rated'
  ]),
  resource_type: z.enum(['template', 'pack', 'version', 'merge']),
  resource_id: z.string().uuid().optional(),
  payload: z.record(z.any()).default({}),
  metadata: z.record(z.any()).default({}),
  created_at: z.string().datetime().optional(),
});

// Template merge request schema
export const TemplateMergeRequestSchema = z.object({
  current_plan: BuildRunnerPlanSchema,
  template_ids: z.array(z.string().uuid()).optional(),
  pack_ids: z.array(z.string().uuid()).optional(),
  template_slugs: z.array(SlugSchema).optional(),
  pack_slugs: z.array(SlugSchema).optional(),
  merge_options: z.object({
    namespace_prefix: z.string().optional(),
    conflict_resolution: z.enum(['auto', 'manual']).default('auto'),
    preserve_existing: z.boolean().default(true),
    dry_run: z.boolean().default(true),
  }).default({}),
});

// Template merge result schema
export const TemplateMergeResultSchema = z.object({
  success: z.boolean(),
  merged_plan: BuildRunnerPlanSchema.optional(),
  conflicts: z.array(z.object({
    type: z.enum(['id_collision', 'title_collision', 'dependency_conflict']),
    path: z.string(),
    current_value: z.any(),
    new_value: z.any(),
    resolution: z.string().optional(),
  })).default([]),
  warnings: z.array(z.object({
    type: z.string(),
    message: z.string(),
    path: z.string().optional(),
  })).default([]),
  changes: z.object({
    added_milestones: z.number().default(0),
    added_steps: z.number().default(0),
    added_microsteps: z.number().default(0),
    modified_items: z.number().default(0),
  }),
  metadata: z.record(z.any()).default({}),
});

// Template rating schema
export const TemplateRatingSchema = z.object({
  id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
  pack_id: z.string().uuid().optional(),
  user_id: z.string(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000, 'Review must be 1000 characters or less').optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}).refine(
  (data) => (data.template_id && !data.pack_id) || (!data.template_id && data.pack_id),
  'Either template_id or pack_id must be provided, but not both'
);

// Template collection schema
export const TemplateCollectionSchema = z.object({
  id: z.string().uuid().optional(),
  slug: SlugSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  template_ids: z.array(z.string().uuid()).default([]),
  pack_ids: z.array(z.string().uuid()).default([]),
  is_public: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  created_by: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// API request/response schemas
export const ListTemplatesRequestSchema = z.object({
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  public: z.boolean().optional(),
  author_id: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sort: z.enum(['created_at', 'installs_count', 'title']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const ListTemplatesResponseSchema = z.object({
  templates: z.array(TemplateDefSchema),
  total: z.number().int().min(0),
  limit: z.number().int(),
  offset: z.number().int(),
});

export const ListPacksRequestSchema = z.object({
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  public: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const ListPacksResponseSchema = z.object({
  packs: z.array(TemplatePackSchema),
  total: z.number().int().min(0),
  limit: z.number().int(),
  offset: z.number().int(),
});

// Export types
export type TemplateDef = z.infer<typeof TemplateDefSchema>;
export type CreateTemplateDef = z.infer<typeof CreateTemplateDefSchema>;
export type UpdateTemplateDef = z.infer<typeof UpdateTemplateDefSchema>;

export type TemplateVersion = z.infer<typeof TemplateVersionSchema>;
export type CreateTemplateVersion = z.infer<typeof CreateTemplateVersionSchema>;

export type TemplatePack = z.infer<typeof TemplatePackSchema>;
export type CreateTemplatePack = z.infer<typeof CreateTemplatePackSchema>;
export type UpdateTemplatePack = z.infer<typeof UpdateTemplatePackSchema>;

export type TemplateAudit = z.infer<typeof TemplateAuditSchema>;
export type TemplateMergeRequest = z.infer<typeof TemplateMergeRequestSchema>;
export type TemplateMergeResult = z.infer<typeof TemplateMergeResultSchema>;
export type TemplateRating = z.infer<typeof TemplateRatingSchema>;
export type TemplateCollection = z.infer<typeof TemplateCollectionSchema>;

export type ListTemplatesRequest = z.infer<typeof ListTemplatesRequestSchema>;
export type ListTemplatesResponse = z.infer<typeof ListTemplatesResponseSchema>;
export type ListPacksRequest = z.infer<typeof ListPacksRequestSchema>;
export type ListPacksResponse = z.infer<typeof ListPacksResponseSchema>;

export type BuildRunnerPlan = z.infer<typeof BuildRunnerPlanSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Microstep = z.infer<typeof MicrostepSchema>;
export type JsonPatchOperation = z.infer<typeof JsonPatchOperationSchema>;
