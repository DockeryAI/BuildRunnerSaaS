'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Smartphone, Tablet, ChevronLeft, ChevronRight, Camera, Maximize2, MessageSquare, Sparkles } from 'lucide-react';
import { FeedbackSidebar } from './FeedbackSidebar';
import { FeedbackInput } from './FeedbackInput';
import { PRDSuggestionsPanel } from './PRDSuggestionsPanel';

type ViewportSize = 'mobile' | 'tablet' | 'desktop';
type AppType = 'web' | 'mobile';

interface InteractivePreviewProps {
  buildId: string;
  projectId: string;
  appType: AppType;
  previewUrl: string;
}

const viewportSizes = {
  mobile: { width: 375, height: 667, icon: Smartphone },
  tablet: { width: 768, height: 1024, icon: Tablet },
  desktop: { width: '100%', height: '100%', icon: Monitor },
};

export function InteractivePreview({
  buildId,
  projectId,
  appType,
  previewUrl,
}: InteractivePreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('/');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'feedback' | 'prd'>('feedback');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for iframe navigation changes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'route-change') {
        setCurrentRoute(event.data.route);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const captureScreenshot = async (): Promise<string> => {
    // In production, use html2canvas or similar
    return new Promise((resolve) => {
      if (iframeRef.current) {
        // Simplified - just return a data URL
        // In production: use html2canvas to capture iframe content
        resolve('data:image/png;base64,screenshot_placeholder');
      }
    });
  };

  const handleScreenshotCapture = async () => {
    const screenshot = await captureScreenshot();
    console.log('Screenshot captured:', screenshot);
    // Could trigger feedback input with screenshot
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setSidebarCollapsed(true);
    }
  };

  const getViewportDimensions = () => {
    const size = viewportSizes[viewport];
    if (viewport === 'desktop') {
      return { width: '100%', height: '100%' };
    }
    return {
      width: typeof size.width === 'number' ? `${size.width}px` : size.width,
      height: typeof size.height === 'number' ? `${size.height}px` : size.height,
    };
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Interactive Preview
          </h2>
          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
            {appType === 'mobile' ? 'Expo App' : 'Web App'}
          </span>
        </div>

        {/* Viewport selector */}
        <div className="flex items-center gap-2">
          {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => {
            const Icon = viewportSizes[size].icon;
            return (
              <button
                key={size}
                onClick={() => setViewport(size)}
                className={`p-2 rounded ${
                  viewport === size
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={`${size} view`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <button
            onClick={handleScreenshotCapture}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="Capture screenshot"
          >
            <Camera className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="Toggle fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview area */}
        <div
          className={`flex-1 flex flex-col items-center justify-center p-6 bg-gray-100 overflow-auto transition-all ${
            sidebarCollapsed ? 'mr-0' : 'mr-96'
          }`}
        >
          <div
            className="bg-white rounded-lg shadow-xl overflow-hidden"
            style={getViewportDimensions()}
          >
            {/* Device frame for mobile/tablet */}
            {viewport !== 'desktop' && (
              <div className="flex items-center justify-center p-2 bg-gray-900">
                <div className="w-16 h-1 bg-gray-700 rounded-full" />
              </div>
            )}

            {/* Iframe */}
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-0"
              title="App Preview"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            />
          </div>
        </div>

        {/* Right sidebar with tabs */}
        {!sidebarCollapsed ? (
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
            {/* Tab switcher */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('feedback')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'feedback'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Feedback
              </button>
              <button
                onClick={() => setActiveTab('prd')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'prd'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                PRD
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'feedback' ? (
                <FeedbackSidebar
                  buildId={buildId}
                  projectId={projectId}
                  collapsed={false}
                  onToggleCollapse={() => setSidebarCollapsed(true)}
                />
              ) : (
                <PRDSuggestionsPanel
                  projectId={projectId}
                  buildId={buildId}
                />
              )}
            </div>

            {/* Collapse button */}
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                title="Collapse sidebar"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-white border-l border-gray-200 flex flex-col items-center py-4">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Expand sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Feedback input (fixed at bottom) */}
      <FeedbackInput
        buildId={buildId}
        projectId={projectId}
        currentRoute={currentRoute}
        deviceType={viewport}
        onScreenshotCapture={captureScreenshot}
      />
    </div>
  );
}
