import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { vault } from '../../../../../server/lib/vault.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, accessToken } = await request.json();
    
    if (!userId || !accessToken) {
      return NextResponse.json({ error: 'userId and accessToken required' }, { status: 400 });
    }

    // Validate the token by making a test request
    const testResponse = await fetch('https://api.supabase.com/v1/organizations', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!testResponse.ok) {
      return NextResponse.json({ error: 'Invalid access token' }, { status: 401 });
    }

    // Store encrypted token in vault
    await vault.store(`supabase_token_${userId}`, accessToken);

    // Log the successful OAuth completion
    await supabase.from('runner_events').insert({
      actor: 'user',
      action: 'oauth_linked',
      payload: { 
        user_id: userId, 
        token_masked: vault.maskValue(accessToken),
        timestamp: new Date().toISOString() 
      }
    });

    console.log(`[PROVISION] OAuth completed for user: ${userId.substring(0, 8)}***, token: ${vault.maskValue(accessToken)}`);

    return NextResponse.json({ 
      success: true,
      message: 'Access token stored securely'
    });

  } catch (error) {
    console.error('[PROVISION] OAuth callback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
