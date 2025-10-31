import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requirePermission, getUserIdFromRequest } from '../../../lib/auth/roles';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!projectId) {
      return NextResponse.json({
        error: 'project_id is required',
      }, { status: 400 });
    }

    // Check view permission
    const permissionCheck = await requirePermission(request, projectId, 'canViewProject');
    if (!permissionCheck.authorized) {
      return NextResponse.json({
        error: permissionCheck.error,
      }, { status: 403 });
    }

    // Build query
    let query = supabase
      .from('comments')
      .select(`
        id,
        project_id,
        entity_type,
        entity_id,
        parent_id,
        body,
        body_html,
        links,
        author_id,
        is_edited,
        edited_at,
        is_resolved,
        resolved_by,
        resolved_at,
        created_at,
        updated_at
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (entityType && entityId) {
      query = query.eq('entity_type', entityType).eq('entity_id', entityId);
    }

    const { data: comments, error } = await query;

    if (error) {
      throw error;
    }

    // Get mention counts for each comment
    const commentIds = comments?.map(c => c.id) || [];
    let mentions = [];
    
    if (commentIds.length > 0) {
      const { data: mentionData, error: mentionError } = await supabase
        .from('mentions')
        .select('comment_id, user_id')
        .in('comment_id', commentIds);

      if (!mentionError) {
        mentions = mentionData || [];
      }
    }

    // Enhance comments with mention data
    const enhancedComments = comments?.map(comment => ({
      ...comment,
      mentions: mentions.filter(m => m.comment_id === comment.id),
      mention_count: mentions.filter(m => m.comment_id === comment.id).length,
    })) || [];

    return NextResponse.json({
      comments: enhancedComments,
      total: enhancedComments.length,
      limit,
      offset,
    });

  } catch (error) {
    console.error('[COMMENTS_GET] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch comments',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      entity_type,
      entity_id,
      parent_id,
      body: commentBody,
      links,
    } = body;

    // Validate required fields
    if (!project_id || !entity_type || !entity_id || !commentBody) {
      return NextResponse.json({
        error: 'Missing required fields: project_id, entity_type, entity_id, body',
      }, { status: 400 });
    }

    // Validate entity_type
    const validEntityTypes = ['milestone', 'step', 'microstep', 'plan', 'test', 'file'];
    if (!validEntityTypes.includes(entity_type)) {
      return NextResponse.json({
        error: `Invalid entity_type. Must be one of: ${validEntityTypes.join(', ')}`,
      }, { status: 400 });
    }

    // Check comment permission
    const permissionCheck = await requirePermission(request, project_id, 'canComment');
    if (!permissionCheck.authorized) {
      return NextResponse.json({
        error: permissionCheck.error,
      }, { status: 403 });
    }

    const userId = permissionCheck.userContext!.userId;

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([{
        project_id,
        entity_type,
        entity_id,
        parent_id: parent_id || null,
        body: commentBody,
        body_html: null, // TODO: Add markdown rendering
        links: links || {},
        author_id: userId,
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Process mentions
    const mentions = extractMentions(commentBody);
    if (mentions.length > 0) {
      await processMentions(comment.id, mentions);
    }

    // Log audit event
    await supabase
      .from('runner_events')
      .insert([{
        actor: userId,
        action: 'comment_created',
        payload: {
          comment_id: comment.id,
          project_id,
          entity_type,
          entity_id,
          parent_id,
          mentions_count: mentions.length,
        },
        metadata: {
          comment_length: commentBody.length,
          has_links: Object.keys(links || {}).length > 0,
        },
      }]);

    return NextResponse.json(comment, { status: 201 });

  } catch (error) {
    console.error('[COMMENTS_POST] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to create comment',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Helper function to extract mentions from comment text
function extractMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return [...new Set(mentions)]; // Remove duplicates
}

// Helper function to process mentions
async function processMentions(commentId: string, mentions: string[]): Promise<void> {
  try {
    // For now, we'll store mentions by username
    // In a full implementation, we'd resolve usernames to user IDs
    const mentionRecords = mentions.map(username => ({
      comment_id: commentId,
      user_id: `user_${username}`, // Mock user ID - would be resolved from username
    }));

    const { error } = await supabase
      .from('mentions')
      .insert(mentionRecords);

    if (error) {
      console.error('Failed to create mentions:', error);
    }
  } catch (error) {
    console.error('Failed to process mentions:', error);
  }
}
