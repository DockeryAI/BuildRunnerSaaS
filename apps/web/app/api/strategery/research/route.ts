import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiName, docsUrl, setupUrl } = body;

    // Get API keys from headers
    const apiKeysHeader = request.headers.get('x-api-keys');
    const apiKeys = apiKeysHeader ? JSON.parse(apiKeysHeader) : {};

    // Use OpenRouter API key from header or fallback to environment variable
    const openrouterApiKey = apiKeys.openrouter || process.env.OPENROUTER_API_KEY;

    if (!openrouterApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 400 }
      );
    }

    // Fetch the documentation page content
    let docsContent = '';
    let setupContent = '';

    try {
      // Fetch documentation
      const docsResponse = await fetch(docsUrl, {
        headers: {
          'User-Agent': 'BuildRunner-APIAssistant/1.0',
        },
      });

      if (docsResponse.ok) {
        const html = await docsResponse.text();
        // Extract text content (simplified - in production use a proper HTML parser)
        docsContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .substring(0, 5000); // Limit to 5000 chars
      }

      // Fetch setup page if provided
      if (setupUrl) {
        const setupResponse = await fetch(setupUrl, {
          headers: {
            'User-Agent': 'BuildRunner-APIAssistant/1.0',
          },
        });

        if (setupResponse.ok) {
          const html = await setupResponse.text();
          setupContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .substring(0, 3000);
        }
      }
    } catch (fetchError) {
      console.error('Error fetching documentation:', fetchError);
      // Continue with AI generation even if fetch fails
    }

    // Use AI to analyze and summarize the documentation
    const systemPrompt = `You are an API documentation expert. Your job is to help developers understand and set up APIs quickly and accurately.

When given API documentation, you should:
1. Identify the key steps to get started
2. Explain how to obtain API keys
3. Provide clear setup instructions
4. Show code examples if available
5. Highlight common gotchas or important notes
6. Provide the CURRENT, UP-TO-DATE information from the actual documentation

Be concise, practical, and helpful. Focus on what developers need to know RIGHT NOW to get started.`;

    const userPrompt = `I need help with the ${apiName} API. Here's what I found from their current documentation:

${docsContent ? `Documentation (${docsUrl}):\n${docsContent}\n\n` : ''}
${setupContent ? `Setup Guide (${setupUrl}):\n${setupContent}\n\n` : ''}

Please provide:
1. How to get an API key (specific steps, current as of today)
2. Quick setup guide
3. Key configuration details
4. Common first steps
5. Important notes or gotchas

Format this as a helpful, step-by-step guide.`;

    // Call OpenRouter API with a model that can handle web content
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner SaaS - API Research Assistant',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more factual responses
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to research API documentation' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({
      response: aiResponse,
      summary: `Latest information for ${apiName} retrieved from ${docsUrl}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in API research:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to research API' },
      { status: 500 }
    );
  }
}
