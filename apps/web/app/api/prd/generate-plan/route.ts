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
            content: `You are a project planning expert and software architect. Generate a detailed project implementation plan with Milestones, Steps, and Microsteps based on a PRD.

Return a JSON object with this exact schema:
{
  "architecture": {
    "recommendedStack": "Brief summary of recommended technology stack",
    "frontend": ["Frontend technologies"],
    "backend": ["Backend technologies"],
    "database": ["Database technologies"],
    "infrastructure": ["Infrastructure and deployment"],
    "thirdPartyServices": ["Required third-party services"]
  },
  "milestones": [
    {
      "id": "unique_id",
      "title": "Milestone title",
      "description": "What this milestone achieves",
      "estimatedWeeks": 2,
      "dependencies": [],
      "status": "pending",
      "steps": [
        {
          "id": "unique_id",
          "title": "Step title",
          "description": "What this step involves",
          "estimatedDays": 3,
          "dependencies": [],
          "status": "pending",
          "microsteps": [
            {
              "id": "unique_id",
              "title": "Microstep title",
              "description": "Specific action to take",
              "estimatedHours": 4,
              "dependencies": [],
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

CRITICAL JSON FORMATTING RULES:
- Use simple, short descriptions (max 200 characters each)
- Do NOT use special characters, quotes, or apostrophes in descriptions
- Keep descriptions factual and technical
- ALL string values must be properly escaped
- Ensure valid JSON syntax throughout

PROJECT PLANNING RULES:
- Create 3-5 milestones for a complete project
- Each milestone should have 2-3 steps
- Each step should have 2-3 microsteps
- Keep milestone/step/microstep titles concise (max 60 characters)
- Include realistic time estimates
- Focus on technical implementation based on the PRD features
- First milestone should always be Architecture & Setup
- Include recommended technology stack and architecture decisions`
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
        temperature: 0.2,
        max_tokens: 8000,
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

    // Try to parse JSON with better error handling
    let plan;
    try {
      plan = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Attempted to parse:', jsonStr.substring(0, 500) + '...');

      // Try to fix common JSON issues
      try {
        // Remove any trailing commas before closing braces/brackets
        const fixedJson = jsonStr
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/[\u0000-\u001F]+/g, ''); // Remove control characters

        plan = JSON.parse(fixedJson);
        console.log('Successfully parsed JSON after fixing common issues');
      } catch (secondError) {
        throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }

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
