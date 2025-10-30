import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    )
  }

  try {
    const url = new URL(req.url)
    const projectId = url.searchParams.get('project_id')
    const localHash = url.searchParams.get('local_hash')
    const version = url.searchParams.get('version')

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'project_id parameter is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the latest plan for the project
    let query = supabaseClient
      .from('plans')
      .select('id, version, spec_hash, last_synced_at, updated_at')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false })

    if (version) {
      query = query.eq('version', version)
    }

    const { data: plans, error: planError } = await query.limit(1)

    if (planError) throw planError

    if (!plans || plans.length === 0) {
      return new Response(
        JSON.stringify({ 
          status: 'no_remote',
          message: 'No remote plan found for this project'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const remotePlan = plans[0]
    const remoteHash = remotePlan.spec_hash

    // Compare hashes if local hash provided
    if (localHash && remoteHash) {
      if (localHash === remoteHash) {
        return new Response(
          JSON.stringify({ 
            status: 'equal',
            message: 'Local and remote specs are identical',
            remote_version: remotePlan.version,
            last_synced_at: remotePlan.last_synced_at
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } else {
        // Get summary of differences (stub implementation)
        const { data: microsteps, error: microstepsError } = await supabaseClient
          .from('microsteps')
          .select('microstep_id, status, updated_at')
          .in('step_id', 
            supabaseClient
              .from('steps')
              .select('id')
              .eq('plan_id', remotePlan.id)
          )

        if (microstepsError) throw microstepsError

        const diffSummary = {
          total_microsteps: microsteps?.length || 0,
          status_counts: microsteps?.reduce((acc: any, ms: any) => {
            acc[ms.status] = (acc[ms.status] || 0) + 1
            return acc
          }, {}) || {},
          last_updated: microsteps?.reduce((latest: string, ms: any) => {
            return ms.updated_at > latest ? ms.updated_at : latest
          }, '1970-01-01T00:00:00Z') || null
        }

        return new Response(
          JSON.stringify({ 
            status: 'drift',
            message: 'Local and remote specs differ',
            remote_version: remotePlan.version,
            remote_hash: remoteHash,
            local_hash: localHash,
            last_synced_at: remotePlan.last_synced_at,
            diff_summary: diffSummary
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    // No local hash provided, just return remote info
    return new Response(
      JSON.stringify({ 
        status: 'remote_available',
        message: 'Remote spec available',
        remote_version: remotePlan.version,
        remote_hash: remoteHash,
        last_synced_at: remotePlan.last_synced_at
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
