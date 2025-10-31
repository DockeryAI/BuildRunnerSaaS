import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '../../../lib/auth/roles';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      provider,
      project_id,
      entity_type,
      entity_id,
      title,
      description,
      priority = 'normal',
      assignee,
    } = body;

    // Validate required fields
    if (!provider || !project_id || !entity_type || !entity_id || !title) {
      return NextResponse.json({
        error: 'Missing required fields: provider, project_id, entity_type, entity_id, title',
      }, { status: 400 });
    }

    // Validate provider
    const validProviders = ['jira', 'linear', 'github', 'asana'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json({
        error: `Invalid provider. Must be one of: ${validProviders.join(', ')}`,
      }, { status: 400 });
    }

    // Validate entity type
    const validEntityTypes = ['milestone', 'step', 'microstep', 'comment'];
    if (!validEntityTypes.includes(entity_type)) {
      return NextResponse.json({
        error: `Invalid entity_type. Must be one of: ${validEntityTypes.join(', ')}`,
      }, { status: 400 });
    }

    // Check permission to create issues
    const permissionCheck = await requirePermission(request, project_id, 'canEditProject');
    if (!permissionCheck.authorized) {
      return NextResponse.json({
        error: permissionCheck.error,
      }, { status: 403 });
    }

    const userId = permissionCheck.userContext!.userId;

    // Generate external ID and key (stub implementation)
    const externalId = generateExternalId(provider);
    const externalKey = generateExternalKey(provider, externalId);

    // Create external issue mapping
    const { data: externalIssue, error } = await supabase
      .from('external_issues')
      .insert([{
        provider,
        external_id: externalId,
        external_key: externalKey,
        entity_type,
        entity_id,
        project_id,
        title,
        status: 'open',
        priority,
        assignee,
        link: generateExternalLink(provider, externalKey),
        sync_status: 'pending',
        metadata: {
          description,
          created_by: userId,
          stub_created: true, // Mark as stub until real integration
        },
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // In Phase 13, this would actually create the issue in the external system
    // For now, we simulate the creation
    const creationResult = await simulateExternalIssueCreation(provider, {
      title,
      description,
      priority,
      assignee,
    });

    if (creationResult.success) {
      // Update with "real" external ID if simulation succeeded
      await supabase
        .from('external_issues')
        .update({
          external_id: creationResult.externalId || externalId,
          external_key: creationResult.externalKey || externalKey,
          link: creationResult.link || generateExternalLink(provider, externalKey),
          sync_status: 'synced',
          last_sync_at: new Date().toISOString(),
        })
        .eq('id', externalIssue.id);
    }

    // Log audit event
    await supabase
      .from('runner_events')
      .insert([{
        actor: userId,
        action: 'external_issue_stubbed',
        payload: {
          issue_id: externalIssue.id,
          provider,
          external_id: externalId,
          external_key: externalKey,
          project_id,
          entity_type,
          entity_id,
          title,
        },
        metadata: {
          creation_timestamp: new Date().toISOString(),
          is_stub: true,
          sync_status: creationResult.success ? 'synced' : 'pending',
        },
      }]);

    return NextResponse.json({
      success: true,
      external_issue: {
        id: externalIssue.id,
        provider,
        external_id: creationResult.externalId || externalId,
        external_key: creationResult.externalKey || externalKey,
        title,
        status: 'open',
        priority,
        link: creationResult.link || generateExternalLink(provider, externalKey),
        sync_status: creationResult.success ? 'synced' : 'pending',
      },
    }, { status: 201 });

  } catch (error) {
    console.error('[ISSUES_POST] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to create external issue',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');
    const provider = searchParams.get('provider');

    if (!projectId) {
      return NextResponse.json({
        error: 'project_id is required',
      }, { status: 400 });
    }

    // Check view permission
    const permissionCheck = await requirePermission(request, projectId, 'canViewProject');
    if (!permissionCheck.authorized) {
      return NextResponse.json({
        error: permissionCheck.error,
      }, { status: 403 });
    }

    // Build query
    let query = supabase
      .from('external_issues')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (entityType && entityId) {
      query = query.eq('entity_type', entityType).eq('entity_id', entityId);
    }

    if (provider) {
      query = query.eq('provider', provider);
    }

    const { data: issues, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      issues: issues || [],
    });

  } catch (error) {
    console.error('[ISSUES_GET] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch external issues',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Helper function to generate external ID
function generateExternalId(provider: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${provider}_${timestamp}_${random}`;
}

// Helper function to generate external key
function generateExternalKey(provider: string, externalId: string): string {
  switch (provider) {
    case 'jira':
      return `BR-${externalId.split('_')[1]}`;
    case 'linear':
      return `BR-${externalId.split('_')[1]}`;
    case 'github':
      return `#${externalId.split('_')[1]}`;
    case 'asana':
      return `TASK-${externalId.split('_')[1]}`;
    default:
      return externalId;
  }
}

// Helper function to generate external link
function generateExternalLink(provider: string, externalKey: string): string {
  switch (provider) {
    case 'jira':
      return `https://buildrunner.atlassian.net/browse/${externalKey}`;
    case 'linear':
      return `https://linear.app/buildrunner/issue/${externalKey}`;
    case 'github':
      return `https://github.com/buildrunner/project/issues/${externalKey.replace('#', '')}`;
    case 'asana':
      return `https://app.asana.com/0/project/task-${externalKey}`;
    default:
      return '#';
  }
}

// Helper function to simulate external issue creation
async function simulateExternalIssueCreation(
  provider: string,
  issueData: {
    title: string;
    description?: string;
    priority?: string;
    assignee?: string;
  }
): Promise<{
  success: boolean;
  externalId?: string;
  externalKey?: string;
  link?: string;
  error?: string;
}> {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate success/failure based on provider
    const successRate = 0.9; // 90% success rate for simulation
    const isSuccess = Math.random() < successRate;

    if (!isSuccess) {
      return {
        success: false,
        error: `Simulated ${provider} API error`,
      };
    }

    // Generate simulated response
    const simulatedId = `${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const simulatedKey = generateExternalKey(provider, simulatedId);
    const simulatedLink = generateExternalLink(provider, simulatedKey);

    console.log(`[SIMULATION] Created ${provider} issue:`, {
      id: simulatedId,
      key: simulatedKey,
      title: issueData.title,
      link: simulatedLink,
    });

    return {
      success: true,
      externalId: simulatedId,
      externalKey: simulatedKey,
      link: simulatedLink,
    };
  } catch (error) {
    console.error(`Failed to simulate ${provider} issue creation:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Simulation failed',
    };
  }
}
