import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { keyId, value } = await request.json();
    
    if (!keyId || !value) {
      return NextResponse.json(
        { success: false, error: 'Key ID and value are required' },
        { status: 400 }
      );
    }

    let testResult = { success: false, error: 'Unknown key type' };

    switch (keyId) {
      case 'openrouter':
        testResult = await testOpenRouter(value);
        break;
      case 'supabase_url':
        testResult = await testSupabaseUrl(value);
        break;
      case 'supabase_anon_key':
        testResult = await testSupabaseKey(value);
        break;
      case 'crunchbase':
        testResult = await testCrunchbase(value);
        break;
      case 'producthunt':
        testResult = await testProductHunt(value);
        break;
      default:
        testResult = { success: false, error: `Unknown key type: ${keyId}` };
    }

    return NextResponse.json(testResult);
  } catch (error) {
    console.error('Error testing connection:', error);
    return NextResponse.json(
      { success: false, error: 'Connection test failed' },
      { status: 500 }
    );
  }
}

async function testOpenRouter(apiKey: string) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: `Connected successfully. Found ${data.data?.length || 0} available models.` 
      };
    } else {
      const error = await response.text();
      return { 
        success: false, 
        error: `OpenRouter API error: ${response.status} - ${error}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: `OpenRouter connection failed: ${error.message}` 
    };
  }
}

async function testSupabaseUrl(url: string) {
  try {
    // Basic URL validation
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('supabase')) {
      return { 
        success: false, 
        error: 'URL does not appear to be a Supabase URL' 
      };
    }

    // Test basic connectivity
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'HEAD',
    });

    if (response.status === 401 || response.status === 200) {
      // 401 is expected without auth, 200 means it's accessible
      return { 
        success: true, 
        message: 'Supabase URL is valid and accessible' 
      };
    } else {
      return { 
        success: false, 
        error: `Supabase URL test failed: ${response.status}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: `Invalid Supabase URL: ${error.message}` 
    };
  }
}

async function testSupabaseKey(key: string) {
  try {
    // Basic key format validation
    if (!key.startsWith('eyJ')) {
      return { 
        success: false, 
        error: 'Supabase key format appears invalid' 
      };
    }

    // Try to decode the JWT to validate format
    const parts = key.split('.');
    if (parts.length !== 3) {
      return { 
        success: false, 
        error: 'Supabase key is not a valid JWT format' 
      };
    }

    try {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.role !== 'anon') {
        return { 
          success: false, 
          error: 'This appears to be a service role key, not an anon key' 
        };
      }
    } catch (e) {
      return { 
        success: false, 
        error: 'Could not decode Supabase key' 
      };
    }

    return { 
      success: true, 
      message: 'Supabase anon key format is valid' 
    };
  } catch (error) {
    return { 
      success: false, 
      error: `Supabase key validation failed: ${error.message}` 
    };
  }
}

async function testCrunchbase(apiKey: string) {
  try {
    const response = await fetch('https://api.crunchbase.com/api/v4/entities/organizations?limit=1', {
      headers: {
        'X-cb-user-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { 
        success: true, 
        message: 'Crunchbase API key is valid' 
      };
    } else {
      const error = await response.text();
      return { 
        success: false, 
        error: `Crunchbase API error: ${response.status} - ${error}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: `Crunchbase connection failed: ${error.message}` 
    };
  }
}

async function testProductHunt(apiKey: string) {
  try {
    const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ viewer { user { name } } }'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.errors) {
        return { 
          success: false, 
          error: `ProductHunt API error: ${data.errors[0]?.message}` 
        };
      }
      return { 
        success: true, 
        message: 'ProductHunt API key is valid' 
      };
    } else {
      const error = await response.text();
      return { 
        success: false, 
        error: `ProductHunt API error: ${response.status} - ${error}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: `ProductHunt connection failed: ${error.message}` 
    };
  }
}
