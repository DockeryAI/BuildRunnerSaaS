'use client';

import { useState, useEffect, useRef } from 'react';
import { ExternalLink, RefreshCw, AlertCircle, MessageSquare, X, Check } from 'lucide-react';
import ChatPanel from './ChatPanel';

interface LivePreviewTabProps {
  projectName: string;
  previewUrl?: string;
}

interface BuildMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CodeChange {
  file: string;
  oldCode: string;
  newCode: string;
  description?: string;
}

interface PreviewContext {
  route: string;
  component?: string;
  viewport: string;
  url: string;
}

export default function LivePreviewTab({
  projectName,
  previewUrl = 'http://localhost:3002'
}: LivePreviewTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<BuildMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I can help you make changes to your app. Describe what you\'d like to modify, and I\'ll generate the code changes for you to review.',
      timestamp: new Date(),
    },
  ]);
  const [pendingChanges, setPendingChanges] = useState<CodeChange[]>([]);
  const [showApproval, setShowApproval] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(previewUrl, '_blank');
  };

  const collectContext = (): PreviewContext => {
    // Get current route from iframe URL
    let route = '/';
    let iframeUrl = previewUrl;

    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeUrl = iframeRef.current.contentWindow.location.href;
        const url = new URL(iframeUrl);
        route = url.pathname;
      } catch (e) {
        // Cross-origin restrictions - use default
      }
    }

    // Get viewport dimensions
    const viewport = iframeRef.current
      ? `${iframeRef.current.offsetWidth}x${iframeRef.current.offsetHeight}`
      : '1920x1080';

    return {
      route,
      viewport,
      url: iframeUrl,
    };
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: BuildMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const currentProjectId = localStorage.getItem('currentProjectId');
      const buildId = currentProjectId; // Or get from URL/props

      if (!buildId) {
        throw new Error('No build ID found');
      }

      const context = collectContext();

      const response = await fetch('/api/build/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildId,
          message,
          context,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: BuildMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Show approval UI if there are code changes
      if (data.requiresApproval && data.changes && data.changes.length > 0) {
        setPendingChanges(data.changes);
        setShowApproval(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: BuildMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleApproveChanges = async () => {
    setIsApplying(true);
    try {
      const currentProjectId = localStorage.getItem('currentProjectId');
      const buildId = currentProjectId;

      if (!buildId) {
        throw new Error('No build ID found');
      }

      const response = await fetch('/api/build/apply-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildId,
          changes: pendingChanges,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply changes');
      }

      const successMessage: BuildMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✅ Applied ${pendingChanges.length} change(s) successfully! Refreshing preview...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);

      // Clear pending changes
      setPendingChanges([]);
      setShowApproval(false);

      // Refresh the preview after a short delay
      setTimeout(() => {
        handleRefresh();
      }, 1000);
    } catch (error) {
      console.error('Failed to apply changes:', error);
      const errorMessage: BuildMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error applying changes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRejectChanges = () => {
    setPendingChanges([]);
    setShowApproval(false);

    const rejectMessage: BuildMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Changes rejected. Let me know if you\'d like me to try something different!',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, rejectMessage]);
  };

  return (
    <div className="flex h-full">
      {/* Main Preview Area */}
      <div className="flex flex-col flex-1">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              Live Preview: {projectName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                isChatOpen
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="Toggle chat"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Chat</span>
              {pendingChanges.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingChanges.length}
                </span>
              )}
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Refresh preview"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleOpenExternal}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="relative flex-1 bg-white">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center max-w-md px-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Preview Not Available
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Make sure the preview server is running on {previewUrl}
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            key={iframeKey}
            src={previewUrl}
            className="w-full h-full border-0"
            title={`Preview: ${projectName}`}
            onLoad={handleLoad}
            onError={handleError}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          />

          {/* Approval Modal */}
          {showApproval && pendingChanges.length > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
              <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Review Code Changes
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {pendingChanges.length} file(s) will be modified
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {pendingChanges.map((change, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-mono text-sm font-semibold text-gray-900 mb-2">
                        📝 {change.file}
                      </div>
                      {change.description && (
                        <div className="text-sm text-gray-600 mb-2">{change.description}</div>
                      )}
                      {change.oldCode && (
                        <div className="mb-2">
                          <div className="text-xs font-semibold text-red-600 mb-1">- Remove:</div>
                          <pre className="bg-red-50 border border-red-200 rounded p-2 text-xs overflow-x-auto">
                            {change.oldCode}
                          </pre>
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-semibold text-green-600 mb-1">
                          + {change.oldCode ? 'Replace with:' : 'Add:'}
                        </div>
                        <pre className="bg-green-50 border border-green-200 rounded p-2 text-xs overflow-x-auto">
                          {change.newCode}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    onClick={handleRejectChanges}
                    disabled={isApplying}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4 inline mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={handleApproveChanges}
                    disabled={isApplying}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isApplying ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Apply Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {isChatOpen ? '💬 Chat active' : '✅ Ready'} | {pendingChanges.length > 0 ? `⚠️ ${pendingChanges.length} pending change(s)` : 'No pending changes'}
            </span>
            <span className="font-mono">{previewUrl}</span>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel
        messages={messages}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
