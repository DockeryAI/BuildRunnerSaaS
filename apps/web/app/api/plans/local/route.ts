import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import { BuildSpecSchema } from '../../../../lib/types';

const PLAN_PATH = path.join(process.cwd(), 'buildrunner/specs/plan.json');
const STATE_PATH = path.join(process.cwd(), 'buildrunner/state/runner_state.json');

export async function GET() {
  try {
    if (!await fs.pathExists(PLAN_PATH)) {
      return NextResponse.json(null);
    }

    const planData = await fs.readJSON(PLAN_PATH);
    const validatedPlan = BuildSpecSchema.parse(planData);
    
    return NextResponse.json(validatedPlan);
  } catch (error) {
    console.error('[LOCAL_PLAN] Load error:', error);
    return NextResponse.json(
      { error: 'Failed to load local plan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const plan = BuildSpecSchema.parse(body);

    // Ensure directories exist
    await fs.ensureDir(path.dirname(PLAN_PATH));
    await fs.ensureDir(path.dirname(STATE_PATH));

    // Write plan.json
    await fs.writeJSON(PLAN_PATH, plan, { spaces: 2 });

    // Update runner_state.json
    let state: any = {};
    if (await fs.pathExists(STATE_PATH)) {
      state = await fs.readJSON(STATE_PATH);
    }

    state = {
      ...state,
      projectId: plan.projectId,
      title: plan.title,
      version: plan.version,
      updatedAt: plan.updatedAt,
      phase: 4,
      step: 'create',
      sync: {
        ...state.sync,
        lastLocalUpdate: new Date().toISOString(),
      },
      milestones: plan.milestones,
    };

    await fs.writeJSON(STATE_PATH, state, { spaces: 2 });

    console.log(`[LOCAL_PLAN] Saved plan v${plan.version} with ${plan.milestones.length} milestones`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[LOCAL_PLAN] Save error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save plan' },
      { status: 500 }
    );
  }
}
