import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import IntegrationRegistry from '../../../../../lib/integrations/registry';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
    };
    assignee?: {
      displayName: string;
    };
    priority?: {
      name: string;
    };
    labels: string[];
  };
}

interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  state: {
    name: string;
  };
  assignee?: {
    name: string;
  };
  priority: number;
  labels: Array<{ name: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integration_id');
    const dryRun = searchParams.get('dry_run') === 'true';
    const direction = searchParams.get('direction') || 'bidirectional';

    if (!integrationId) {
      return NextResponse.json({
        error: 'Integration ID is required',
      }, { status: 400 });
    }

    // Get integration configuration
    const integration = await IntegrationRegistry.getIntegration(integrationId);
    if (!integration) {
      return NextResponse.json({
        error: 'Integration not found',
      }, { status: 404 });
    }

    if (!integration.active) {
      return NextResponse.json({
        error: 'Integration is not active',
      }, { status: 400 });
    }

    // Start sync process
    const syncId = await recordSyncStart(integrationId, direction, dryRun);
    
    let result;
    try {
      switch (integration.provider) {
        case 'jira':
          result = await syncJiraIssues(integration, direction, dryRun);
          break;
        case 'linear':
          result = await syncLinearIssues(integration, direction, dryRun);
          break;
        default:
          throw new Error(`Unsupported provider: ${integration.provider}`);
      }

      // Record successful sync
      await recordSyncComplete(syncId, result);

      // Log audit event
      await supabase
        .from('runner_events')
        .insert([{
          actor: 'system',
          action: 'integration_sync_completed',
          payload: {
            integration_id: integrationId,
            provider: integration.provider,
            direction,
            dry_run: dryRun,
            items_processed: result.itemsProcessed,
            items_created: result.itemsCreated,
            items_updated: result.itemsUpdated,
          },
          metadata: {
            sync_id: syncId,
            timestamp: new Date().toISOString(),
          },
        }]);

      return NextResponse.json({
        success: true,
        sync_id: syncId,
        ...result,
      });

    } catch (error) {
      // Record failed sync
      await recordSyncError(syncId, error);
      throw error;
    }

  } catch (error) {
    console.error('[INTEGRATION_SYNC] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to sync issues',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Sync issues with Jira
 */
async function syncJiraIssues(integration: any, direction: string, dryRun: boolean) {
  const { baseUrl, email, apiToken, projectKey } = integration.config;
  
  // Mock Jira API call - in production this would use the actual Jira REST API
  const mockJiraIssues: JiraIssue[] = [
    {
      id: 'jira-1',
      key: 'PROJ-123',
      fields: {
        summary: 'Implement user authentication',
        description: 'Add OAuth2 authentication flow',
        status: { name: 'In Progress' },
        assignee: { displayName: 'John Doe' },
        priority: { name: 'High' },
        labels: ['backend', 'security'],
      },
    },
    {
      id: 'jira-2',
      key: 'PROJ-124',
      fields: {
        summary: 'Fix database connection issue',
        description: 'Resolve connection timeout errors',
        status: { name: 'Done' },
        assignee: { displayName: 'Jane Smith' },
        priority: { name: 'Critical' },
        labels: ['database', 'bug'],
      },
    },
  ];

  let itemsProcessed = 0;
  let itemsCreated = 0;
  let itemsUpdated = 0;

  for (const issue of mockJiraIssues) {
    itemsProcessed++;

    if (!dryRun) {
      // Check if issue link already exists
      const { data: existingLink } = await supabase
        .from('issue_links')
        .select('*')
        .eq('provider', 'jira')
        .eq('external_id', issue.id)
        .single();

      const issueData = {
        integration_id: integration.id,
        provider: 'jira',
        external_id: issue.id,
        external_key: issue.key,
        microstep_id: await findMatchingMicrostep(issue.fields.summary),
        project_id: integration.projectId,
        status: mapJiraStatus(issue.fields.status.name),
        summary: issue.fields.summary,
        description: issue.fields.description,
        assignee: issue.fields.assignee?.displayName,
        priority: issue.fields.priority?.name,
        labels: issue.fields.labels,
        url: `${baseUrl}/browse/${issue.key}`,
        last_synced_at: new Date().toISOString(),
      };

      if (existingLink) {
        // Update existing link
        await supabase
          .from('issue_links')
          .update(issueData)
          .eq('id', existingLink.id);
        itemsUpdated++;
      } else {
        // Create new link
        await supabase
          .from('issue_links')
          .insert([issueData]);
        itemsCreated++;
      }

      // Update microstep status if needed
      if (issueData.microstep_id && direction !== 'inbound') {
        await updateMicrostepStatus(issueData.microstep_id, issueData.status);
      }
    }
  }

  return {
    itemsProcessed,
    itemsCreated,
    itemsUpdated,
    itemsFailed: 0,
  };
}

/**
 * Sync issues with Linear
 */
async function syncLinearIssues(integration: any, direction: string, dryRun: boolean) {
  const { apiKey, teamId } = integration.config;
  
  // Mock Linear API call - in production this would use the Linear GraphQL API
  const mockLinearIssues: LinearIssue[] = [
    {
      id: 'linear-1',
      identifier: 'BR-1',
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing',
      state: { name: 'In Progress' },
      assignee: { name: 'Alice Johnson' },
      priority: 2,
      labels: [{ name: 'devops' }, { name: 'automation' }],
    },
    {
      id: 'linear-2',
      identifier: 'BR-2',
      title: 'Add error handling',
      description: 'Improve error handling in API endpoints',
      state: { name: 'Done' },
      assignee: { name: 'Bob Wilson' },
      priority: 1,
      labels: [{ name: 'backend' }, { name: 'improvement' }],
    },
  ];

  let itemsProcessed = 0;
  let itemsCreated = 0;
  let itemsUpdated = 0;

  for (const issue of mockLinearIssues) {
    itemsProcessed++;

    if (!dryRun) {
      // Check if issue link already exists
      const { data: existingLink } = await supabase
        .from('issue_links')
        .select('*')
        .eq('provider', 'linear')
        .eq('external_id', issue.id)
        .single();

      const issueData = {
        integration_id: integration.id,
        provider: 'linear',
        external_id: issue.id,
        external_key: issue.identifier,
        microstep_id: await findMatchingMicrostep(issue.title),
        project_id: integration.projectId,
        status: mapLinearStatus(issue.state.name),
        summary: issue.title,
        description: issue.description,
        assignee: issue.assignee?.name,
        priority: mapLinearPriority(issue.priority),
        labels: issue.labels.map(l => l.name),
        url: `https://linear.app/issue/${issue.identifier}`,
        last_synced_at: new Date().toISOString(),
      };

      if (existingLink) {
        // Update existing link
        await supabase
          .from('issue_links')
          .update(issueData)
          .eq('id', existingLink.id);
        itemsUpdated++;
      } else {
        // Create new link
        await supabase
          .from('issue_links')
          .insert([issueData]);
        itemsCreated++;
      }

      // Update microstep status if needed
      if (issueData.microstep_id && direction !== 'inbound') {
        await updateMicrostepStatus(issueData.microstep_id, issueData.status);
      }
    }
  }

  return {
    itemsProcessed,
    itemsCreated,
    itemsUpdated,
    itemsFailed: 0,
  };
}

/**
 * Find matching microstep based on issue summary
 */
async function findMatchingMicrostep(summary: string): Promise<string | null> {
  // Simple matching logic - in production this would be more sophisticated
  const keywords = summary.toLowerCase().split(' ');
  
  // Mock microstep matching
  if (keywords.includes('authentication') || keywords.includes('auth')) {
    return 'p13.s2.ms1';
  }
  if (keywords.includes('database') || keywords.includes('db')) {
    return 'p13.s2.ms2';
  }
  if (keywords.includes('ci/cd') || keywords.includes('pipeline')) {
    return 'p13.s3.ms1';
  }
  
  return null;
}

/**
 * Map Jira status to BuildRunner status
 */
function mapJiraStatus(jiraStatus: string): string {
  const statusMap: Record<string, string> = {
    'To Do': 'todo',
    'In Progress': 'doing',
    'Done': 'done',
    'Blocked': 'blocked',
  };
  
  return statusMap[jiraStatus] || 'todo';
}

/**
 * Map Linear status to BuildRunner status
 */
function mapLinearStatus(linearStatus: string): string {
  const statusMap: Record<string, string> = {
    'Backlog': 'todo',
    'Todo': 'todo',
    'In Progress': 'doing',
    'Done': 'done',
    'Canceled': 'blocked',
  };
  
  return statusMap[linearStatus] || 'todo';
}

/**
 * Map Linear priority to string
 */
function mapLinearPriority(priority: number): string {
  const priorityMap: Record<number, string> = {
    0: 'No priority',
    1: 'Urgent',
    2: 'High',
    3: 'Normal',
    4: 'Low',
  };
  
  return priorityMap[priority] || 'Normal';
}

/**
 * Update microstep status
 */
async function updateMicrostepStatus(microstepId: string, status: string): Promise<void> {
  // This would integrate with the spec-sync system to update microstep status
  console.log(`Would update microstep ${microstepId} to status ${status}`);
}

/**
 * Record sync start
 */
async function recordSyncStart(integrationId: string, direction: string, dryRun: boolean): Promise<string> {
  const { data, error } = await supabase
    .from('integration_sync_history')
    .insert([{
      integration_id: integrationId,
      sync_type: dryRun ? 'manual' : 'manual',
      direction,
      status: 'started',
      started_at: new Date().toISOString(),
    }])
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to record sync start: ${error.message}`);
  }

  return data.id;
}

/**
 * Record sync completion
 */
async function recordSyncComplete(syncId: string, result: any): Promise<void> {
  await supabase
    .from('integration_sync_history')
    .update({
      status: 'completed',
      items_processed: result.itemsProcessed,
      items_created: result.itemsCreated,
      items_updated: result.itemsUpdated,
      items_failed: result.itemsFailed,
      completed_at: new Date().toISOString(),
    })
    .eq('id', syncId);
}

/**
 * Record sync error
 */
async function recordSyncError(syncId: string, error: any): Promise<void> {
  await supabase
    .from('integration_sync_history')
    .update({
      status: 'failed',
      error_details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      completed_at: new Date().toISOString(),
    })
    .eq('id', syncId);
}
