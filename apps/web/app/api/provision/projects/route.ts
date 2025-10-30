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
    const { userId, projectName, organizationId, region } = await request.json();
    
    if (!userId || !projectName || !organizationId) {
      return NextResponse.json({ 
        error: 'userId, projectName, and organizationId required' 
      }, { status: 400 });
    }

    // Get management client from vault
    const mgmtClient = await SupabaseMgmtClient.fromVault(userId);
    if (!mgmtClient) {
      return NextResponse.json({ 
        error: 'No access token found. Please authenticate first.' 
      }, { status: 401 });
    }

    console.log(`[PROVISION] Creating project: ${projectName} for user: ${userId.substring(0, 8)}***`);

    // Create the project
    const project = await mgmtClient.createProject({
      name: projectName,
      organization_id: organizationId,
      region: region || 'us-east-1'
    });

    // Store project reference in vault for this user
    await vault.store(`project_ref_${userId}`, project.ref);

    // Log the project creation event
    await supabase.from('runner_events').insert({
      actor: 'user',
      action: 'project_created',
      payload: { 
        user_id: userId,
        project_ref: project.ref,
        project_name: projectName,
        organization_id: vault.maskValue(organizationId),
        region: region || 'us-east-1',
        timestamp: new Date().toISOString()
      }
    });

    console.log(`[PROVISION] Project created successfully: ${project.ref}`);

    // Wait for project to be ready
    try {
      await mgmtClient.waitForProjectReady(project.ref, 180000); // 3 minutes max
    } catch (waitError) {
      console.warn(`[PROVISION] Project ${project.ref} may not be fully ready yet:`, waitError);
      // Continue anyway - project might still be usable
    }

    return NextResponse.json({ 
      success: true,
      project: {
        ref: project.ref,
        name: project.name,
        status: project.status,
        region: project.region,
        created_at: project.created_at
      }
    });

  } catch (error) {
    console.error('[PROVISION] Project creation error:', error);
    
    // Log the error event
    try {
      await supabase.from('runner_events').insert({
        actor: 'system',
        action: 'project_creation_failed',
        payload: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error('[PROVISION] Failed to log error event:', logError);
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Project creation failed' 
    }, { status: 500 });
  }
}
