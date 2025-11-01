'use client';

import { useState } from 'react';
import { useConnectionStore } from '@/lib/stores/connection-store';

export default function TestGitHubOAuth() {
  const [status, setStatus] = useState<string>('Not connected');
  const [error, setError] = useState<string | null>(null);
  const { connections, isConnected, getConnection } = useConnectionStore();

  const handleConnect = () => {
    try {
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`;

      if (!clientId) {
        setError('NEXT_PUBLIC_GITHUB_CLIENT_ID not found in environment');
        return;
      }

      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('github_oauth_state', state);

      const scopes = ['repo', 'user:email', 'read:org'];
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scopes.join(' '),
        state,
      });

      const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

      setStatus('Redirecting to GitHub...');
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const githubConnection = getConnection('github');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GitHub OAuth Test
          </h1>
          <p className="text-gray-600 mb-8">
            Test the GitHub OAuth integration
          </p>

          {/* Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                isConnected('github')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isConnected('github') ? '✓ Connected' : '○ Not Connected'}
              </span>
            </div>

            {githubConnection && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Username:</span>{' '}
                  {githubConnection.metadata?.username || 'N/A'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Connected:</span>{' '}
                  {new Date(githubConnection.connectedAt).toLocaleString()}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Token:</span>{' '}
                  <code className="text-xs bg-white px-2 py-1 rounded">
                    {githubConnection.oauth?.accessToken?.substring(0, 10)}...
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-red-600 font-semibold mr-2">Error:</span>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
              <div className="mt-2 text-xs text-red-600">
                Make sure you've added GITHUB_CLIENT_ID to .env.local
              </div>
            </div>
          )}

          {/* Connect Button */}
          {!isConnected('github') ? (
            <button
              onClick={handleConnect}
              className="w-full py-3 px-6 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>Connect with GitHub</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="text-green-800 font-semibold mb-1">
                  ✓ GitHub Connected Successfully!
                </div>
                <div className="text-green-600 text-sm">
                  BuildRunner can now create repos and push code
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm('Disconnect GitHub?')) {
                    const connection = getConnection('github');
                    if (connection) {
                      useConnectionStore.getState().removeConnection(connection.id);
                      setStatus('Disconnected');
                    }
                  }
                }}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Create GitHub OAuth App at github.com/settings/developers</li>
              <li>Set callback URL to: <code className="bg-white px-1 py-0.5 rounded text-xs">http://localhost:3005/api/auth/github/callback</code></li>
              <li>Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env.local</li>
              <li>Restart dev server</li>
              <li>Click "Connect with GitHub" above</li>
            </ol>
          </div>

          {/* Debug Info */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
              Debug Info
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-48">
              <div>Client ID: {process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'NOT SET'}</div>
              <div>App URL: {process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'}</div>
              <div>Callback: {process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback</div>
              <div className="mt-2">All Connections: {JSON.stringify(connections, null, 2)}</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
