import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For now, just return success - in production this would sync with Supabase
    console.log('Brainstorm state sync:', {
      sessionId: body.sessionId,
      suggestionsCount: body.suggestions?.length || 0,
      lastUpdated: body.lastUpdated,
    });
    
    return NextResponse.json({
      success: true,
      synced_at: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error syncing brainstorm state:', error);
    return NextResponse.json(
      { error: 'Failed to sync state' },
      { status: 500 }
    );
  }
}
