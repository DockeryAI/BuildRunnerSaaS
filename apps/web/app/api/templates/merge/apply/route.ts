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
    
    // Force dry_run to false for apply
    mergeRequest.merge_options.dry_run = false;
    
    // Perform merge application
    const result = await TemplateMerger.applyMerge(mergeRequest);
    
    if (result.success) {
      // Increment install counts for templates and packs
      const templateIds = [...(mergeRequest.template_ids || [])];
      const packIds = [...(mergeRequest.pack_ids || [])];
      
      // Load templates by slug and add their IDs
      if (mergeRequest.template_slugs) {
        for (const slug of mergeRequest.template_slugs) {
          const template = await TemplateStorage.getTemplate(slug);
          if (template) {
            templateIds.push(template.id);
          }
        }
      }
      
      // Load packs by slug and add their IDs
      if (mergeRequest.pack_slugs) {
        for (const slug of mergeRequest.pack_slugs) {
          const pack = await TemplateStorage.getPack(slug);
          if (pack) {
            packIds.push(pack.id);
          }
        }
      }
      
      // Increment install counts
      for (const templateId of templateIds) {
        await TemplateStorage.incrementInstalls('template', templateId, 'current-user');
      }
      
      for (const packId of packIds) {
        await TemplateStorage.incrementInstalls('pack', packId, 'current-user');
      }
    }
    
    // Log audit event for apply
    await TemplateStorage.logAudit({
      actor: 'current-user', // In production, get from auth
      action: 'merge_applied',
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
    console.error('[TEMPLATE_MERGE_APPLY] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Template Merge Apply',
    description: 'Apply template and pack merges to the current plan',
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
      },
    },
    note: 'This endpoint applies changes permanently. Use dry-run first to preview.',
  });
}
