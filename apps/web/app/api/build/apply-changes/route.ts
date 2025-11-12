/**
 * Apply Code Changes API
 * Applies approved code changes from chat to project files
 */

import { NextRequest, NextResponse } from 'next/server';
import { CodeChangeApplicator } from '@/lib/code-change-applicator';
import type { CodeChange } from '@/lib/code-change-parser';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { buildId, changes, projectPath } = await request.json();

    if (!buildId || !changes || !Array.isArray(changes)) {
      return NextResponse.json(
        { error: 'buildId and changes array are required' },
        { status: 400 }
      );
    }

    // Determine project path
    const resolvedProjectPath = projectPath ||
      path.join(process.env.HOME || '~', 'Projects', buildId);

    // Create applicator
    const applicator = new CodeChangeApplicator(resolvedProjectPath);

    // Apply all changes
    await applicator.applyChanges(changes as CodeChange[]);

    return NextResponse.json({
      success: true,
      message: `Applied ${changes.length} change(s)`,
      changesApplied: changes.length
    });

  } catch (error) {
    console.error('Apply changes error:', error);
    return NextResponse.json(
      {
        error: 'Failed to apply changes',
        details: String(error)
      },
      { status: 500 }
    );
  }
}
