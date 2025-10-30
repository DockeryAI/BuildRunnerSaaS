import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // For now, we'll use a Personal Access Token approach instead of OAuth
    // since Supabase Management API OAuth is complex for this demo
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings/backend?step=token`;
    
    // Log the auth start event
    await supabase.from('runner_events').insert({
      actor: 'user',
      action: 'oauth_start',
      payload: { user_id: userId, timestamp: new Date().toISOString() }
    });

    console.log(`[PROVISION] OAuth start for user: ${userId.substring(0, 8)}***`);

    return NextResponse.json({ 
      redirect_url: redirectUrl,
      message: 'Please provide your Supabase Personal Access Token'
    });

  } catch (error) {
    console.error('[PROVISION] OAuth start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
