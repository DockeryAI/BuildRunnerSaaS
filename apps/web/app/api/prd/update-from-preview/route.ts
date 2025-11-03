import { NextRequest, NextResponse } from 'next/server';
import { PRDUpdater, PRDFeature } from '@/lib/prd-updater';
import { AISuggestionsGenerator } from '@/lib/ai-suggestions';
import type { FeedbackItem } from '@/app/api/build/feedback/route';

const prdUpdater = new PRDUpdater();
const aiGenerator = new AISuggestionsGenerator();

// In-memory storage for PRD suggestions (in production, use database)
const suggestionsStore = new Map<string, PRDFeature[]>();

/**
 * Add feature to PRD from preview feedback
 * POST /api/prd/update-from-preview
 * Body: { projectId, buildId, feature: PRDFeature }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, buildId, feature, feedbackId } = body;

    if (!projectId || !feature) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, feature' },
        { status: 400 }
      );
    }

    // Validate feature structure
    if (!feature.title || !feature.description || !feature.type) {
      return NextResponse.json(
        { error: 'Invalid feature: missing title, description, or type' },
        { status: 400 }
      );
    }

    // Add feature to PRD
    const result = await prdUpdater.addFeatureToPRD(projectId, feature);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to add feature to PRD' },
        { status: 500 }
      );
    }

    // If from feedback, remove from suggestions
    if (feedbackId) {
      const key = `${projectId}:${buildId}`;
      const suggestions = suggestionsStore.get(key) || [];
      const filtered = suggestions.filter(s =>
        !(s.title === feature.title && s.description === feature.description)
      );
      suggestionsStore.set(key, filtered);
    }

    return NextResponse.json({
      success: true,
      feature,
      updatedPRD: result.updatedPRD,
      message: 'Feature added to PRD successfully',
    });
  } catch (error) {
    console.error('Error adding feature to PRD:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add feature to PRD' },
      { status: 500 }
    );
  }
}

/**
 * Get PRD suggestions based on feedback and AI analysis
 * GET /api/prd/update-from-preview?projectId=X&buildId=Y
 */
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    const buildId = request.nextUrl.searchParams.get('buildId');
    const refresh = request.nextUrl.searchParams.get('refresh') === 'true';

    if (!projectId || !buildId) {
      return NextResponse.json(
        { error: 'Missing projectId or buildId parameter' },
        { status: 400 }
      );
    }

    const key = `${projectId}:${buildId}`;

    // Return cached suggestions if available and not refreshing
    if (!refresh && suggestionsStore.has(key)) {
      const suggestions = suggestionsStore.get(key) || [];
      return NextResponse.json({
        success: true,
        suggestions,
        cached: true,
      });
    }

    // Generate new suggestions
    // In a real implementation, this would:
    // 1. Fetch current PRD from database
    // 2. Fetch implemented features from build
    // 3. Fetch user feedback items
    // 4. Use AI to analyze and generate suggestions

    // For now, return empty array (will be populated by AI generator)
    const suggestions: PRDFeature[] = [];
    suggestionsStore.set(key, suggestions);

    return NextResponse.json({
      success: true,
      suggestions,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching PRD suggestions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

/**
 * Generate AI suggestions for PRD improvements
 * POST /api/prd/update-from-preview/generate
 * Body: { projectId, buildId, feedback: FeedbackItem[], implementedFeatures?: string[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, buildId, feedback, implementedFeatures = [] } = body;

    if (!projectId || !buildId) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, buildId' },
        { status: 400 }
      );
    }

    const key = `${projectId}:${buildId}`;

    // Use AI generator to create intelligent suggestions
    const suggestions = await aiGenerator.generateSuggestions({
      projectId,
      buildId,
      feedback: feedback || [],
      implementedFeatures,
    });

    // Store suggestions
    suggestionsStore.set(key, suggestions);

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

/**
 * Delete/dismiss a suggestion
 * DELETE /api/prd/update-from-preview?projectId=X&buildId=Y&suggestionId=Z
 */
export async function DELETE(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    const buildId = request.nextUrl.searchParams.get('buildId');
    const suggestionTitle = request.nextUrl.searchParams.get('suggestionTitle');

    if (!projectId || !buildId || !suggestionTitle) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const key = `${projectId}:${buildId}`;
    const suggestions = suggestionsStore.get(key) || [];
    const filtered = suggestions.filter(s => s.title !== suggestionTitle);
    suggestionsStore.set(key, filtered);

    return NextResponse.json({
      success: true,
      message: 'Suggestion dismissed',
    });
  } catch (error) {
    console.error('Error dismissing suggestion:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to dismiss suggestion' },
      { status: 500 }
    );
  }
}
