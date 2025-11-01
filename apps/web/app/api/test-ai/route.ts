import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing AI connection...');
    
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 500 });
    }

    console.log('API key found, making test call...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner SaaS - Test',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-4-sonnet-20250522',
        messages: [
          {
            role: 'user',
            content: 'Generate a simple JSON array with one suggestion: [{"id": "test", "title": "Test Suggestion", "shortDescription": "This is a test", "fullDescription": "This is a test suggestion", "citations": ["Test source"], "priority": "high", "section": "test"}]'
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', errorText);
      return NextResponse.json({ 
        error: `API error: ${response.status} - ${errorText}` 
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('API response:', data);

    const content = data.choices[0]?.message?.content;
    console.log('AI content:', content);

    return NextResponse.json({
      success: true,
      content,
      data
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
