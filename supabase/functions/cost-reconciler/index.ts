import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CostData {
  projectId: string;
  month: string;
  usdSpend: number;
  usdForecast: number;
  tokenUsage: number;
  apiCalls: number;
  storageGb: number;
}

interface BudgetAlert {
  projectId: string;
  budgetLimit: number;
  currentSpend: number;
  percentage: number;
  threshold: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01
    const now = new Date();

    console.log(`[COST_RECONCILER] Starting reconciliation for month: ${currentMonth}`);

    // Get all active projects
    const { data: projects, error: projectsError } = await supabaseClient
      .from('projects')
      .select('id, name, org_id')
      .eq('status', 'active');

    if (projectsError) {
      throw new Error(`Failed to fetch projects: ${projectsError.message}`);
    }

    const reconciliationResults = [];
    const budgetAlerts: BudgetAlert[] = [];

    for (const project of projects || []) {
      try {
        // Reconcile costs for this project
        const costData = await reconcileProjectCosts(supabaseClient, project.id, currentMonth);
        reconciliationResults.push(costData);

        // Check budget alerts
        const budgetAlert = await checkBudgetAlert(supabaseClient, project.id, costData);
        if (budgetAlert) {
          budgetAlerts.push(budgetAlert);
        }

        console.log(`[COST_RECONCILER] Reconciled project ${project.id}: $${costData.usdSpend} spent`);
      } catch (error) {
        console.error(`[COST_RECONCILER] Failed to reconcile project ${project.id}:`, error);
      }
    }

    // Process budget alerts
    for (const alert of budgetAlerts) {
      await processBudgetAlert(supabaseClient, alert);
    }

    // Log reconciliation event
    await supabaseClient
      .from('runner_events')
      .insert([{
        actor: 'system',
        action: 'cost_reconciled',
        payload: {
          month: currentMonth,
          projects_processed: reconciliationResults.length,
          total_spend: reconciliationResults.reduce((sum, r) => sum + r.usdSpend, 0),
          alerts_generated: budgetAlerts.length,
        },
        metadata: {
          timestamp: now.toISOString(),
          reconciler_version: '1.0.0',
        },
      }]);

    return new Response(
      JSON.stringify({
        success: true,
        month: currentMonth,
        projects_processed: reconciliationResults.length,
        total_spend: reconciliationResults.reduce((sum, r) => sum + r.usdSpend, 0),
        alerts_generated: budgetAlerts.length,
        results: reconciliationResults,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('[COST_RECONCILER] Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function reconcileProjectCosts(
  supabaseClient: any,
  projectId: string,
  month: string
): Promise<CostData> {
  const monthStart = new Date(month);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  const now = new Date();

  // Get usage events for the month
  const { data: usageEvents, error: usageError } = await supabaseClient
    .from('usage_events')
    .select('event_type, quantity, usd_cost')
    .eq('project_id', projectId)
    .gte('recorded_at', monthStart.toISOString())
    .lte('recorded_at', monthEnd.toISOString());

  if (usageError) {
    throw new Error(`Failed to fetch usage events: ${usageError.message}`);
  }

  // Aggregate usage data
  let totalSpend = 0;
  let tokenUsage = 0;
  let apiCalls = 0;
  let storageGb = 0;

  for (const event of usageEvents || []) {
    totalSpend += parseFloat(event.usd_cost || 0);
    
    switch (event.event_type) {
      case 'tokens':
        tokenUsage += event.quantity;
        break;
      case 'api_calls':
        apiCalls += event.quantity;
        break;
      case 'storage':
        storageGb += event.quantity;
        break;
    }
  }

  // Get credits applied this month
  const { data: credits, error: creditsError } = await supabaseClient
    .from('credits')
    .select('amount_usd')
    .eq('project_id', projectId)
    .gte('applied_at', monthStart.toISOString())
    .lte('applied_at', monthEnd.toISOString());

  if (creditsError) {
    throw new Error(`Failed to fetch credits: ${creditsError.message}`);
  }

  const totalCredits = credits?.reduce((sum, credit) => sum + parseFloat(credit.amount_usd), 0) || 0;
  const netSpend = Math.max(0, totalSpend - totalCredits);

  // Calculate forecast based on current usage rate
  const daysInMonth = monthEnd.getDate();
  const daysPassed = now.getDate();
  const dailySpendRate = daysPassed > 0 ? netSpend / daysPassed : 0;
  const forecast = dailySpendRate * daysInMonth;

  const costData: CostData = {
    projectId,
    month,
    usdSpend: netSpend,
    usdForecast: forecast,
    tokenUsage,
    apiCalls,
    storageGb,
  };

  // Upsert cost snapshot
  await supabaseClient
    .from('cost_snapshots')
    .upsert({
      project_id: projectId,
      month,
      usd_spend: netSpend,
      usd_forecast: forecast,
      token_usage: tokenUsage,
      api_calls: apiCalls,
      storage_gb: storageGb,
      snapshot_at: now.toISOString(),
    });

  return costData;
}

async function checkBudgetAlert(
  supabaseClient: any,
  projectId: string,
  costData: CostData
): Promise<BudgetAlert | null> {
  // Get active budget for project
  const { data: budget, error: budgetError } = await supabaseClient
    .from('cost_budgets')
    .select('monthly_usd, alert_threshold, hard_cap')
    .eq('project_id', projectId)
    .eq('enabled', true)
    .single();

  if (budgetError || !budget) {
    return null; // No budget set
  }

  const percentage = (costData.usdSpend / budget.monthly_usd) * 100;
  const thresholdPercentage = budget.alert_threshold * 100;

  // Check if we should alert
  if (percentage >= thresholdPercentage) {
    return {
      projectId,
      budgetLimit: budget.monthly_usd,
      currentSpend: costData.usdSpend,
      percentage,
      threshold: thresholdPercentage,
    };
  }

  return null;
}

async function processBudgetAlert(
  supabaseClient: any,
  alert: BudgetAlert
): Promise<void> {
  // Create support ticket for budget alert
  const { error: ticketError } = await supabaseClient
    .from('support_tickets')
    .insert([{
      project_id: alert.projectId,
      title: `Budget Alert: ${alert.percentage.toFixed(1)}% of monthly budget used`,
      description: `Project has spent $${alert.currentSpend.toFixed(2)} of $${alert.budgetLimit.toFixed(2)} monthly budget (${alert.percentage.toFixed(1)}%).`,
      status: 'open',
      priority: alert.percentage >= 95 ? 'high' : 'medium',
      category: 'budget',
      meta: {
        budget_limit: alert.budgetLimit,
        current_spend: alert.currentSpend,
        percentage: alert.percentage,
        threshold: alert.threshold,
      },
    }]);

  if (ticketError) {
    console.error(`Failed to create budget alert ticket for project ${alert.projectId}:`, ticketError);
  }

  // Log admin action
  await supabaseClient
    .from('admin_actions')
    .insert([{
      actor: '00000000-0000-0000-0000-000000000000', // System actor
      action: 'budget_alert_generated',
      resource_type: 'cost_budget',
      project_id: alert.projectId,
      payload: {
        budget_limit: alert.budgetLimit,
        current_spend: alert.currentSpend,
        percentage: alert.percentage,
        threshold: alert.threshold,
      },
    }]);

  console.log(`[BUDGET_ALERT] Generated alert for project ${alert.projectId}: ${alert.percentage.toFixed(1)}% of budget used`);
}
