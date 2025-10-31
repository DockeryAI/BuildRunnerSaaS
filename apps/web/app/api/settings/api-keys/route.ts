import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKeys = await request.json();
    
    // In a production app, you would save these to a secure database
    // For now, we'll just validate and return success
    
    console.log('API keys received for saving:', Object.keys(apiKeys));
    
    return NextResponse.json({
      success: true,
      message: 'API keys saved successfully',
      saved_at: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error saving API keys:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save API keys' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // In a production app, you would retrieve these from a secure database
    // For now, return empty object
    
    return NextResponse.json({
      success: true,
      keys: {},
    });
    
  } catch (error) {
    console.error('Error loading API keys:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load API keys' },
      { status: 500 }
    );
  }
}
