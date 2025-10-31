import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UsageData {
  project_id: string;
  provider: string;
  service_type: string;
  tokens_used: number;
  compute_seconds: number;
  storage_gb: number;
  api_calls: number;
  usd_cost: number;
  phase: number;
  microstep_id?: string;
  usage_date: string;
  billing_period: string;
  metadata: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    console.log(`Starting usage collection for ${today}`);

    // Get all active projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, metadata')
      .eq('is_active', true);

    if (projectsError) {
      throw new Error(`Failed to fetch projects: ${projectsError.message}`);
    }

    const usageEntries: UsageData[] = [];
    let totalCost = 0;

    // Collect usage data for each project
    for (const project of projects || []) {
      console.log(`Collecting usage for project: ${project.name} (${project.id})`);

      // 1. OpenAI Usage Collection
      const openaiUsage = await collectOpenAIUsage(project.id, today);
      if (openaiUsage) {
        usageEntries.push(openaiUsage);
        totalCost += openaiUsage.usd_cost;
      }

      // 2. Supabase Usage Collection
      const supabaseUsage = await collectSupabaseUsage(project.id, today);
      if (supabaseUsage) {
        usageEntries.push(supabaseUsage);
        totalCost += supabaseUsage.usd_cost;
      }

      // 3. Vercel Usage Collection
      const vercelUsage = await collectVercelUsage(project.id, today);
      if (vercelUsage) {
        usageEntries.push(vercelUsage);
        totalCost += vercelUsage.usd_cost;
      }

      // 4. GitHub Actions Usage Collection
      const githubUsage = await collectGitHubUsage(project.id, today);
      if (githubUsage) {
        usageEntries.push(githubUsage);
        totalCost += githubUsage.usd_cost;
      }

      // 5. Compute Usage (estimated from runner_events)
      const computeUsage = await collectComputeUsage(supabase, project.id, today);
      if (computeUsage) {
        usageEntries.push(computeUsage);
        totalCost += computeUsage.usd_cost;
      }
    }

    // Insert all usage data
    if (usageEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('cost_usage')
        .insert(usageEntries);

      if (insertError) {
        throw new Error(`Failed to insert usage data: ${insertError.message}`);
      }

      console.log(`Inserted ${usageEntries.length} usage entries, total cost: $${totalCost.toFixed(2)}`);
    }

    // Run anomaly detection for each project
    for (const project of projects || []) {
      try {
        await supabase.rpc('detect_cost_anomalies', {
          p_project_id: project.id,
        });
      } catch (error) {
        console.error(`Failed to detect anomalies for project ${project.id}:`, error);
      }
    }

    // Log collection event
    await supabase
      .from('runner_events')
      .insert([{
        actor: 'usage-collector',
        action: 'usage_collected',
        payload: {
          collection_date: today,
          projects_processed: projects?.length || 0,
          entries_created: usageEntries.length,
          total_cost: totalCost,
        },
        metadata: {
          billing_period: currentMonth,
          collection_timestamp: new Date().toISOString(),
        },
      }]);

    return new Response(
      JSON.stringify({
        success: true,
        collection_date: today,
        projects_processed: projects?.length || 0,
        entries_created: usageEntries.length,
        total_cost: totalCost,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Usage collection error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// OpenAI Usage Collection
async function collectOpenAIUsage(projectId: string, date: string): Promise<UsageData | null> {
  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.log('OpenAI API key not configured, skipping OpenAI usage collection');
      return null;
    }

    // In production, this would call OpenAI's usage API
    // For now, simulate usage data
    const simulatedUsage = {
      tokens_used: Math.floor(Math.random() * 50000) + 10000, // 10k-60k tokens
      api_calls: Math.floor(Math.random() * 100) + 20, // 20-120 calls
      cost_per_1k_tokens: 0.002, // GPT-4 pricing
    };

    const totalCost = (simulatedUsage.tokens_used / 1000) * simulatedUsage.cost_per_1k_tokens;

    return {
      project_id: projectId,
      provider: 'openai',
      service_type: 'llm_tokens',
      tokens_used: simulatedUsage.tokens_used,
      compute_seconds: 0,
      storage_gb: 0,
      api_calls: simulatedUsage.api_calls,
      usd_cost: totalCost,
      phase: 0, // Will be updated based on current project phase
      usage_date: date,
      billing_period: date.slice(0, 7),
      metadata: {
        model: 'gpt-4',
        cost_per_1k_tokens: simulatedUsage.cost_per_1k_tokens,
        collection_method: 'simulated',
      },
    };
  } catch (error) {
    console.error('Failed to collect OpenAI usage:', error);
    return null;
  }
}

// Supabase Usage Collection
async function collectSupabaseUsage(projectId: string, date: string): Promise<UsageData | null> {
  try {
    // Simulate Supabase usage data
    const simulatedUsage = {
      storage_gb: Math.random() * 5 + 1, // 1-6 GB
      bandwidth_gb: Math.random() * 10 + 2, // 2-12 GB
      database_size_gb: Math.random() * 2 + 0.5, // 0.5-2.5 GB
      api_calls: Math.floor(Math.random() * 10000) + 5000, // 5k-15k calls
    };

    // Supabase pricing (simplified)
    const storageCost = Math.max(0, simulatedUsage.storage_gb - 0.5) * 0.125; // $0.125/GB after 500MB
    const bandwidthCost = Math.max(0, simulatedUsage.bandwidth_gb - 5) * 0.09; // $0.09/GB after 5GB
    const totalCost = storageCost + bandwidthCost;

    return {
      project_id: projectId,
      provider: 'supabase',
      service_type: 'storage',
      tokens_used: 0,
      compute_seconds: 0,
      storage_gb: simulatedUsage.storage_gb,
      api_calls: simulatedUsage.api_calls,
      usd_cost: totalCost,
      phase: 0,
      usage_date: date,
      billing_period: date.slice(0, 7),
      metadata: {
        storage_gb: simulatedUsage.storage_gb,
        bandwidth_gb: simulatedUsage.bandwidth_gb,
        database_size_gb: simulatedUsage.database_size_gb,
        collection_method: 'simulated',
      },
    };
  } catch (error) {
    console.error('Failed to collect Supabase usage:', error);
    return null;
  }
}

// Vercel Usage Collection
async function collectVercelUsage(projectId: string, date: string): Promise<UsageData | null> {
  try {
    // Simulate Vercel usage data
    const simulatedUsage = {
      function_invocations: Math.floor(Math.random() * 50000) + 10000,
      gb_hours: Math.random() * 100 + 20,
      bandwidth_gb: Math.random() * 50 + 10,
    };

    // Vercel pricing (simplified)
    const functionCost = Math.max(0, simulatedUsage.function_invocations - 100000) * 0.0000004; // After 100k free
    const computeCost = Math.max(0, simulatedUsage.gb_hours - 100) * 0.0000185; // After 100 GB-hours free
    const totalCost = functionCost + computeCost;

    return {
      project_id: projectId,
      provider: 'vercel',
      service_type: 'compute',
      tokens_used: 0,
      compute_seconds: simulatedUsage.gb_hours * 3600, // Convert GB-hours to seconds
      storage_gb: 0,
      api_calls: simulatedUsage.function_invocations,
      usd_cost: totalCost,
      phase: 0,
      usage_date: date,
      billing_period: date.slice(0, 7),
      metadata: {
        function_invocations: simulatedUsage.function_invocations,
        gb_hours: simulatedUsage.gb_hours,
        bandwidth_gb: simulatedUsage.bandwidth_gb,
        collection_method: 'simulated',
      },
    };
  } catch (error) {
    console.error('Failed to collect Vercel usage:', error);
    return null;
  }
}

// GitHub Actions Usage Collection
async function collectGitHubUsage(projectId: string, date: string): Promise<UsageData | null> {
  try {
    // Simulate GitHub Actions usage
    const simulatedUsage = {
      workflow_runs: Math.floor(Math.random() * 20) + 5,
      minutes_used: Math.floor(Math.random() * 500) + 100,
    };

    // GitHub Actions pricing (simplified)
    const minutesCost = Math.max(0, simulatedUsage.minutes_used - 2000) * 0.008; // After 2000 free minutes
    
    return {
      project_id: projectId,
      provider: 'github',
      service_type: 'compute',
      tokens_used: 0,
      compute_seconds: simulatedUsage.minutes_used * 60,
      storage_gb: 0,
      api_calls: simulatedUsage.workflow_runs,
      usd_cost: minutesCost,
      phase: 0,
      usage_date: date,
      billing_period: date.slice(0, 7),
      metadata: {
        workflow_runs: simulatedUsage.workflow_runs,
        minutes_used: simulatedUsage.minutes_used,
        collection_method: 'simulated',
      },
    };
  } catch (error) {
    console.error('Failed to collect GitHub usage:', error);
    return null;
  }
}

// Compute Usage from runner_events
async function collectComputeUsage(supabase: any, projectId: string, date: string): Promise<UsageData | null> {
  try {
    // Get runner events for the day to estimate compute usage
    const { data: events, error } = await supabase
      .from('runner_events')
      .select('action, payload, created_at')
      .eq('payload->>project_id', projectId)
      .gte('created_at', `${date}T00:00:00Z`)
      .lt('created_at', `${date}T23:59:59Z`);

    if (error) {
      console.error('Failed to fetch runner events:', error);
      return null;
    }

    // Estimate compute time based on events
    const computeEvents = events?.filter(e => 
      ['microstep_completed', 'test_run', 'build_completed'].includes(e.action)
    ) || [];

    const estimatedComputeSeconds = computeEvents.length * 30; // 30 seconds per event average
    const computeCost = (estimatedComputeSeconds / 3600) * 0.05; // $0.05 per compute hour

    return {
      project_id: projectId,
      provider: 'other',
      service_type: 'compute',
      tokens_used: 0,
      compute_seconds: estimatedComputeSeconds,
      storage_gb: 0,
      api_calls: computeEvents.length,
      usd_cost: computeCost,
      phase: 0,
      usage_date: date,
      billing_period: date.slice(0, 7),
      metadata: {
        events_processed: computeEvents.length,
        estimated_compute_seconds: estimatedComputeSeconds,
        collection_method: 'runner_events',
      },
    };
  } catch (error) {
    console.error('Failed to collect compute usage:', error);
    return null;
  }
}
