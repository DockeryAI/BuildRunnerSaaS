import { NextRequest, NextResponse } from 'next/server';
import { OIDCProvider, loadOIDCConfig } from '../../../../../lib/sso/oidc';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgSlug = searchParams.get('org');
    const idpName = searchParams.get('idp');
    const returnUrl = searchParams.get('return_url') || '/dashboard';

    if (!orgSlug) {
      return NextResponse.json({
        error: 'Organization slug is required',
      }, { status: 400 });
    }

    // Get organization
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .select('id, name, sso_required')
      .eq('slug', orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({
        error: 'Organization not found',
      }, { status: 404 });
    }

    // Load OIDC configuration
    const oidcConfig = await loadOIDCConfig(org.id, idpName || undefined);
    
    if (!oidcConfig) {
      return NextResponse.json({
        error: 'OIDC configuration not found or disabled',
      }, { status: 404 });
    }

    // Create OIDC provider instance
    const provider = new OIDCProvider(oidcConfig);

    // Generate authorization URL
    const redirectUri = `${request.nextUrl.origin}/api/sso/oidc/callback`;
    const { url, state, codeVerifier } = await provider.getAuthorizationUrl(redirectUri);

    // Store state and code verifier in session/cookie for callback
    const sessionData = {
      state,
      codeVerifier,
      orgId: org.id,
      idpId: oidcConfig.id,
      returnUrl,
      timestamp: Date.now(),
    };

    // In production, this should be stored in a secure session store
    // For now, we'll use a signed cookie or session
    const response = NextResponse.redirect(url);
    
    // Set secure session cookie
    response.cookies.set('oidc_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Log audit event
    await supabase
      .from('audit_ledger')
      .insert([{
        org_id: org.id,
        actor: 'system',
        action: 'sso_login_initiated',
        resource_type: 'authentication',
        payload: {
          org_slug: orgSlug,
          idp_name: oidcConfig.name,
          idp_type: 'oidc',
          return_url: returnUrl,
        },
        metadata: {
          user_agent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
        },
        ip_address: request.ip || request.headers.get('x-forwarded-for'),
      }]);

    return response;

  } catch (error) {
    console.error('[SSO_OIDC_START] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to initiate OIDC authentication',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_slug, idp_name, return_url } = body;

    if (!org_slug) {
      return NextResponse.json({
        error: 'Organization slug is required',
      }, { status: 400 });
    }

    // Get organization
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .select('id, name, sso_required')
      .eq('slug', org_slug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({
        error: 'Organization not found',
      }, { status: 404 });
    }

    // Load OIDC configuration
    const oidcConfig = await loadOIDCConfig(org.id, idp_name);
    
    if (!oidcConfig) {
      return NextResponse.json({
        error: 'OIDC configuration not found or disabled',
      }, { status: 404 });
    }

    // Create OIDC provider instance
    const provider = new OIDCProvider(oidcConfig);

    // Generate authorization URL
    const redirectUri = `${request.nextUrl.origin}/api/sso/oidc/callback`;
    const { url, state, codeVerifier } = await provider.getAuthorizationUrl(redirectUri);

    // Return the URL and session data for client-side handling
    return NextResponse.json({
      authorization_url: url,
      session_data: {
        state,
        code_verifier: codeVerifier,
        org_id: org.id,
        idp_id: oidcConfig.id,
        return_url: return_url || '/dashboard',
      },
    });

  } catch (error) {
    console.error('[SSO_OIDC_START_POST] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to generate OIDC authorization URL',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
