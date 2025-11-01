/**
 * API route to generate project names based on product idea
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    const { productIdea } = await request.json();

    if (!productIdea) {
      return NextResponse.json(
        { error: 'Product idea is required' },
        { status: 400 }
      );
    }

    const apiKey = getOpenRouterKey();

    if (!apiKey) {
      // Return a simple default name if no API key
      const defaultName = productIdea
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim()
        .substring(0, 30)
        .replace(/\s+/g, '-')
        .toLowerCase();

      return NextResponse.json({
        success: true,
        names: [defaultName, `${defaultName}-app`, `${defaultName}-platform`],
      });
    }

    const prompt = `Based on this product idea: "${productIdea.substring(0, 200)}"

Generate 5 short, memorable project names suitable for a Supabase project. Each name should be:
- 3-20 characters
- lowercase
- use hyphens instead of spaces
- be professional and descriptive
- avoid special characters

Return ONLY a JSON array of 5 strings, nothing else.
Example format: ["project-name-1", "project-name-2", "project-name-3", "project-name-4", "project-name-5"]`;

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
        temperature: 0.9,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenRouter API error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Parse the JSON response
    let names: string[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        names = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
    }

    // Fallback if parsing failed or names are empty
    if (names.length === 0) {
      const defaultName = productIdea
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim()
        .substring(0, 30)
        .replace(/\s+/g, '-')
        .toLowerCase();

      names = [defaultName, `${defaultName}-app`, `${defaultName}-platform`];
    }

    return NextResponse.json({
      success: true,
      names: names.slice(0, 5),
    });
  } catch (error: any) {
    console.error('Error generating project names:', error);

    // Return fallback names on error
    return NextResponse.json({
      success: true,
      names: ['my-project', 'my-app', 'my-platform'],
    });
  }
}
