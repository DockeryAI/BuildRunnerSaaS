import { NextRequest, NextResponse } from 'next/server';
import modelRouting from '../../../../../server/config/model-routing.json';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      categories: modelRouting.categories,
      prompts: modelRouting.prompts,
      models: Object.keys(modelRouting.models),
    });
  } catch (error) {
    console.error('Error loading brainstorm config:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}
