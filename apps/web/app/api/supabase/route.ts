/**
 * Supabase Management API Routes
 *
 * Handles Supabase project creation and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseManagementAPI } from '@/lib/supabase/management-api';
import type {
  CreateSupabaseProjectRequest,
  ExecuteSQLRequest,
  DatabaseTable,
} from '@/lib/project-config/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create_project':
        return await handleCreateProject(body);
      case 'get_project':
        return await handleGetProject(body);
      case 'execute_sql':
        return await handleExecuteSQL(body);
      case 'create_table':
        return await handleCreateTable(body);
      case 'create_tables':
        return await handleCreateTables(body);
      case 'list_organizations':
        return await handleListOrganizations();
      case 'list_projects':
        return await handleListProjects(body);
      case 'pause_project':
        return await handlePauseProject(body);
      case 'resume_project':
        return await handleResumeProject(body);
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Supabase API error:', error);
    return NextResponse.json(
      { error: error.message || 'Supabase operation failed' },
      { status: 500 }
    );
  }
}

/**
 * Create a new Supabase project
 */
async function handleCreateProject(body: any) {
  const request: CreateSupabaseProjectRequest = {
    projectName: body.projectName,
    organizationId: body.organizationId,
    region: body.region,
    dbPassword: body.dbPassword,
    plan: body.plan,
  };

  if (!request.projectName || !request.organizationId || !request.dbPassword) {
    return NextResponse.json(
      { error: 'projectName, organizationId, and dbPassword are required' },
      { status: 400 }
    );
  }

  console.log(`🚀 Creating Supabase project: ${request.projectName}`);

  const config = await supabaseManagementAPI.createProject(request);

  return NextResponse.json({
    success: true,
    config,
  });
}

/**
 * Get project configuration
 */
async function handleGetProject(body: any) {
  const { projectRef } = body;

  if (!projectRef) {
    return NextResponse.json(
      { error: 'projectRef is required' },
      { status: 400 }
    );
  }

  const config = await supabaseManagementAPI.getProjectConfig(projectRef);

  return NextResponse.json({
    success: true,
    config,
  });
}

/**
 * Execute SQL
 */
async function handleExecuteSQL(body: any) {
  const request: ExecuteSQLRequest = {
    projectRef: body.projectRef,
    sql: body.sql,
  };

  if (!request.projectRef || !request.sql) {
    return NextResponse.json(
      { error: 'projectRef and sql are required' },
      { status: 400 }
    );
  }

  const result = await supabaseManagementAPI.executeSQL(request);

  return NextResponse.json(result);
}

/**
 * Create a single table
 */
async function handleCreateTable(body: any) {
  const { projectRef, table } = body;

  if (!projectRef || !table) {
    return NextResponse.json(
      { error: 'projectRef and table are required' },
      { status: 400 }
    );
  }

  const result = await supabaseManagementAPI.createTable(
    projectRef,
    table as DatabaseTable
  );

  return NextResponse.json(result);
}

/**
 * Create multiple tables
 */
async function handleCreateTables(body: any) {
  const { projectRef, tables } = body;

  if (!projectRef || !tables || !Array.isArray(tables)) {
    return NextResponse.json(
      { error: 'projectRef and tables array are required' },
      { status: 400 }
    );
  }

  const results = await supabaseManagementAPI.createTables(
    projectRef,
    tables as DatabaseTable[]
  );

  return NextResponse.json({
    success: true,
    results,
  });
}

/**
 * List all organizations
 */
async function handleListOrganizations() {
  try {
    const organizations = await supabaseManagementAPI.listOrganizations();

    return NextResponse.json({
      success: true,
      organizations,
    });
  } catch (error: any) {
    // If SUPABASE_ACCESS_TOKEN is not configured, return empty list instead of error
    if (error.message?.includes('SUPABASE_ACCESS_TOKEN')) {
      return NextResponse.json({
        success: false,
        organizations: [],
        configured: false,
        message: 'Supabase Management API not configured. Add SUPABASE_ACCESS_TOKEN to use automatic Supabase project creation.',
      });
    }
    throw error;
  }
}

/**
 * List projects in an organization
 */
async function handleListProjects(body: any) {
  const { organizationId } = body;

  if (!organizationId) {
    return NextResponse.json(
      { error: 'organizationId is required' },
      { status: 400 }
    );
  }

  const projects = await supabaseManagementAPI.listProjects(organizationId);

  return NextResponse.json({
    success: true,
    projects,
  });
}

/**
 * Pause a project
 */
async function handlePauseProject(body: any) {
  const { projectRef } = body;

  if (!projectRef) {
    return NextResponse.json(
      { error: 'projectRef is required' },
      { status: 400 }
    );
  }

  await supabaseManagementAPI.pauseProject(projectRef);

  return NextResponse.json({
    success: true,
    message: 'Project paused successfully',
  });
}

/**
 * Resume a project
 */
async function handleResumeProject(body: any) {
  const { projectRef } = body;

  if (!projectRef) {
    return NextResponse.json(
      { error: 'projectRef is required' },
      { status: 400 }
    );
  }

  await supabaseManagementAPI.resumeProject(projectRef);

  return NextResponse.json({
    success: true,
    message: 'Project resumed successfully',
  });
}
