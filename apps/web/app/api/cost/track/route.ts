import { NextRequest, NextResponse } from 'next/server';
import { ModelUsage, CostComparison } from '@/components/cost/CostOptimizationDashboard';

// Mock model usage data
const mockModelUsage: ModelUsage[] = [
  {
    modelId: 'deepseek-v3',
    modelName: 'DeepSeek V3',
    provider: 'DeepSeek',
    requests: 15420,
    tokens: { input: 2340000, output: 1890000, total: 4230000 },
    cost: { input: 0.42, output: 0.84, total: 1.26 },
    averageLatency: 487,
    errorRate: 0.3,
  },
  {
    modelId: 'claude-sonnet-4.5',
    modelName: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    requests: 8920,
    tokens: { input: 1450000, output: 980000, total: 2430000 },
    cost: { input: 4.35, output: 14.70, total: 19.05 },
    averageLatency: 823,
    errorRate: 0.1,
  },
  {
    modelId: 'gemini-2.5-pro',
    modelName: 'Gemini 2.5 Pro',
    provider: 'Google',
    requests: 5670,
    tokens: { input: 890000, output: 620000, total: 1510000 },
    cost: { input: 0.89, output: 1.24, total: 2.13 },
    averageLatency: 612,
    errorRate: 0.5,
  },
  {
    modelId: 'deepseek-r1',
    modelName: 'DeepSeek R1',
    provider: 'DeepSeek',
    requests: 3240,
    tokens: { input: 540000, output: 380000, total: 920000 },
    cost: { input: 0.38, output: 1.14, total: 1.52 },
    averageLatency: 1240,
    errorRate: 0.4,
  },
  {
    modelId: 'gpt-4-turbo',
    modelName: 'GPT-4 Turbo',
    provider: 'OpenAI',
    requests: 1890,
    tokens: { input: 320000, output: 210000, total: 530000 },
    cost: { input: 3.20, output: 6.30, total: 9.50 },
    averageLatency: 1156,
    errorRate: 0.2,
  },
];

const mockCostComparison: CostComparison = {
  currentCost: 33.46,
  baselineCost: 112.80, // If all requests used GPT-4
  savings: 79.34,
  savingsPercentage: 70.3,
};

const mockCurrentSpend = {
  daily: 1.67,
  weekly: 11.15,
  monthly: 33.46,
};

export async function GET() {
  return NextResponse.json({
    modelUsage: mockModelUsage,
    costComparison: mockCostComparison,
    currentSpend: mockCurrentSpend,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, tokens, cost } = body;

    // In production, this would update actual usage tracking
    return NextResponse.json({
      success: true,
      message: 'Usage tracked successfully',
    });
  } catch (error) {
    console.error('Cost tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track cost' },
      { status: 500 }
    );
  }
}
