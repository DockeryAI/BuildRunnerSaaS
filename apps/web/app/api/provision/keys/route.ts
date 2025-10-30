import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SupabaseMgmtClient } from '../../../../server/lib/supabaseMgmt.js';
import { vault } from '../../../../server/lib/vault.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, projectRef } = await request.json();
    
    if (!userId || !projectRef) {
      return NextResponse.json({ 
        error: 'userId and projectRef required' 
      }, { status: 400 });
    }

    // Get management client from vault
    const mgmtClient = await SupabaseMgmtClient.fromVault(userId);
    if (!mgmtClient) {
      return NextResponse.json({ 
        error: 'No access token found. Please authenticate first.' 
      }, { status: 401 });
    }

    console.log(`[PROVISION] Fetching API keys for project: ${projectRef}`);

    // Fetch API keys from Supabase Management API
    const keys = await mgmtClient.getApiKeys(projectRef);

    // Store keys securely in vault (server-side only)
    await vault.store(`supabase_anon_${userId}_${projectRef}`, keys.anon);
    await vault.store(`supabase_service_${userId}_${projectRef}`, keys.service_role);

    // Construct the project URL
    const projectUrl = `https://${projectRef}.supabase.co`;

    // Log the keys fetch event
    await supabase.from('runner_events').insert({
      actor: 'user',
      action: 'keys_fetched',
      payload: { 
        user_id: userId,
        project_ref: projectRef,
        anon_key_masked: vault.maskValue(keys.anon),
        service_key_masked: vault.maskValue(keys.service_role),
        timestamp: new Date().toISOString()
      }
    });

    console.log(`[PROVISION] Keys stored securely for project: ${projectRef}`);

    // Return only masked/publishable info to client
    return NextResponse.json({ 
      success: true,
      project: {
        ref: projectRef,
        url: projectUrl,
        anon_key_masked: vault.maskValue(keys.anon),
        service_key_masked: vault.maskValue(keys.service_role)
      },
      // Only return anon key and URL for client-side use
      publishable: {
        url: projectUrl,
        anon_key: keys.anon // This is safe to expose to client
      }
    });

  } catch (error) {
    console.error('[PROVISION] Keys fetch error:', error);
    
    // Log the error event
    try {
      await supabase.from('runner_events').insert({
        actor: 'system',
        action: 'keys_fetch_failed',
        payload: { 
          project_ref: request.json().then(body => body.projectRef).catch(() => 'unknown'),
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error('[PROVISION] Failed to log error event:', logError);
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Keys fetch failed' 
    }, { status: 500 });
  }
}
