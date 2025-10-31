import { NextRequest, NextResponse } from 'next/server';
import { ListPacksRequestSchema, CreateTemplatePackSchema } from '../../../../lib/templates/schemas';
import { TemplateStorage } from '../../../../lib/templates/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryParams = {
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      public: searchParams.get('public') === 'true' ? true : undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Validate request
    const validationResult = ListPacksRequestSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const options = validationResult.data;
    
    // Get packs
    const result = await TemplateStorage.listPacks(options);
    
    return NextResponse.json({
      packs: result.packs,
      total: result.total,
      limit: options.limit,
      offset: options.offset,
    });

  } catch (error) {
    console.error('[PACKS_LIST] Error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validationResult = CreateTemplatePackSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid pack data',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const packData = validationResult.data;
    
    // Create pack
    const pack = await TemplateStorage.createPack(packData);
    
    return NextResponse.json(pack, { status: 201 });

  } catch (error) {
    console.error('[PACKS_CREATE] Error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
