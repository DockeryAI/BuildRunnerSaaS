import { NextRequest, NextResponse } from 'next/server';
import { TemplateMergeRequestSchema } from '../../../../../lib/templates/schemas';
import { TemplateMerger } from '../../../../../lib/templates/merge';
import { TemplateStorage } from '../../../../../lib/templates/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validationResult = TemplateMergeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const mergeRequest = validationResult.data;
    
    // Perform dry-run merge
    const result = await TemplateMerger.dryRunMerge(mergeRequest);
    
    // Log audit event for dry-run
    await TemplateStorage.logAudit({
      actor: 'current-user', // In production, get from auth
      action: 'template_dry_run',
      resource_type: 'merge',
      payload: {
        template_ids: mergeRequest.template_ids,
        pack_ids: mergeRequest.pack_ids,
        template_slugs: mergeRequest.template_slugs,
        pack_slugs: mergeRequest.pack_slugs,
      },
      metadata: {
        success: result.success,
        conflicts_count: result.conflicts.length,
        warnings_count: result.warnings.length,
        changes: result.changes,
      },
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('[TEMPLATE_MERGE_DRY_RUN] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Template Merge Dry Run',
    description: 'Preview template and pack merges without applying changes',
    methods: ['POST'],
    schema: {
      current_plan: 'BuildRunnerPlan object',
      template_ids: 'Array of template UUIDs (optional)',
      pack_ids: 'Array of pack UUIDs (optional)', 
      template_slugs: 'Array of template slugs (optional)',
      pack_slugs: 'Array of pack slugs (optional)',
      merge_options: {
        namespace_prefix: 'string (optional)',
        conflict_resolution: 'auto | manual (default: auto)',
        preserve_existing: 'boolean (default: true)',
        dry_run: 'boolean (default: true)',
      },
    },
  });
}
