import { NextRequest, NextResponse } from 'next/server';

/**
 * Parse user prompt and extract PRD sections
 *
 * This endpoint takes a raw product idea and extracts:
 * - Executive summary
 * - Problem statement
 * - Features (REQUIRED - extracted from description)
 * - Target audience
 * - Value proposition
 * - Any other sections that can be inferred
 *
 * CRITICAL: Only extract what's in the prompt. Don't make things up.
 */
export async function POST(request: NextRequest) {
  try {
    const { productIdea } = await request.json();

    if (!productIdea) {
      return NextResponse.json(
        { error: 'Product idea is required' },
        { status: 400 }
      );
    }

    // Get API key from headers
    const apiKeysHeader = request.headers.get('x-api-keys');
    let openrouterKey = '';

    if (apiKeysHeader) {
      try {
        const keys = JSON.parse(apiKeysHeader);
        openrouterKey = keys.openrouter || '';
      } catch (e) {
        console.warn('Failed to parse API keys:', e);
      }
    }

    // Fallback to env
    if (!openrouterKey) {
      openrouterKey = process.env.OPENROUTER_API_KEY || '';
    }

    if (!openrouterKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 400 }
      );
    }

    console.log('🔍 Parsing prompt to extract PRD sections...');
    console.log('Prompt:', productIdea.substring(0, 100) + '...');

    // Call AI to parse the prompt into structured PRD sections
    const systemPrompt = `You are a product requirements analyst. Your job is to parse user product descriptions and extract structured PRD sections.

CRITICAL RULES:
1. ONLY extract information that is EXPLICITLY stated in the user's description
2. DO NOT make up features, audiences, or details that aren't mentioned
3. If something isn't clear from the description, leave that section empty
4. For features: Extract each distinct capability mentioned by the user
5. Each feature must be something the user actually described
6. Rewrite the executive summary to be professional but stay true to the original
7. If no features can be extracted, the description is too vague - request more details

Return a JSON object with this structure:
{
  "sections": {
    "executive_summary": [
      {
        "id": "exec_001",
        "title": "Product Overview",
        "description": "Professional rewrite of the product idea"
      }
    ],
    "problem_statement": [
      {
        "id": "prob_001",
        "title": "Problem Being Solved",
        "description": "What problem does this solve? (only if mentioned)"
      }
    ],
    "target_audience": [
      {
        "id": "aud_001",
        "title": "Target Users",
        "description": "Who is this for? (only if mentioned)"
      }
    ],
    "value_proposition": [
      {
        "id": "val_001",
        "title": "Key Value",
        "description": "What value does it provide? (only if mentioned)"
      }
    ],
    "features": [
      {
        "id": "feat_001",
        "title": "Feature Name",
        "description": "What this feature does (ONLY features user described)"
      }
    ]
  },
  "hasFeatures": true,
  "needsMoreInfo": false,
  "missingInfo": []
}

IMPORTANT:
- "features" array is REQUIRED and must have at least 1 item
- If you can't extract any features, set hasFeatures: false and explain what's missing
- Don't invent features that weren't described
- Each feature must be clearly stated in the original description`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner - Prompt Parser',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash', // Fast for parsing
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Parse this product idea and extract PRD sections. Remember: ONLY extract what's explicitly stated, don't make up features.\n\nProduct Idea:\n${productIdea}\n\nReturn the JSON structure.`
          }
        ],
        temperature: 0.1, // Very low - we want extraction, not creativity
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return NextResponse.json(
        { error: 'Failed to parse prompt' },
        { status: 500 }
      );
    }

    const data = await response.json();
    let parsedContent = data.choices[0].message.content;

    // Extract JSON from response
    const jsonMatch = parsedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', parsedContent);
      return NextResponse.json(
        { error: 'Failed to parse response' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    console.log('✅ Parsed PRD sections:');
    console.log('- Features extracted:', parsed.sections.features?.length || 0);
    console.log('- Has executive summary:', !!parsed.sections.executive_summary?.length);
    console.log('- Has features:', parsed.hasFeatures);

    if (!parsed.hasFeatures) {
      console.warn('⚠️  No features could be extracted from prompt');
      return NextResponse.json({
        sections: parsed.sections || {},
        hasFeatures: false,
        needsMoreInfo: true,
        missingInfo: parsed.missingInfo || ['Features: Describe what your app should do'],
        message: 'Please provide more details about what features your app should have'
      });
    }

    return NextResponse.json({
      sections: parsed.sections,
      hasFeatures: true,
      needsMoreInfo: false,
      missingInfo: []
    });

  } catch (error) {
    console.error('Error parsing prompt:', error);
    return NextResponse.json(
      { error: `Failed to parse prompt: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
