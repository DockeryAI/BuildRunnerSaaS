import { NextRequest, NextResponse } from 'next/server';

export interface FeedbackItem {
  id: string;
  buildId: string;
  projectId: string;
  status: 'pending' | 'analyzing' | 'in_progress' | 'ready' | 'verified' | 'rejected';
  type: 'bug' | 'feature' | 'design' | 'performance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  context: {
    route: string;
    component?: string;
    file?: string;
    lineNumber?: number;
    screenshot?: string;
    deviceType?: string;
  };
  changes?: {
    files: Array<{ path: string; diff: string }>;
    summary: string;
  };
  createdAt: string;
  updatedAt: string;
}

// In-memory storage (in production, use a database)
const feedbackStore = new Map<string, FeedbackItem>();

/**
 * Submit new feedback
 * POST /api/build/feedback
 * Body: { projectId, buildId, type, priority, description, context }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, buildId, type, priority, description, context } = body;

    if (!projectId || !buildId || !type || !priority || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const feedbackId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();

    const feedbackItem: FeedbackItem = {
      id: feedbackId,
      buildId,
      projectId,
      status: 'pending',
      type,
      priority,
      description,
      context: context || {},
      createdAt: now,
      updatedAt: now,
    };

    feedbackStore.set(feedbackId, feedbackItem);

    return NextResponse.json({
      success: true,
      feedback: feedbackItem,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

/**
 * Get feedback items for a build
 * GET /api/build/feedback?buildId=X&projectId=Y
 */
export async function GET(request: NextRequest) {
  try {
    const buildId = request.nextUrl.searchParams.get('buildId');
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!buildId || !projectId) {
      return NextResponse.json(
        { error: 'Missing buildId or projectId parameter' },
        { status: 400 }
      );
    }

    // Filter feedback items by buildId and projectId
    const feedbackItems = Array.from(feedbackStore.values()).filter(
      (item) => item.buildId === buildId && item.projectId === projectId
    );

    // Sort by creation date (newest first)
    feedbackItems.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      feedback: feedbackItems,
      count: feedbackItems.length,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

/**
 * Update feedback item status
 * PATCH /api/build/feedback
 * Body: { feedbackId, status?, changes? }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedbackId, status, changes } = body;

    if (!feedbackId) {
      return NextResponse.json(
        { error: 'Missing feedbackId' },
        { status: 400 }
      );
    }

    const feedbackItem = feedbackStore.get(feedbackId);

    if (!feedbackItem) {
      return NextResponse.json(
        { error: 'Feedback item not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (status) {
      feedbackItem.status = status;
    }
    if (changes) {
      feedbackItem.changes = changes;
    }
    feedbackItem.updatedAt = new Date().toISOString();

    feedbackStore.set(feedbackId, feedbackItem);

    return NextResponse.json({
      success: true,
      feedback: feedbackItem,
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update feedback' },
      { status: 500 }
    );
  }
}

/**
 * Delete feedback item
 * DELETE /api/build/feedback?feedbackId=X
 */
export async function DELETE(request: NextRequest) {
  try {
    const feedbackId = request.nextUrl.searchParams.get('feedbackId');

    if (!feedbackId) {
      return NextResponse.json(
        { error: 'Missing feedbackId parameter' },
        { status: 400 }
      );
    }

    if (!feedbackStore.has(feedbackId)) {
      return NextResponse.json(
        { error: 'Feedback item not found' },
        { status: 404 }
      );
    }

    feedbackStore.delete(feedbackId);

    return NextResponse.json({
      success: true,
      message: 'Feedback item deleted',
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}
