import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    // Validate webhook signature
    if (!validateSignature(body, signature)) {
      return NextResponse.json({
        error: 'Invalid signature',
      }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const { webhookEvent, issue, user } = payload;

    // Process different webhook events
    switch (webhookEvent) {
      case 'jira:issue_updated':
        await handleIssueUpdated(issue, user);
        break;
      case 'jira:issue_created':
        await handleIssueCreated(issue, user);
        break;
      case 'jira:issue_deleted':
        await handleIssueDeleted(issue, user);
        break;
      default:
        console.log(`Unhandled Jira webhook event: ${webhookEvent}`);
    }

    // Log webhook event
    await supabase
      .from('runner_events')
      .insert([{
        actor: user?.displayName || 'jira-webhook',
        action: 'jira_webhook_received',
        payload: {
          webhook_event: webhookEvent,
          issue_key: issue?.key,
          issue_id: issue?.id,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          user_agent: request.headers.get('user-agent'),
        },
      }]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[JIRA_WEBHOOK] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Handle issue updated event
 */
async function handleIssueUpdated(issue: any, user: any) {
  try {
    // Find existing issue link
    const { data: issueLink } = await supabase
      .from('issue_links')
      .select('*')
      .eq('provider', 'jira')
      .eq('external_id', issue.id)
      .single();

    if (!issueLink) {
      console.log(`No issue link found for Jira issue ${issue.key}`);
      return;
    }

    // Update issue link
    await supabase
      .from('issue_links')
      .update({
        status: mapJiraStatus(issue.fields.status.name),
        summary: issue.fields.summary,
        description: issue.fields.description,
        assignee: issue.fields.assignee?.displayName,
        priority: issue.fields.priority?.name,
        labels: issue.fields.labels || [],
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', issueLink.id);

    // Update linked microstep status if needed
    if (issueLink.microstep_id) {
      await updateMicrostepStatus(
        issueLink.microstep_id, 
        mapJiraStatus(issue.fields.status.name)
      );
    }

    console.log(`Updated issue link for Jira issue ${issue.key}`);
  } catch (error) {
    console.error('Failed to handle issue updated:', error);
  }
}

/**
 * Handle issue created event
 */
async function handleIssueCreated(issue: any, user: any) {
  try {
    // Check if issue link already exists
    const { data: existingLink } = await supabase
      .from('issue_links')
      .select('*')
      .eq('provider', 'jira')
      .eq('external_id', issue.id)
      .single();

    if (existingLink) {
      console.log(`Issue link already exists for Jira issue ${issue.key}`);
      return;
    }

    // Find matching microstep
    const microstepId = await findMatchingMicrostep(issue.fields.summary);

    // Create new issue link
    await supabase
      .from('issue_links')
      .insert([{
        provider: 'jira',
        external_id: issue.id,
        external_key: issue.key,
        microstep_id: microstepId,
        status: mapJiraStatus(issue.fields.status.name),
        summary: issue.fields.summary,
        description: issue.fields.description,
        assignee: issue.fields.assignee?.displayName,
        priority: issue.fields.priority?.name,
        labels: issue.fields.labels || [],
        url: `${issue.self.replace('/rest/api/2/issue/' + issue.id, '')}/browse/${issue.key}`,
        last_synced_at: new Date().toISOString(),
      }]);

    console.log(`Created issue link for new Jira issue ${issue.key}`);
  } catch (error) {
    console.error('Failed to handle issue created:', error);
  }
}

/**
 * Handle issue deleted event
 */
async function handleIssueDeleted(issue: any, user: any) {
  try {
    // Remove issue link
    await supabase
      .from('issue_links')
      .delete()
      .eq('provider', 'jira')
      .eq('external_id', issue.id);

    console.log(`Removed issue link for deleted Jira issue ${issue.key}`);
  } catch (error) {
    console.error('Failed to handle issue deleted:', error);
  }
}

/**
 * Validate webhook signature
 */
function validateSignature(body: string, signature: string | null): boolean {
  if (!signature) {
    return false;
  }

  // In production, this would use the actual webhook secret
  const secret = process.env.JIRA_WEBHOOK_SECRET || 'default-secret';
  const expectedSignature = 'sha256=' + createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return signature === expectedSignature;
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
    'Closed': 'done',
  };
  
  return statusMap[jiraStatus] || 'todo';
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
  if (keywords.includes('integration') || keywords.includes('webhook')) {
    return 'p13.s2.ms3';
  }
  
  return null;
}

/**
 * Update microstep status
 */
async function updateMicrostepStatus(microstepId: string, status: string): Promise<void> {
  // This would integrate with the spec-sync system to update microstep status
  console.log(`Would update microstep ${microstepId} to status ${status}`);
  
  // Log the status change
  await supabase
    .from('runner_events')
    .insert([{
      actor: 'jira-webhook',
      action: 'microstep_status_updated',
      payload: {
        microstep_id: microstepId,
        new_status: status,
        source: 'jira',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }]);
}
