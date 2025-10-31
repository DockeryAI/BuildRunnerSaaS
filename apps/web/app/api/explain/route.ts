import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ExplanationsStorage, ModelRunsStorage } from '../../../lib/models/storage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      scope,
      entity_id,
      audience = 'technical',
      language = 'en',
      model_name = 'gpt-4',
    } = body;

    // Validate required fields
    if (!scope) {
      return NextResponse.json({
        error: 'Missing required field: scope',
      }, { status: 400 });
    }

    // Validate scope
    const validScopes = ['project', 'milestone', 'step', 'microstep', 'weekly', 'monthly'];
    if (!validScopes.includes(scope)) {
      return NextResponse.json({
        error: `Invalid scope. Must be one of: ${validScopes.join(', ')}`,
      }, { status: 400 });
    }

    // Get user ID from request
    const userId = request.headers.get('x-user-id') || 'system';

    const startTime = Date.now();

    // Fetch context based on scope
    const context = await fetchContextForScope(scope, entity_id, project_id);
    
    if (!context) {
      return NextResponse.json({
        error: 'Failed to fetch context for explanation',
      }, { status: 404 });
    }

    // Generate explanation using AI model
    const explanation = await generateExplanation(context, audience, language, model_name);
    
    if (!explanation.success) {
      return NextResponse.json({
        error: 'Failed to generate explanation',
        details: explanation.error,
      }, { status: 500 });
    }

    const generationTime = Date.now() - startTime;

    // Store explanation
    const storedExplanation = await ExplanationsStorage.create({
      projectId: project_id,
      scope,
      entityId: entity_id,
      modelName: model_name,
      modelProvider: 'openai', // Would be determined by model router
      title: explanation.title,
      content: explanation.content,
      contentType: 'markdown',
      language,
      audience,
      tokensUsed: explanation.tokensUsed,
      generationTimeMs: generationTime,
      userId,
      isExported: false,
      metadata: {
        context_type: context.type,
        context_size: JSON.stringify(context.data).length,
      },
    });

    // Record model run
    await ModelRunsStorage.create({
      projectId: project_id,
      taskType: 'explain',
      modelName: model_name,
      modelProvider: 'openai',
      inputTokens: explanation.inputTokens,
      outputTokens: explanation.outputTokens,
      latencyMs: generationTime,
      success: true,
      qualityScore: explanation.qualityScore,
      costUsd: explanation.costUsd,
      payload: {
        scope,
        entity_id,
        audience,
        language,
      },
      responsePayload: {
        title: explanation.title,
        content_length: explanation.content.length,
      },
      userId,
      entityType: scope,
      entityId: entity_id,
    });

    return NextResponse.json({
      success: true,
      explanation: {
        id: storedExplanation?.id,
        title: explanation.title,
        content: explanation.content,
        scope,
        entity_id,
        model_name,
        tokens_used: explanation.tokensUsed,
        generation_time_ms: generationTime,
        created_at: storedExplanation?.createdAt,
      },
    });

  } catch (error) {
    console.error('[EXPLAIN_POST] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to generate explanation',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const scope = searchParams.get('scope');
    const entityId = searchParams.get('entity_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!scope) {
      return NextResponse.json({
        error: 'scope parameter is required',
      }, { status: 400 });
    }

    const explanations = await ExplanationsStorage.getByScope(
      scope,
      entityId || undefined,
      projectId || undefined,
      limit
    );

    return NextResponse.json({
      explanations,
    });

  } catch (error) {
    console.error('[EXPLAIN_GET] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch explanations',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Helper function to fetch context based on scope
async function fetchContextForScope(scope: string, entityId?: string, projectId?: string) {
  try {
    switch (scope) {
      case 'project':
        if (!projectId) return null;
        return await fetchProjectContext(projectId);
      
      case 'milestone':
      case 'step':
      case 'microstep':
        if (!entityId) return null;
        return await fetchEntityContext(scope, entityId, projectId);
      
      case 'weekly':
      case 'monthly':
        return await fetchPeriodicContext(scope, projectId);
      
      default:
        return null;
    }
  } catch (error) {
    console.error('Failed to fetch context:', error);
    return null;
  }
}

// Fetch project context
async function fetchProjectContext(projectId: string) {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error || !project) return null;

  // Get plan data
  const planData = project.plan_data || {};

  return {
    type: 'project',
    data: {
      project,
      plan: planData,
      phases: planData.phases || [],
    },
  };
}

// Fetch entity context (milestone, step, microstep)
async function fetchEntityContext(scope: string, entityId: string, projectId?: string) {
  // In a real implementation, this would parse the plan.json to find the specific entity
  // For now, return a mock context
  return {
    type: scope,
    data: {
      entity_id: entityId,
      scope,
      project_id: projectId,
      // Would include actual entity data from plan.json
    },
  };
}

// Fetch periodic context (weekly, monthly)
async function fetchPeriodicContext(scope: string, projectId?: string) {
  const days = scope === 'weekly' ? 7 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get recent model runs
  const { data: modelRuns, error } = await supabase
    .from('model_runs')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Failed to fetch model runs:', error);
  }

  return {
    type: scope,
    data: {
      period: scope,
      start_date: startDate.toISOString(),
      end_date: new Date().toISOString(),
      model_runs: modelRuns || [],
      project_id: projectId,
    },
  };
}

// Generate explanation using AI model
async function generateExplanation(
  context: any,
  audience: string,
  language: string,
  modelName: string
) {
  try {
    // Mock AI explanation generation
    // In production, this would call the actual AI model
    const mockExplanation = generateMockExplanation(context, audience);

    return {
      success: true,
      title: mockExplanation.title,
      content: mockExplanation.content,
      tokensUsed: mockExplanation.content.length / 4, // Rough estimate
      inputTokens: JSON.stringify(context).length / 4,
      outputTokens: mockExplanation.content.length / 4,
      qualityScore: 85,
      costUsd: 0.01, // Mock cost
    };
  } catch (error) {
    console.error('Failed to generate explanation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

// Generate mock explanation (replace with real AI call)
function generateMockExplanation(context: any, audience: string) {
  const { type, data } = context;

  switch (type) {
    case 'project':
      return {
        title: `Understanding Your ${data.project?.name || 'Project'} Architecture`,
        content: `# Project Overview

This project is a ${data.project?.description || 'software application'} built using modern development practices.

## Architecture

The project follows a structured approach with multiple phases:

${data.phases?.map((phase: any, index: number) => 
  `### Phase ${index + 1}: ${phase.title || 'Development Phase'}
  
  This phase focuses on ${phase.description || 'core functionality development'}.`
).join('\n\n') || ''}

## Key Components

- **Frontend**: Modern web interface
- **Backend**: Scalable server architecture  
- **Database**: Robust data storage
- **Deployment**: Automated CI/CD pipeline

This architecture ensures scalability, maintainability, and performance.`,
      };

    case 'milestone':
    case 'step':
    case 'microstep':
      return {
        title: `Understanding ${type}: ${data.entity_id}`,
        content: `# ${type.charAt(0).toUpperCase() + type.slice(1)} Explanation

This ${type} (${data.entity_id}) is part of the project development process.

## Purpose

This ${type} serves to accomplish specific objectives within the larger project scope.

## Implementation Details

The ${type} involves:
- Planning and design considerations
- Technical implementation steps
- Quality assurance measures
- Integration with other components

## Impact

Completing this ${type} contributes to the overall project success by delivering specific functionality and meeting defined acceptance criteria.`,
      };

    case 'weekly':
    case 'monthly':
      return {
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Development Summary`,
        content: `# ${type.charAt(0).toUpperCase() + type.slice(1)} Report

## Overview

This ${type} summary covers development activity from ${data.start_date} to ${data.end_date}.

## Model Performance

During this period, ${data.model_runs?.length || 0} AI model executions were recorded.

## Key Metrics

- **Total Runs**: ${data.model_runs?.length || 0}
- **Success Rate**: ${data.model_runs?.filter((r: any) => r.success).length || 0}/${data.model_runs?.length || 0}
- **Average Quality**: ${data.model_runs?.reduce((sum: number, r: any) => sum + (r.quality_score || 0), 0) / (data.model_runs?.length || 1) || 0}%

## Recommendations

Continue monitoring model performance and consider optimizations where needed.`,
      };

    default:
      return {
        title: 'System Explanation',
        content: 'This is a general explanation of the system component.',
      };
  }
}
