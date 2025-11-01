import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIdea, productName, prdSections } = body;

    // Get API keys from headers
    const apiKeysHeader = request.headers.get('x-api-keys');
    const apiKeys = apiKeysHeader ? JSON.parse(apiKeysHeader) : {};

    if (!apiKeys.openrouter) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 400 }
      );
    }

    // Build context from PRD sections
    let prdContext = '';
    if (prdSections) {
      Object.entries(prdSections).forEach(([phase, sections]: [string, any]) => {
        sections.forEach((section: any) => {
          if (section.items && section.items.length > 0) {
            prdContext += `\n\n${section.name}:\n`;
            section.items.forEach((item: any) => {
              prdContext += `- ${item.title}: ${item.shortDescription}\n`;
            });
          }
        });
      });
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeys.openrouter}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner SaaS - Project Plan Generator',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-4-sonnet-20250522',
        messages: [
          {
            role: 'system',
            content: `You are a project planning expert. Generate a detailed project implementation plan with Milestones, Steps, and Microsteps based on a PRD.

Return a JSON object with this exact schema:
{
  "milestones": [
    {
      "id": "unique_id",
      "title": "Milestone title",
      "description": "What this milestone achieves",
      "estimatedWeeks": 2,
      "dependencies": ["description of what must be done first"],
      "status": "pending",
      "steps": [
        {
          "id": "unique_id",
          "title": "Step title",
          "description": "What this step involves",
          "estimatedDays": 3,
          "dependencies": ["what must be done first"],
          "status": "pending",
          "microsteps": [
            {
              "id": "unique_id",
              "title": "Microstep title",
              "description": "Specific action to take",
              "estimatedHours": 4,
              "dependencies": ["prerequisite tasks"],
              "status": "pending"
            }
          ]
        }
      ]
    }
  ],
  "totalEstimatedWeeks": 8,
  "generatedAt": "2025-11-01T08:00:00Z"
}

IMPORTANT:
- Create 3-5 milestones for a complete project
- Each milestone should have 2-4 steps
- Each step should have 2-5 microsteps
- Microsteps should be specific, actionable tasks
- Include realistic time estimates
- Dependencies should reference what needs to be completed first
- Focus on technical implementation based on the PRD features`
          },
          {
            role: 'user',
            content: `Product: ${productName || 'Product'}

Product Idea: ${productIdea}

PRD Content:
${prdContext}

Generate a comprehensive project implementation plan with milestones, steps, and microsteps. Include realistic time estimates and dependencies. Return ONLY the JSON object.`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate project plan' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in API response');
    }

    // Extract JSON from response (might be wrapped in markdown)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const plan = JSON.parse(jsonStr);

    // Ensure all items have IDs
    if (!plan.milestones) {
      throw new Error('Invalid plan structure: missing milestones');
    }

    plan.milestones.forEach((milestone: any, mIndex: number) => {
      if (!milestone.id) milestone.id = `milestone-${mIndex}`;
      if (!milestone.steps) milestone.steps = [];

      milestone.steps.forEach((step: any, sIndex: number) => {
        if (!step.id) step.id = `step-${mIndex}-${sIndex}`;
        if (!step.microsteps) step.microsteps = [];

        step.microsteps.forEach((microstep: any, msIndex: number) => {
          if (!microstep.id) microstep.id = `microstep-${mIndex}-${sIndex}-${msIndex}`;
          if (!microstep.dependencies) microstep.dependencies = [];
          if (!microstep.status) microstep.status = 'pending';
        });

        if (!step.dependencies) step.dependencies = [];
        if (!step.status) step.status = 'pending';
      });

      if (!milestone.dependencies) milestone.dependencies = [];
      if (!milestone.status) milestone.status = 'pending';
    });

    if (!plan.generatedAt) {
      plan.generatedAt = new Date().toISOString();
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error generating project plan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate project plan' },
      { status: 500 }
    );
  }
}
