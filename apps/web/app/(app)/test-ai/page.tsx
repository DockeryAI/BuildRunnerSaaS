'use client';

import { useState } from 'react';

export default function TestAIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAI = async () => {
    setLoading(true);
    try {
      // Get API keys from localStorage (same as the main app)
      const savedKeys = localStorage.getItem('buildrunner_api_keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      
      console.log('Testing with API keys:', apiKeys);

      const response = await fetch('/api/test-ai', {
        method: 'GET',
        headers: {
          'x-api-keys': JSON.stringify(apiKeys),
        },
      });

      const data = await response.json();
      setResult(data);
      console.log('Test result:', data);
    } catch (error) {
      console.error('Test error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">AI Connection Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={testAI}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test AI Connection'}
        </button>

        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Make sure you have set your OpenRouter API key in Settings</li>
            <li>Click "Test AI Connection" to verify it works</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
