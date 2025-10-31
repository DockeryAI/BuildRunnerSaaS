import { NextRequest, NextResponse } from 'next/server';

// Scoring service using DeepSeek R1 for deliberate reasoning
class ScoringService {
  private baseUrl = 'https://openrouter.ai/api/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeAPICall(model: string, messages: any[], options: any = {}) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner SaaS - Scoring',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature || 0.3,
        max_tokens: options.max_tokens || 3000,
        ...options
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  }

  async scoreIdeas(ideas: any[], criteria: string[] = ['impact', 'effort', 'fit']) {
    try {
      // Use DeepSeek R1 for deliberate reasoning about scoring
      const data = await this.makeAPICall('deepseek/deepseek-r1', [
        {
          role: 'system',
          content: `You are an expert product strategist specializing in idea evaluation. Score each idea based on the provided criteria using deliberate reasoning.

For each idea, provide:
- impact_score: 1-10 (potential business impact)
- effort_score: 1-10 (implementation complexity, 1=easy, 10=very hard)
- fit_score: 1-10 (alignment with product vision/market)
- overall_score: calculated weighted average
- reasoning: detailed explanation of scoring rationale
- recommendation: proceed/modify/reject with specific next steps

Think through each scoring decision carefully and show your reasoning process.`
        },
        {
          role: 'user',
          content: `Score these product ideas based on ${criteria.join(', ')}:

${ideas.map((idea, i) => `${i + 1}. ${idea.title}: ${idea.summary}`).join('\n')}

Return a JSON array with scoring for each idea. Use this exact schema:
{
  "idea_index": number,
  "title": "string",
  "impact_score": number,
  "effort_score": number,
  "fit_score": number,
  "overall_score": number,
  "reasoning": "detailed explanation",
  "recommendation": "proceed|modify|reject",
  "next_steps": ["specific action items"],
  "risks": ["potential risks"],
  "dependencies": ["required dependencies"]
}

Return only the JSON array, no additional text.`
        }
      ], {
        temperature: 0.3, // Low temperature for analytical consistency
        max_tokens: 4000
      });

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in API response');
      }

      // Parse JSON response
      const scores = JSON.parse(content);
      return Array.isArray(scores) ? scores : [scores];

    } catch (error) {
      console.error('Scoring service error:', error);
      
      // Fallback scoring
      return ideas.map((idea, index) => ({
        idea_index: index,
        title: idea.title,
        impact_score: 7,
        effort_score: 5,
        fit_score: 6,
        overall_score: 6.0,
        reasoning: 'Fallback scoring due to API error',
        recommendation: 'proceed',
        next_steps: ['Review implementation details'],
        risks: ['API unavailable'],
        dependencies: []
      }));
    }
  }

  async analyzeTradeoffs(ideas: any[], constraints: any = {}) {
    try {
      // Use DeepSeek R1 for complex tradeoff analysis
      const data = await this.makeAPICall('deepseek/deepseek-r1', [
        {
          role: 'system',
          content: `You are a strategic product analyst. Perform deep tradeoff analysis between competing ideas considering business constraints and strategic objectives.

Analyze:
- Resource allocation implications
- Strategic alignment and synergies
- Risk/reward profiles
- Implementation sequencing
- Market timing considerations

Provide detailed reasoning for your analysis.`
        },
        {
          role: 'user',
          content: `Analyze tradeoffs between these ideas:

${ideas.map((idea, i) => `${i + 1}. ${idea.title}: ${idea.summary} (Impact: ${idea.impact_score || 'TBD'}, Effort: ${idea.effort_score || 'TBD'})`).join('\n')}

Constraints:
- Budget: ${constraints.budget || 'Not specified'}
- Timeline: ${constraints.timeline || 'Not specified'}
- Team size: ${constraints.team_size || 'Not specified'}
- Strategic priorities: ${constraints.priorities || 'Not specified'}

Return a JSON object with this schema:
{
  "analysis": "comprehensive tradeoff analysis",
  "recommendations": [
    {
      "idea_title": "string",
      "priority": "high|medium|low",
      "rationale": "why this priority",
      "sequence": number,
      "resource_requirements": "description"
    }
  ],
  "synergies": ["ideas that work well together"],
  "conflicts": ["ideas that compete for resources"],
  "risks": ["strategic risks to consider"],
  "success_metrics": ["how to measure success"]
}

Return only the JSON object, no additional text.`
        }
      ], {
        temperature: 0.3,
        max_tokens: 4000
      });

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in API response');
      }

      return JSON.parse(content);

    } catch (error) {
      console.error('Tradeoff analysis error:', error);
      
      // Fallback analysis
      return {
        analysis: 'Fallback analysis due to API error. Manual review recommended.',
        recommendations: ideas.map((idea, index) => ({
          idea_title: idea.title,
          priority: 'medium',
          rationale: 'Requires manual evaluation',
          sequence: index + 1,
          resource_requirements: 'To be determined'
        })),
        synergies: [],
        conflicts: [],
        risks: ['API unavailable for detailed analysis'],
        success_metrics: ['User adoption', 'Feature usage']
      };
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ideas, action, criteria, constraints } = await request.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const service = new ScoringService(process.env.OPENROUTER_API_KEY);

    let result;
    switch (action) {
      case 'score':
        result = await service.scoreIdeas(ideas, criteria);
        break;
      case 'analyze_tradeoffs':
        result = await service.analyzeTradeoffs(ideas, constraints);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "score" or "analyze_tradeoffs"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      result,
      action,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in scoring API:', error);
    return NextResponse.json(
      { error: 'Failed to process scoring request' },
      { status: 500 }
    );
  }
}
