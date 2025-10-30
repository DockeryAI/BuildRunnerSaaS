import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { vault } from '../../../../server/lib/vault.js';
import fs from 'fs-extra';
import path from 'path';

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

    console.log(`[PROVISION] Setting up local environment for project: ${projectRef}`);

    // Retrieve keys from vault
    const anonKey = await vault.retrieve(`supabase_anon_${userId}_${projectRef}`);
    if (!anonKey) {
      return NextResponse.json({ 
        error: 'API keys not found. Please fetch keys first.' 
      }, { status: 404 });
    }

    const projectUrl = `https://${projectRef}.supabase.co`;

    // Update/create .env file (only URL and ANON key for local dev)
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (await fs.pathExists(envPath)) {
      envContent = await fs.readFile(envPath, 'utf8');
    }

    // Update or add Supabase environment variables
    const envLines = envContent.split('\n');
    const updatedLines: string[] = [];
    let urlUpdated = false;
    let anonUpdated = false;
    let refUpdated = false;

    for (const line of envLines) {
      if (line.startsWith('SUPABASE_URL=')) {
        updatedLines.push(`SUPABASE_URL=${projectUrl}`);
        urlUpdated = true;
      } else if (line.startsWith('SUPABASE_ANON_KEY=')) {
        updatedLines.push(`SUPABASE_ANON_KEY=${anonKey}`);
        anonUpdated = true;
      } else if (line.startsWith('SUPABASE_PROJECT_REF=')) {
        updatedLines.push(`SUPABASE_PROJECT_REF=${projectRef}`);
        refUpdated = true;
      } else {
        updatedLines.push(line);
      }
    }

    // Add missing environment variables
    if (!urlUpdated) {
      updatedLines.push(`SUPABASE_URL=${projectUrl}`);
    }
    if (!anonUpdated) {
      updatedLines.push(`SUPABASE_ANON_KEY=${anonKey}`);
    }
    if (!refUpdated) {
      updatedLines.push(`SUPABASE_PROJECT_REF=${projectRef}`);
    }

    // Write updated .env file
    await fs.writeFile(envPath, updatedLines.join('\n'));

    console.log(`[PROVISION] Updated .env with URL: ${projectUrl}, ANON: ${vault.maskValue(anonKey)}`);

    // Update runner_state.json timestamps
    const statePath = path.join(process.cwd(), 'buildrunner/state/runner_state.json');
    if (await fs.pathExists(statePath)) {
      const state = await fs.readJSON(statePath);
      const now = new Date().toISOString();
      
      state.sync = {
        ...state.sync,
        lastLocalUpdate: now,
        lastRemoteUpdate: now,
        projectRef: projectRef
      };
      
      await fs.writeJSON(statePath, state, { spaces: 2 });
      console.log(`[PROVISION] Updated runner_state.json timestamps`);
    }

    // Log the setup completion event
    await supabase.from('runner_events').insert({
      actor: 'system',
      action: 'local_setup_completed',
      payload: { 
        user_id: userId,
        project_ref: projectRef,
        env_updated: true,
        state_updated: await fs.pathExists(statePath),
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Local environment configured successfully',
      env_updated: true,
      project: {
        ref: projectRef,
        url: projectUrl
      }
    });

  } catch (error) {
    console.error('[PROVISION] Local setup error:', error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Local setup failed' 
    }, { status: 500 });
  }
}
