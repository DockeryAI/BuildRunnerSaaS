import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const KEYS_FILE = path.join(process.cwd(), '.api-keys.json');

export async function POST(request: NextRequest) {
  try {
    const apiKeys = await request.json();

    console.log('API keys received for saving:', Object.keys(apiKeys));

    // Save to filesystem (secure in production environment)
    await fs.writeFile(KEYS_FILE, JSON.stringify(apiKeys, null, 2), 'utf-8');

    console.log('✅ API keys saved to:', KEYS_FILE);

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
    // Try to load from filesystem
    let keys = {};

    try {
      const fileContent = await fs.readFile(KEYS_FILE, 'utf-8');
      keys = JSON.parse(fileContent);
      console.log('✅ API keys loaded from:', KEYS_FILE);
    } catch (error) {
      // File doesn't exist yet - return empty
      console.log('No saved API keys found');
    }

    return NextResponse.json({
      success: true,
      keys,
    });

  } catch (error) {
    console.error('Error loading API keys:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load API keys' },
      { status: 500 }
    );
  }
}
