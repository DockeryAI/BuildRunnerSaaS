import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

    console.log(`[PROVISION] Running health checks for project: ${projectRef}`);

    // Get keys from vault
    const anonKey = await vault.retrieve(`supabase_anon_${userId}_${projectRef}`);
    const serviceKey = await vault.retrieve(`supabase_service_${userId}_${projectRef}`);
    
    if (!anonKey || !serviceKey) {
      return NextResponse.json({ 
        error: 'API keys not found. Please provision the project first.' 
      }, { status: 404 });
    }

    const projectUrl = `https://${projectRef}.supabase.co`;
    const projectSupabase = createClient(projectUrl, serviceKey);

    const healthChecks = [];

    // 1. Test REST API connection
    try {
      const { data, error } = await projectSupabase
        .from('projects')
        .select('count')
        .limit(1);
      
      healthChecks.push({
        name: 'REST API Connection',
        status: error ? 'error' : 'success',
        message: error ? error.message : 'REST API is accessible',
        details: { endpoint: `${projectUrl}/rest/v1` }
      });
    } catch (error) {
      healthChecks.push({
        name: 'REST API Connection',
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
        details: { endpoint: `${projectUrl}/rest/v1` }
      });
    }

    // 2. Test database function (gen_random_uuid)
    try {
      const { data, error } = await projectSupabase.rpc('gen_random_uuid');
      
      healthChecks.push({
        name: 'Database Functions',
        status: error ? 'error' : 'success',
        message: error ? error.message : 'Database functions working',
        details: { function: 'gen_random_uuid', result: data ? 'UUID generated' : 'No result' }
      });
    } catch (error) {
      healthChecks.push({
        name: 'Database Functions',
        status: 'error',
        message: error instanceof Error ? error.message : 'Function test failed',
        details: { function: 'gen_random_uuid' }
      });
    }

    // 3. Test spec-diff function
    try {
      const response = await fetch(`${projectUrl}/functions/v1/spec-diff?project_id=health-check`, {
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
        },
      });
      
      healthChecks.push({
        name: 'spec-diff Function',
        status: response.ok || response.status === 400 ? 'success' : 'error',
        message: response.ok || response.status === 400 ? 'Function is accessible' : `HTTP ${response.status}`,
        details: { 
          endpoint: `${projectUrl}/functions/v1/spec-diff`,
          status: response.status
        }
      });
    } catch (error) {
      healthChecks.push({
        name: 'spec-diff Function',
        status: 'warning',
        message: 'Function may not be deployed yet',
        details: { endpoint: `${projectUrl}/functions/v1/spec-diff` }
      });
    }

    // 4. Test spec-sync function
    try {
      const response = await fetch(`${projectUrl}/functions/v1/spec-sync`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
        },
      });
      
      healthChecks.push({
        name: 'spec-sync Function',
        status: response.ok ? 'success' : 'warning',
        message: response.ok ? 'Function is accessible' : 'Function may not be deployed yet',
        details: { 
          endpoint: `${projectUrl}/functions/v1/spec-sync`,
          status: response.status
        }
      });
    } catch (error) {
      healthChecks.push({
        name: 'spec-sync Function',
        status: 'warning',
        message: 'Function may not be deployed yet',
        details: { endpoint: `${projectUrl}/functions/v1/spec-sync` }
      });
    }

    // Calculate overall health
    const errorCount = healthChecks.filter(check => check.status === 'error').length;
    const warningCount = healthChecks.filter(check => check.status === 'warning').length;
    
    let overallStatus = 'success';
    if (errorCount > 0) {
      overallStatus = 'error';
    } else if (warningCount > 0) {
      overallStatus = 'warning';
    }

    // Log the health check event
    await supabase.from('runner_events').insert({
      actor: 'system',
      action: 'health_check_completed',
      payload: { 
        user_id: userId,
        project_ref: projectRef,
        overall_status: overallStatus,
        checks_count: healthChecks.length,
        errors: errorCount,
        warnings: warningCount,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({ 
      success: true,
      overall_status: overallStatus,
      project_ref: projectRef,
      project_url: projectUrl,
      health_checks: healthChecks,
      summary: {
        total: healthChecks.length,
        success: healthChecks.filter(c => c.status === 'success').length,
        warnings: warningCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('[PROVISION] Health check error:', error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Health check failed' 
    }, { status: 500 });
  }
}
