/**
 * GitHub OAuth Callback Handler
 *
 * Handles the OAuth callback from GitHub after user authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { GitHubOAuthClient } from '@/lib/integrations/github-oauth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth error
  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=${error}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=no_code`
    );
  }

  try {
    // Exchange code for access token
    const tokenData = await GitHubOAuthClient.exchangeCodeForToken(code);

    // Get user info
    const githubClient = new GitHubOAuthClient();
    const user = await githubClient.getUser(tokenData.accessToken);

    // Store connection in database/session
    // For now, we'll pass it via URL params (in production, use secure session)
    const connectionData = {
      accessToken: tokenData.accessToken,
      username: user.login,
      avatarUrl: user.avatarUrl,
      email: user.email,
    };

    // Encode and pass to frontend
    const encoded = Buffer.from(JSON.stringify(connectionData)).toString('base64');

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations/github/success?data=${encoded}`
    );
  } catch (error: any) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=${encodeURIComponent(error.message)}`
    );
  }
}
