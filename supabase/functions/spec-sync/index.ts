import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BuildSpec {
  projectId: string;
  title: string;
  version: string;
  updatedAt: string;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  steps: Step[];
}

interface Step {
  id: string;
  title: string;
  microsteps: Microstep[];
}

interface Microstep {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  criteria: string[];
  links?: { [k: string]: string };
  depends_on?: string[];
  owner?: string;
  effort_points?: number;
  impact_score?: number;
  priority?: 'P1' | 'P2' | 'P3';
  risk_level?: 'low' | 'medium' | 'high';
  risk_notes?: string;
  demo_script?: string[];
  rollback_plan?: string;
  post_check?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    if (req.method === 'POST') {
      // Full spec upsert
      const buildSpec: BuildSpec = await req.json()
      
      // Calculate hash for drift detection
      const specHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(JSON.stringify(buildSpec))
      )
      const hashHex = Array.from(new Uint8Array(specHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // Upsert project
      const { data: project, error: projectError } = await supabaseClient
        .from('projects')
        .upsert({
          id: buildSpec.projectId,
          title: buildSpec.title,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Upsert plan
      const { data: plan, error: planError } = await supabaseClient
        .from('plans')
        .upsert({
          project_id: buildSpec.projectId,
          title: buildSpec.title,
          version: buildSpec.version,
          updated_at: buildSpec.updatedAt,
          last_synced_at: new Date().toISOString(),
          spec_hash: hashHex
        })
        .select()
        .single()

      if (planError) throw planError

      let totalRecords = 1 // plan record

      // Process milestones -> steps -> microsteps
      for (const milestone of buildSpec.milestones) {
        for (const step of milestone.steps) {
          // Upsert step
          const { data: stepRecord, error: stepError } = await supabaseClient
            .from('steps')
            .upsert({
              plan_id: plan.id,
              step_id: step.id,
              title: step.title
            })
            .select()
            .single()

          if (stepError) throw stepError
          totalRecords++

          // Process microsteps
          for (const microstep of step.microsteps) {
            // Upsert microstep
            const { data: microstepRecord, error: microstepError } = await supabaseClient
              .from('microsteps')
              .upsert({
                step_id: stepRecord.id,
                microstep_id: microstep.id,
                title: microstep.title,
                status: microstep.status,
                depends_on: microstep.depends_on || null,
                owner: microstep.owner || null,
                effort_points: microstep.effort_points || null,
                impact_score: microstep.impact_score || null,
                priority: microstep.priority || null,
                risk_level: microstep.risk_level || null,
                risk_notes: microstep.risk_notes || null,
                demo_script: microstep.demo_script || null,
                rollback_plan: microstep.rollback_plan || null,
                post_check: microstep.post_check || null,
                links: microstep.links || null
              })
              .select()
              .single()

            if (microstepError) throw microstepError
            totalRecords++

            // Delete existing criteria and insert new ones
            await supabaseClient
              .from('acceptance_criteria')
              .delete()
              .eq('microstep_id', microstepRecord.id)

            if (microstep.criteria.length > 0) {
              const criteriaRecords = microstep.criteria.map(criterion => ({
                microstep_id: microstepRecord.id,
                criterion
              }))

              const { error: criteriaError } = await supabaseClient
                .from('acceptance_criteria')
                .insert(criteriaRecords)

              if (criteriaError) throw criteriaError
              totalRecords += criteriaRecords.length
            }
          }
        }
      }

      // Log sync event
      await supabaseClient
        .from('runner_events')
        .insert({
          plan_id: plan.id,
          event_type: 'sync_push',
          actor: 'edge_function',
          details: { 
            version: buildSpec.version,
            records_synced: totalRecords,
            spec_hash: hashHex
          }
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          records_synced: totalRecords,
          spec_hash: hashHex,
          plan_id: plan.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (req.method === 'PUT') {
      // Partial update (placeholder for future implementation)
      return new Response(
        JSON.stringify({ error: 'Partial updates not yet implemented' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 501 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
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
