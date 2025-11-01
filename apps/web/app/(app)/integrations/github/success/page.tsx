'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useConnectionStore } from '@/lib/stores/connection-store';

export default function GitHubSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing...');
  const { addConnection } = useConnectionStore();

  useEffect(() => {
    const data = searchParams.get('data');

    if (!data) {
      setStatus('No connection data received');
      return;
    }

    try {
      // Decode the connection data
      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const connectionData = JSON.parse(decoded);

      // Save to store
      addConnection({
        userId: 'current-user', // In production, get from auth
        integrationType: 'github',
        status: 'connected',
        oauth: {
          accessToken: connectionData.accessToken,
          tokenType: 'bearer',
          scope: 'repo user:email read:org',
        },
        metadata: {
          username: connectionData.username,
          avatarUrl: connectionData.avatarUrl,
          email: connectionData.email,
        },
      });

      setStatus('✓ GitHub connected successfully!');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/test-github');
      }, 2000);
    } catch (error: any) {
      console.error('Error processing GitHub connection:', error);
      setStatus('Error: ' + error.message);
    }
  }, [searchParams, addConnection, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="mb-4">
          {status.includes('✓') ? (
            <div className="text-6xl mb-4">✓</div>
          ) : (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          GitHub OAuth
        </h1>
        <p className="text-gray-600">{status}</p>
        {status.includes('✓') && (
          <p className="text-sm text-gray-500 mt-4">
            Redirecting to test page...
          </p>
        )}
      </div>
    </div>
  );
}
