import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, check_drift } = body;

    console.log(`[SPEC_DIFF] Checking drift for project: ${project_id}`);

    // Mock drift data for demonstration
    // In production, this would call the actual spec-diff Edge Function
    const mockDriftData = {
      status: 'drift',
      message: 'Drift detected in 2 microsteps',
      drift_items: [
        {
          microstep_id: 'p4.s1.ms2',
          confidence: 0.9,
          type: 'implementation_mismatch',
          description: 'Auth implementation differs from planned approach',
          commit_hash: 'abc123',
          files_changed: ['apps/web/lib/auth.tsx'],
        },
        {
          microstep_id: 'p4.s2.ms1',
          confidence: 0.7,
          type: 'scope_expansion',
          description: 'Additional UI components added beyond scope',
          commit_hash: 'def456',
          files_changed: ['apps/web/components/ui/badge.tsx'],
        },
      ],
      last_checked: new Date().toISOString(),
    };

    return NextResponse.json(mockDriftData);

  } catch (error) {
    console.error('[SPEC_DIFF] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Spec diff failed' },
      { status: 500 }
    );
  }
}
