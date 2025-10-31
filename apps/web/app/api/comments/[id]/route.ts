import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requirePermission, getUserIdFromRequest } from '../../../../lib/auth/roles';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;

    const { data: comment, error } = await supabase
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
      .eq('id', commentId)
      .single();

    if (error || !comment) {
      return NextResponse.json({
        error: 'Comment not found',
      }, { status: 404 });
    }

    // Check view permission
    const permissionCheck = await requirePermission(request, comment.project_id, 'canViewProject');
    if (!permissionCheck.authorized) {
      return NextResponse.json({
        error: permissionCheck.error,
      }, { status: 403 });
    }

    // Get mentions for this comment
    const { data: mentions, error: mentionError } = await supabase
      .from('mentions')
      .select('user_id, mention_type, is_read')
      .eq('comment_id', commentId);

    if (mentionError) {
      console.error('Failed to fetch mentions:', mentionError);
    }

    return NextResponse.json({
      ...comment,
      mentions: mentions || [],
    });

  } catch (error) {
    console.error('[COMMENT_GET] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch comment',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const body = await request.json();
    const { body: newBody, links } = body;

    // Get existing comment
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('project_id, author_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json({
        error: 'Comment not found',
      }, { status: 404 });
    }

    // Check if user can edit (author or has delete permission)
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
      }, { status: 401 });
    }

    const isAuthor = existingComment.author_id === userId;
    const permissionCheck = await requirePermission(request, existingComment.project_id, 'canDeleteComments');
    
    if (!isAuthor && !permissionCheck.authorized) {
      return NextResponse.json({
        error: 'You can only edit your own comments or need delete permissions',
      }, { status: 403 });
    }

    // Update comment
    const { data: updatedComment, error } = await supabase
      .from('comments')
      .update({
        body: newBody,
        links: links || {},
        is_edited: true,
        edited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Process new mentions
    const mentions = extractMentions(newBody);
    if (mentions.length > 0) {
      // Remove old mentions
      await supabase
        .from('mentions')
        .delete()
        .eq('comment_id', commentId);

      // Add new mentions
      await processMentions(commentId, mentions);
    }

    // Log audit event
    await supabase
      .from('runner_events')
      .insert([{
        actor: userId,
        action: 'comment_updated',
        payload: {
          comment_id: commentId,
          project_id: existingComment.project_id,
        },
        metadata: {
          edited_by_author: isAuthor,
          new_length: newBody.length,
        },
      }]);

    return NextResponse.json(updatedComment);

  } catch (error) {
    console.error('[COMMENT_PUT] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to update comment',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;

    // Get existing comment
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('project_id, author_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json({
        error: 'Comment not found',
      }, { status: 404 });
    }

    // Check if user can delete (author or has delete permission)
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
      }, { status: 401 });
    }

    const isAuthor = existingComment.author_id === userId;
    const permissionCheck = await requirePermission(request, existingComment.project_id, 'canDeleteComments');
    
    if (!isAuthor && !permissionCheck.authorized) {
      return NextResponse.json({
        error: 'You can only delete your own comments or need delete permissions',
      }, { status: 403 });
    }

    // Delete comment (cascades to mentions)
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      throw error;
    }

    // Log audit event
    await supabase
      .from('runner_events')
      .insert([{
        actor: userId,
        action: 'comment_deleted',
        payload: {
          comment_id: commentId,
          project_id: existingComment.project_id,
        },
        metadata: {
          deleted_by_author: isAuthor,
        },
      }]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[COMMENT_DELETE] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to delete comment',
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
