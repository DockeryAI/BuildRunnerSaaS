import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '../../../../../lib/auth/roles';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const body = await request.json();
    const { step_id, title, criteria } = body;

    // Get the comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({
        error: 'Comment not found',
      }, { status: 404 });
    }

    // Check promotion permission
    const permissionCheck = await requirePermission(request, comment.project_id, 'canPromoteToMicrostep');
    if (!permissionCheck.authorized) {
      return NextResponse.json({
        error: permissionCheck.error,
      }, { status: 403 });
    }

    const userId = permissionCheck.userContext!.userId;

    // Generate microstep ID
    const microstepId = generateMicrostepId(step_id);

    // Extract title from comment if not provided
    const microstepTitle = title || extractTitleFromComment(comment.body);
    
    // Extract or generate criteria
    const microstepCriteria = criteria || extractCriteriaFromComment(comment.body);

    // Create the microstep in the plan
    const microstep = {
      id: microstepId,
      title: microstepTitle,
      status: 'not_started',
      criteria: microstepCriteria,
      promoted_from_comment: commentId,
      created_by: userId,
      created_at: new Date().toISOString(),
    };

    // In a full implementation, this would update the plan.json file
    // For now, we'll simulate the spec-sync operation
    const specSyncResult = await simulateSpecSync(step_id, microstep);

    if (!specSyncResult.success) {
      return NextResponse.json({
        error: 'Failed to add microstep to plan',
        details: specSyncResult.error,
      }, { status: 500 });
    }

    // Mark comment as resolved since it's been promoted
    await supabase
      .from('comments')
      .update({
        is_resolved: true,
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
        metadata: {
          ...comment.metadata,
          promoted_to_microstep: microstepId,
          promoted_at: new Date().toISOString(),
        },
      })
      .eq('id', commentId);

    // Log audit event
    await supabase
      .from('runner_events')
      .insert([{
        actor: userId,
        action: 'promoted_to_microstep',
        payload: {
          comment_id: commentId,
          project_id: comment.project_id,
          step_id,
          microstep_id: microstepId,
          microstep_title: microstepTitle,
          entity_type: comment.entity_type,
          entity_id: comment.entity_id,
        },
        metadata: {
          promotion_timestamp: new Date().toISOString(),
          original_comment_body: comment.body,
          criteria_count: microstepCriteria.length,
        },
      }]);

    // Create notification for comment author if different from promoter
    if (comment.author_id !== userId) {
      await supabase
        .from('notifications')
        .insert([{
          user_id: comment.author_id,
          type: 'promotion',
          title: 'Your comment was promoted to a microstep',
          body: `Your comment "${microstepTitle}" has been promoted to a microstep in the project plan.`,
          link: `/project/${comment.project_id}/plan#${microstepId}`,
          entity_type: 'microstep',
          entity_id: microstepId,
          actor_id: userId,
        }]);
    }

    return NextResponse.json({
      success: true,
      microstep: {
        id: microstepId,
        title: microstepTitle,
        criteria: microstepCriteria,
        step_id,
        promoted_from_comment: commentId,
      },
    });

  } catch (error) {
    console.error('[COMMENT_PROMOTE] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to promote comment to microstep',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Helper function to generate microstep ID
function generateMicrostepId(stepId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return `${stepId}.ms${timestamp}${random}`;
}

// Helper function to extract title from comment
function extractTitleFromComment(body: string): string {
  // Take the first line or first sentence as title
  const firstLine = body.split('\n')[0];
  const firstSentence = firstLine.split('.')[0];
  
  // Clean up and limit length
  let title = firstSentence.trim();
  if (title.length > 100) {
    title = title.substring(0, 97) + '...';
  }
  
  return title || 'Untitled Microstep';
}

// Helper function to extract criteria from comment
function extractCriteriaFromComment(body: string): string[] {
  const criteria: string[] = [];
  
  // Look for bullet points or numbered lists
  const lines = body.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check for various list formats
    if (
      trimmed.match(/^[-*•]\s+/) ||  // Bullet points
      trimmed.match(/^\d+\.\s+/) ||  // Numbered lists
      trimmed.match(/^[a-zA-Z]\.\s+/) || // Letter lists
      trimmed.toLowerCase().startsWith('ac:') || // Acceptance criteria
      trimmed.toLowerCase().startsWith('criteria:')
    ) {
      const criterion = trimmed.replace(/^[-*•]\s+|^\d+\.\s+|^[a-zA-Z]\.\s+|^ac:\s*|^criteria:\s*/i, '').trim();
      if (criterion) {
        criteria.push(criterion);
      }
    }
  }
  
  // If no criteria found, create a default one
  if (criteria.length === 0) {
    criteria.push('Implementation completed and tested');
  }
  
  return criteria;
}

// Helper function to simulate spec-sync operation
async function simulateSpecSync(stepId: string, microstep: any): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // In a full implementation, this would:
    // 1. Read the current plan.json
    // 2. Find the target step
    // 3. Add the new microstep
    // 4. Write back to plan.json
    // 5. Trigger any necessary rebuilds
    
    // For now, we'll just simulate success
    console.log(`Simulating spec-sync: Adding microstep ${microstep.id} to step ${stepId}`);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { success: true };
  } catch (error) {
    console.error('Spec-sync simulation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Spec-sync failed',
    };
  }
}
