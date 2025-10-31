import { NextRequest, NextResponse } from 'next/server';
import { OIDCProvider, loadOIDCConfig } from '../../../../../lib/sso/oidc';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('OIDC OAuth error:', error, errorDescription);
      
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/auth/error?error=missing_parameters', request.url)
      );
    }

    // Retrieve session data from cookie
    const sessionCookie = request.cookies.get('oidc_session');
    if (!sessionCookie) {
      return NextResponse.redirect(
        new URL('/auth/error?error=session_expired', request.url)
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (error) {
      return NextResponse.redirect(
        new URL('/auth/error?error=invalid_session', request.url)
      );
    }

    // Validate state parameter
    if (sessionData.state !== state) {
      return NextResponse.redirect(
        new URL('/auth/error?error=invalid_state', request.url)
      );
    }

    // Check session timeout (10 minutes)
    if (Date.now() - sessionData.timestamp > 600000) {
      return NextResponse.redirect(
        new URL('/auth/error?error=session_expired', request.url)
      );
    }

    // Load OIDC configuration
    const oidcConfig = await loadOIDCConfig(sessionData.orgId);
    
    if (!oidcConfig || oidcConfig.id !== sessionData.idpId) {
      return NextResponse.redirect(
        new URL('/auth/error?error=configuration_error', request.url)
      );
    }

    // Create OIDC provider instance
    const provider = new OIDCProvider(oidcConfig);

    // Exchange code for tokens
    const redirectUri = `${request.nextUrl.origin}/api/sso/oidc/callback`;
    const tokens = await provider.exchangeCodeForTokens(
      code,
      redirectUri,
      sessionData.codeVerifier
    );

    // Validate ID token
    const idTokenPayload = await provider.validateIdToken(tokens.idToken);

    // Get user info
    const userInfo = await provider.getUserInfo(tokens.accessToken);

    // Provision or update user
    const { userId, isNewUser } = await provider.provisionUser(userInfo);

    // Create SSO session
    const { data: ssoSession, error: sessionError } = await supabase
      .from('sso_sessions')
      .insert([{
        org_id: sessionData.orgId,
        idp_id: sessionData.idpId,
        user_id: userId,
        session_id: `oidc_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        oidc_id_token_hash: createHash(tokens.idToken),
        expires_at: new Date(Date.now() + (tokens.expiresIn * 1000)).toISOString(),
      }])
      .select()
      .single();

    if (sessionError) {
      console.error('Failed to create SSO session:', sessionError);
      return NextResponse.redirect(
        new URL('/auth/error?error=session_creation_failed', request.url)
      );
    }

    // Log successful authentication
    await supabase
      .from('audit_ledger')
      .insert([{
        org_id: sessionData.orgId,
        actor: userId,
        action: 'sso_login_completed',
        resource_type: 'authentication',
        payload: {
          idp_name: oidcConfig.name,
          idp_type: 'oidc',
          user_email: userInfo.email,
          is_new_user: isNewUser,
          session_id: ssoSession.session_id,
        },
        metadata: {
          user_agent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
          id_token_sub: idTokenPayload.sub,
        },
        ip_address: request.ip || request.headers.get('x-forwarded-for'),
      }]);

    // Clear OIDC session cookie
    const response = NextResponse.redirect(
      new URL(sessionData.returnUrl || '/dashboard', request.url)
    );
    
    response.cookies.delete('oidc_session');

    // Set authentication session (this would integrate with your auth system)
    // For now, we'll set a simple session cookie
    response.cookies.set('auth_session', JSON.stringify({
      userId,
      orgId: sessionData.orgId,
      sessionId: ssoSession.session_id,
      expiresAt: ssoSession.expires_at,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expiresIn,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('[SSO_OIDC_CALLBACK] Error:', error);
    
    // Log failed authentication attempt
    try {
      await supabase
        .from('audit_ledger')
        .insert([{
          actor: 'system',
          action: 'sso_login_failed',
          resource_type: 'authentication',
          payload: {
            error: error instanceof Error ? error.message : 'Unknown error',
            idp_type: 'oidc',
          },
          metadata: {
            user_agent: request.headers.get('user-agent'),
            timestamp: new Date().toISOString(),
          },
          ip_address: request.ip || request.headers.get('x-forwarded-for'),
        }]);
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }
    
    return NextResponse.redirect(
      new URL(`/auth/error?error=authentication_failed&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
    );
  }
}

/**
 * Create hash of token for storage (for logout purposes)
 */
function createHash(token: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}
