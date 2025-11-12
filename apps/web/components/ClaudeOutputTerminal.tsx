'use client';

import { useEffect, useRef, useState } from 'react';
import { CommandLineIcon } from '@heroicons/react/24/outline';

interface ClaudeOutputTerminalProps {
  buildId: string | null;
  projectName: string;
  buildStatus: 'idle' | 'running' | 'completed' | 'failed';
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function ClaudeOutputTerminal({
  buildId,
  projectName,
  buildStatus,
  isOpen,
  onClose,
  position,
  onMouseDown,
}: ClaudeOutputTerminalProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [size, setSize] = useState({ width: 900, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    if (!isOpen || !buildId) return;

    // Clear previous logs when new build starts
    setLines([]);
    setIsComplete(false);

    // Connect to real build stream
    const eventSource = new EventSource(`/api/build/status?buildId=${buildId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ Connected to build stream');
      setIsConnected(true);
      setLines((prev) => [...prev, '✅ Connected to build stream']);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle different event types from the real build system
        switch (data.type) {
          case 'connected':
            setLines((prev) => [...prev, '🔗 Build system connected']);
            break;

          case 'log':
            // Format log message with icon based on level
            const icon = data.level === 'error' ? '❌' : data.level === 'success' ? '✅' : 'ℹ️';
            setLines((prev) => [...prev, `${icon} ${data.message}`]);
            break;

          case 'component:started':
            setLines((prev) => [...prev, `🔨 Building ${data.componentName}...`]);
            break;

          case 'component:completed':
            setLines((prev) => [...prev, `✅ Completed ${data.componentName}`]);
            break;

          case 'component:failed':
            setLines((prev) => [...prev, `❌ ${data.componentName} failed: ${data.error}`]);
            break;

          case 'component:progress':
            // Optional: show progress updates
            break;

          case 'build:complete':
            setLines((prev) => [...prev, '🎉 Build complete!']);
            setIsComplete(true);
            eventSource.close();
            break;

          case 'build:failed':
            setLines((prev) => [...prev, `❌ Build failed: ${data.error}`]);
            setIsComplete(true);
            eventSource.close();
            break;

          // Claude CLI events
          case 'claude:prompt':
            setLines((prev) => [...prev, '🤖 Sending prompt to Claude...']);
            break;

          case 'claude:output':
            // Raw Claude CLI output streaming
            if (data.chunk) {
              setLines((prev) => {
                // Split by newlines and add each line
                const newLines = data.chunk.split('\n').filter((line: string) => line.trim());
                return [...prev, ...newLines];
              });
            }
            break;

          case 'claude:error':
            // Claude CLI errors
            if (data.chunk) {
              setLines((prev) => [...prev, `⚠️ ${data.chunk}`]);
            }
            break;

          case 'claude:stream':
            // Accumulate streaming chunks
            if (data.content) {
              setLines((prev) => {
                const last = prev[prev.length - 1];
                // If last line is a stream chunk, append to it
                if (last && last.startsWith('💭 ')) {
                  const updated = [...prev];
                  updated[updated.length - 1] = last + data.content;
                  return updated;
                } else {
                  return [...prev, `💭 ${data.content}`];
                }
              });
            }
            break;

          case 'claude:file_written':
            setLines((prev) => [...prev, `📝 ${data.filePath}`]);
            break;

          case 'task:started':
            setLines((prev) => [...prev, `🔨 Task: ${data.task?.description || 'Unknown'}`]);
            break;

          case 'task:completed':
            setLines((prev) => [...prev, `✅ Task completed: ${data.task?.description || 'Unknown'}`]);
            break;

          case 'task:failed':
            setLines((prev) => [...prev, `❌ Task failed: ${data.task?.description || 'Unknown'}`]);
            break;

          case 'task:list_generated':
            setLines((prev) => [...prev, `📋 Generated ${data.totalTasks || 0} tasks`]);
            break;

          case 'build:paused':
            setLines((prev) => [...prev, '⏸️  Build paused - handoff document generated']);
            break;

          default:
            // Log unknown event types for debugging
            console.log('[Build Event]', data);
        }
      } catch (error) {
        console.error('Failed to parse stream data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      setIsConnected(false);
      setLines((prev) => [...prev, '⚠️ Connection lost']);
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [isOpen, buildId]);

  const handleClose = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setLines([]);
    setIsConnected(false);
    setIsComplete(false);
    onClose();
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // Prevent canvas zoom
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      setSize({
        width: Math.max(400, resizeStart.width + deltaX),
        height: Math.max(300, resizeStart.height + deltaY),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart]);

  // Format line with syntax highlighting
  const formatLineWithSyntax = (line: string): string => {
    // Escape HTML first
    let formatted = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight file paths (e.g., src/app/page.tsx, /Users/..., ./file.ts)
    formatted = formatted.replace(
      /((?:src\/|lib\/|app\/|components\/|\.\/|\/[\w\-\/]+\/)[^\s]+\.(?:tsx?|jsx?|css|json|md|ya?ml))/g,
      '<span style="color: #10b981;">$1</span>'
    );

    // Highlight error patterns
    formatted = formatted.replace(
      /(error|failed|fail|exception|crash)/gi,
      '<span style="color: #ef4444; font-weight: 600;">$1</span>'
    );

    // Highlight success patterns
    formatted = formatted.replace(
      /(success|completed?|done|passed?|✓|✅)/gi,
      '<span style="color: #22c55e; font-weight: 500;">$1</span>'
    );

    // Highlight warnings
    formatted = formatted.replace(
      /(warning|warn|caution|⚠️)/gi,
      '<span style="color: #f59e0b;">$1</span>'
    );

    // Highlight code blocks (triple backticks)
    formatted = formatted.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre style="background: #1f2937; padding: 8px; border-radius: 4px; margin: 4px 0; overflow-x: auto;"><code style="color: #60a5fa;">$2</code></pre>'
    );

    // Highlight inline code (single backticks)
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code style="background: #374151; color: #60a5fa; padding: 2px 6px; border-radius: 3px; font-size: 0.9em;">$1</code>'
    );

    // Highlight npm package names
    formatted = formatted.replace(
      /\b(npm|yarn|pnpm)\s+(install|add|remove|run)\s+([^\s]+)/g,
      '<span style="color: #a78bfa;">$1 $2 <span style="color: #34d399;">$3</span></span>'
    );

    // Highlight numbers
    formatted = formatted.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      '<span style="color: #fbbf24;">$1</span>'
    );

    // Highlight TypeScript/ESLint
    formatted = formatted.replace(
      /\b(TypeScript|ESLint|tsc|eslint)\b/g,
      '<span style="color: #3b82f6; font-weight: 500;">$1</span>'
    );

    // Highlight git commands/operations
    formatted = formatted.replace(
      /\b(git|commit|push|pull|clone|checkout|branch|merge)\b/g,
      '<span style="color: #f97316;">$1</span>'
    );

    return formatted;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Transparent overlay during resize to prevent canvas interaction */}
      {isResizing && (
        <div
          className="fixed inset-0 z-40"
          style={{
            cursor: 'nwse-resize',
            pointerEvents: 'auto',
          }}
        />
      )}

      <div
        className="fixed z-50 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 flex flex-col relative"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          pointerEvents: 'auto',
        }}
        onMouseDown={onMouseDown}
        onWheel={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
      {/* Terminal Header */}
      <div className="terminal-header flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <button
              onClick={handleClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
              title="Close"
            />
            <button
              onClick={handleClose}
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
              title="Minimize"
            />
            <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <CommandLineIcon className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-gray-200">Build Terminal</h2>
            {isConnected && !isComplete && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded font-medium">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Live
              </span>
            )}
            {isComplete && (
              <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded font-medium">
                {buildStatus === 'failed' ? 'Failed' : 'Completed'}
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400 font-mono">{projectName}</div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto bg-gray-900 p-4 font-mono text-xs text-gray-300">
        {lines.length === 0 && !isConnected ? (
          <div className="text-gray-500 text-center py-8">
            <div className="text-2xl mb-2">⏳</div>
            <div>Connecting to build stream...</div>
            <div className="text-xs mt-2">Initializing build process</div>
          </div>
        ) : lines.length === 0 && isConnected ? (
          <div className="text-gray-500 text-center py-8">
            <div className="text-2xl mb-2">🔄</div>
            <div>Connected. Waiting for build events...</div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {lines.map((line, index) => (
              <div
                key={index}
                className="leading-relaxed whitespace-pre-wrap break-words hover:bg-gray-800/30 px-1 -mx-1 rounded transition-colors"
                dangerouslySetInnerHTML={{ __html: formatLineWithSyntax(line) }}
              />
            ))}
          </div>
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 rounded-b-lg pr-10">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>Lines: {lines.length}</span>
            <span>Status: {isComplete ? 'Complete' : isConnected ? 'Streaming' : 'Connecting...'}</span>
          </div>
          <button
            onClick={handleClose}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize bg-gray-700 hover:bg-gray-500 rounded-tl flex items-center justify-center group transition-colors z-10"
        onMouseDown={handleResizeStart}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        style={{ borderBottomRightRadius: '0.5rem' }}
        title="Drag to resize"
      >
        <svg className="w-3 h-3 text-gray-500 group-hover:text-gray-300 rotate-90" fill="currentColor" viewBox="0 0 16 16">
          <path d="M0 15h16v1H0v-1zm4-4h12v1H4v-1zm0-4h12v1H4V7zm0-4h12v1H4V3z"/>
        </svg>
      </div>
    </div>
    </>
  );
}
