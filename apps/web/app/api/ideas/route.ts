import { NextRequest, NextResponse } from 'next/server';

interface Idea {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'archived' | 'completed';
  messages_count: number;
  suggestions_count: number;
}

// In-memory storage for now (will be replaced with GitHub integration)
let ideas: Idea[] = [];

export async function GET(request: NextRequest) {
  try {
    // Load ideas from localStorage simulation (in real app, this would be GitHub)
    const savedIdeas = ideas.length > 0 ? ideas : [];
    
    return NextResponse.json({
      success: true,
      ideas: savedIdeas,
    });
  } catch (error) {
    console.error('Error loading ideas:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load ideas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();
    
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const newIdea: Idea = {
      id: `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      messages_count: 0,
      suggestions_count: 0,
    };

    ideas.push(newIdea);
    
    // In real app, this would save to GitHub
    console.log('Created new idea:', newIdea.id, newIdea.title);
    
    return NextResponse.json({
      success: true,
      idea: newIdea,
    });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, status } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Idea ID is required' },
        { status: 400 }
      );
    }

    const ideaIndex = ideas.findIndex(idea => idea.id === id);
    if (ideaIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Update the idea
    ideas[ideaIndex] = {
      ...ideas[ideaIndex],
      ...(title && { title: title.trim() }),
      ...(description && { description: description.trim() }),
      ...(status && { status }),
      updated_at: new Date().toISOString(),
    };
    
    console.log('Updated idea:', ideas[ideaIndex].id, ideas[ideaIndex].title);
    
    return NextResponse.json({
      success: true,
      idea: ideas[ideaIndex],
    });
  } catch (error) {
    console.error('Error updating idea:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update idea' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Idea ID is required' },
        { status: 400 }
      );
    }

    const ideaIndex = ideas.findIndex(idea => idea.id === id);
    if (ideaIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }

    const deletedIdea = ideas.splice(ideaIndex, 1)[0];
    console.log('Deleted idea:', deletedIdea.id, deletedIdea.title);
    
    return NextResponse.json({
      success: true,
      message: 'Idea deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting idea:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete idea' },
      { status: 500 }
    );
  }
}
