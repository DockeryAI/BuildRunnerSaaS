import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { AutoFixAgent } from '@/lib/autofix-agent';

interface AutoFixJob {
  id: string;
  feedbackId: string;
  status: 'analyzing' | 'generating' | 'ready' | 'applied' | 'failed';
  plan?: any;
  changes?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage for auto-fix jobs
const jobStore = new Map<string, AutoFixJob>();

/**
 * Trigger AI fix for a feedback item
 * POST /api/build/autofix
 * Body: { feedbackId, projectId, buildId, feedback }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedbackId, projectId, buildId, feedback } = body;

    if (!feedbackId || !projectId || !buildId || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const jobId = `fix-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();

    const job: AutoFixJob = {
      id: jobId,
      feedbackId,
      status: 'analyzing',
      createdAt: now,
      updatedAt: now,
    };

    jobStore.set(jobId, job);

    // Start the fix process in the background
    processAutoFix(jobId, projectId, buildId, feedback).catch((error) => {
      console.error(`[AutoFix] Job ${jobId} failed:`, error);
      const failedJob = jobStore.get(jobId);
      if (failedJob) {
        failedJob.status = 'failed';
        failedJob.error = error instanceof Error ? error.message : 'Unknown error';
        failedJob.updatedAt = new Date().toISOString();
        jobStore.set(jobId, failedJob);
      }
    });

    return NextResponse.json({
      success: true,
      jobId,
      status: 'analyzing',
    });
  } catch (error) {
    console.error('Error starting auto-fix:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start auto-fix' },
      { status: 500 }
    );
  }
}

/**
 * Get auto-fix job status
 * GET /api/build/autofix?jobId=X
 */
export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing jobId parameter' },
        { status: 400 }
      );
    }

    const job = jobStore.get(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}

/**
 * Approve or reject auto-fix changes
 * PATCH /api/build/autofix
 * Body: { jobId, action: 'approve' | 'reject', projectId, buildId }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, action, projectId, buildId } = body;

    if (!jobId || !action || !projectId || !buildId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const job = jobStore.get(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'ready') {
      return NextResponse.json(
        { error: 'Job is not ready for approval' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Apply the changes
      const buildDir = path.join(process.cwd(), 'builds', projectId, buildId);
      const agent = new AutoFixAgent(buildDir);

      if (!job.changes) {
        return NextResponse.json(
          { error: 'No changes to apply' },
          { status: 400 }
        );
      }

      await agent.applyChanges(job.changes);

      job.status = 'applied';
      job.updatedAt = new Date().toISOString();
      jobStore.set(jobId, job);

      return NextResponse.json({
        success: true,
        message: 'Changes applied successfully',
        job,
      });
    } else if (action === 'reject') {
      // Mark as failed and allow retry
      job.status = 'failed';
      job.error = 'Changes rejected by user';
      job.updatedAt = new Date().toISOString();
      jobStore.set(jobId, job);

      return NextResponse.json({
        success: true,
        message: 'Changes rejected',
        job,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process approval' },
      { status: 500 }
    );
  }
}

// Background processing function
async function processAutoFix(
  jobId: string,
  projectId: string,
  buildId: string,
  feedback: any
) {
  const buildDir = path.join(process.cwd(), 'builds', projectId, buildId);

  // Check if build directory exists
  if (!fs.existsSync(buildDir)) {
    throw new Error('Build directory not found');
  }

  const agent = new AutoFixAgent(buildDir);

  // Step 1: Analyze feedback
  console.log(`[AutoFix] ${jobId}: Analyzing feedback...`);
  const plan = await agent.analyzeFeedback(feedback);

  const job = jobStore.get(jobId);
  if (job) {
    job.status = 'generating';
    job.plan = plan;
    job.updatedAt = new Date().toISOString();
    jobStore.set(jobId, job);
  }

  // Step 2: Generate fix
  console.log(`[AutoFix] ${jobId}: Generating fix...`);
  const changes = await agent.generateFix(feedback, plan);

  // Step 3: Validate
  console.log(`[AutoFix] ${jobId}: Validating changes...`);
  const validation = await agent.validate();

  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Step 4: Mark as ready for review
  const finalJob = jobStore.get(jobId);
  if (finalJob) {
    finalJob.status = 'ready';
    finalJob.changes = changes;
    finalJob.updatedAt = new Date().toISOString();
    jobStore.set(jobId, finalJob);
  }

  console.log(`[AutoFix] ${jobId}: Ready for review`);
}
