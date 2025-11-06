/**
 * API route to generate random product idea examples using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Fallback examples if AI generation fails
const FALLBACK_EXAMPLES = [
  'A mobile app that connects dog owners in the same neighborhood for coordinated group walks and playdates',
  'An AI-powered meal planning service that generates recipes based on ingredients about to expire in your fridge',
  'A platform that helps freelancers automatically track billable hours using screen activity and calendar integration',
];

function getOpenRouterKey(): string {
  // Try to load from .api-keys.json file first
  try {
    const keysFile = path.join(process.cwd(), '.api-keys.json');
    if (fs.existsSync(keysFile)) {
      const keysContent = fs.readFileSync(keysFile, 'utf-8');
      const keys = JSON.parse(keysContent);
      if (keys.openrouter) {
        return keys.openrouter;
      }
    }
  } catch (error) {
    console.log('Could not load OpenRouter key from .api-keys.json');
  }

  // Fallback to environment variable
  return process.env.OPENROUTER_API_KEY || '';
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 generate-examples called');

    // Try to get API key from request headers (client-provided) first
    let apiKey = '';
    const apiKeysHeader = request.headers.get('x-api-keys');
    console.log('  x-api-keys header present:', !!apiKeysHeader);

    if (apiKeysHeader) {
      try {
        const apiKeys = JSON.parse(apiKeysHeader);
        console.log('  parsed API keys:', Object.keys(apiKeys));
        if (apiKeys.openrouter) {
          apiKey = apiKeys.openrouter;
          console.log('✅ Using client-provided OpenRouter key from UI');
        }
      } catch (e) {
        console.warn('Failed to parse API keys from headers:', e);
      }
    }

    // Fallback to server-side keys if no client key provided
    if (!apiKey) {
      console.log('  No client key, trying server-side keys...');
      apiKey = getOpenRouterKey();
      if (apiKey) {
        console.log('✅ Using server-side OpenRouter key');
      }
    }

    if (!apiKey) {
      console.warn('❌ No OpenRouter API key available, using fallback examples');
      return NextResponse.json({
        success: true,
        examples: FALLBACK_EXAMPLES,
        source: 'fallback',
      });
    }

    console.log('🤖 Calling OpenRouter AI to generate examples...');

    const prompt = `Generate 3 unique, creative, and realistic product ideas for a startup or app.
Each idea should be:
- Specific and actionable
- Solve a real problem
- Be 1-2 sentences long
- Cover different industries/domains
- Be modern and relevant

Format: Return ONLY a JSON array of 3 strings, nothing else.
Example format: ["idea 1", "idea 2", "idea 3"]`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner SaaS',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-haiku',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 1.2, // Higher temperature for more creative/varied responses
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status);
      return NextResponse.json({
        success: true,
        examples: FALLBACK_EXAMPLES,
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Parse the JSON response
    let examples: string[] = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        examples = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      examples = FALLBACK_EXAMPLES;
    }

    // Ensure we have exactly 3 examples
    if (examples.length < 3) {
      console.warn('⚠️ AI returned <3 examples, using fallback');
      examples = FALLBACK_EXAMPLES;
    }

    const isAIGenerated = examples !== FALLBACK_EXAMPLES;
    if (isAIGenerated) {
      console.log('✨ Successfully generated 3 AI examples');
    }

    return NextResponse.json({
      success: true,
      examples: examples.slice(0, 3),
      source: isAIGenerated ? 'ai' : 'fallback',
    });
  } catch (error: any) {
    console.error('❌ Error generating examples:', error);

    // Return fallback examples instead of error
    return NextResponse.json({
      success: true,
      examples: FALLBACK_EXAMPLES,
      source: 'fallback',
    });
  }
}
