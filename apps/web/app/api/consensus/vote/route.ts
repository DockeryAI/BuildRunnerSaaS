import { NextRequest, NextResponse } from 'next/server';
import { ModelVote, ConsensusResult } from '@/components/ai-consensus/ConsensusPanel';

/**
 * AI Consensus Voting API
 *
 * Handles multi-model voting on suggestions with consensus calculation
 *
 * POST /api/consensus/vote
 * Body: { suggestionId, suggestionTitle, models: ['claude-sonnet-4.5', 'deepseek-v3', 'gemini-2.5-pro'] }
 *
 * Returns: ConsensusResult with aggregated votes
 */

// Mock AI model responses (in production, this would call actual AI APIs)
async function simulateModelVote(
  modelId: string,
  suggestionTitle: string,
  suggestionContent: string
): Promise<ModelVote> {
  const models = {
    'claude-sonnet-4.5': {
      modelName: 'Claude Sonnet 4.5',
      provider: 'Anthropic' as const,
      baseLatency: 800,
      baseCost: 0.015,
    },
    'deepseek-v3': {
      modelName: 'DeepSeek V3',
      provider: 'DeepSeek' as const,
      baseLatency: 500,
      baseCost: 0.0003,
    },
    'gemini-2.5-pro': {
      modelName: 'Gemini 2.5 Pro',
      provider: 'Google' as const,
      baseLatency: 600,
      baseCost: 0.002,
    },
    'gpt-4-turbo': {
      modelName: 'GPT-4 Turbo',
      provider: 'OpenAI' as const,
      baseLatency: 1200,
      baseCost: 0.02,
    },
  };

  const modelConfig = models[modelId as keyof typeof models];
  if (!modelConfig) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Simulate voting logic (random for demo, would be actual AI in production)
  const random = Math.random();
  let vote: ModelVote['vote'];
  let confidence: number;
  let reasoning: string;

  if (random > 0.7) {
    vote = 'approve';
    confidence = 75 + Math.random() * 20;
    reasoning = `This suggestion aligns well with the project goals and addresses a clear user need. The implementation approach is sound and feasible within the proposed timeline.`;
  } else if (random > 0.4) {
    vote = 'approve';
    confidence = 60 + Math.random() * 15;
    reasoning = `Generally positive direction, though some concerns about scope. The feature would add value but may need refinement to ensure it doesn't introduce complexity.`;
  } else if (random > 0.2) {
    vote = 'reject';
    confidence = 65 + Math.random() * 20;
    reasoning = `This feature may introduce unnecessary complexity without sufficient ROI. Consider simplifying the scope or deferring until core functionality is more mature.`;
  } else {
    vote = 'abstain';
    confidence = 40 + Math.random() * 20;
    reasoning = `Insufficient information to make a confident recommendation. More context needed about user requirements and technical constraints.`;
  }

  return {
    modelId,
    modelName: modelConfig.modelName,
    vote,
    confidence: Math.round(confidence),
    reasoning,
    processingTime: modelConfig.baseLatency + Math.random() * 200,
    cost: modelConfig.baseCost * (0.8 + Math.random() * 0.4),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { suggestionId, suggestionTitle, suggestionContent, models } = body;

    if (!suggestionId || !suggestionTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: suggestionId, suggestionTitle' },
        { status: 400 }
      );
    }

    // Default models if not specified
    const modelsToQuery = models || [
      'claude-sonnet-4.5',
      'deepseek-v3',
      'gemini-2.5-pro',
    ];

    // Query all models in parallel
    const votes = await Promise.all(
      modelsToQuery.map((modelId: string) =>
        simulateModelVote(modelId, suggestionTitle, suggestionContent || '')
      )
    );

    // Calculate consensus
    const approveCount = votes.filter((v) => v.vote === 'approve').length;
    const rejectCount = votes.filter((v) => v.vote === 'reject').length;
    const abstainCount = votes.filter((v) => v.vote === 'abstain').length;

    const totalVotes = approveCount + rejectCount + abstainCount;
    const consensusReached = approveCount > totalVotes / 2 || rejectCount > totalVotes / 2;

    let finalDecision: ConsensusResult['finalDecision'];
    if (approveCount > rejectCount && approveCount >= totalVotes / 2) {
      finalDecision = 'approve';
    } else if (rejectCount > approveCount && rejectCount >= totalVotes / 2) {
      finalDecision = 'reject';
    } else {
      finalDecision = 'needs_review';
    }

    const averageConfidence =
      votes.reduce((sum, v) => sum + v.confidence, 0) / votes.length;
    const totalCost = votes.reduce((sum, v) => sum + (v.cost || 0), 0);
    const totalProcessingTime = votes.reduce(
      (sum, v) => sum + (v.processingTime || 0),
      0
    );

    const result: ConsensusResult = {
      suggestionId,
      suggestionTitle,
      consensusReached,
      finalDecision,
      approveCount,
      rejectCount,
      abstainCount,
      averageConfidence: Math.round(averageConfidence),
      totalCost,
      totalProcessingTime,
      votes,
      timestamp: new Date(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Consensus vote error:', error);
    return NextResponse.json(
      { error: 'Failed to process consensus vote' },
      { status: 500 }
    );
  }
}
