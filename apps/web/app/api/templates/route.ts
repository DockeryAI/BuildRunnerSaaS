import { NextRequest, NextResponse } from 'next/server';
import { ListTemplatesRequestSchema, CreateTemplateDefSchema } from '../../../lib/templates/schemas';
import { TemplateStorage } from '../../../lib/templates/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryParams = {
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      public: searchParams.get('public') === 'true' ? true : undefined,
      author_id: searchParams.get('author_id') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sort: searchParams.get('sort') as 'created_at' | 'installs_count' | 'title' || 'created_at',
      order: searchParams.get('order') as 'asc' | 'desc' || 'desc',
    };

    // Validate request
    const validationResult = ListTemplatesRequestSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const options = validationResult.data;
    
    // Get templates
    const result = await TemplateStorage.listTemplates(options);
    
    return NextResponse.json({
      templates: result.templates,
      total: result.total,
      limit: options.limit,
      offset: options.offset,
    });

  } catch (error) {
    console.error('[TEMPLATES_LIST] Error:', error);
    
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
    const validationResult = CreateTemplateDefSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid template data',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const templateData = validationResult.data;
    
    // Create template
    const template = await TemplateStorage.createTemplate(templateData);
    
    return NextResponse.json(template, { status: 201 });

  } catch (error) {
    console.error('[TEMPLATES_CREATE] Error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
