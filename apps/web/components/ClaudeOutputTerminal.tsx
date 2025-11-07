'use client';

import { useEffect, useRef, useState } from 'react';
import { CommandLineIcon } from '@heroicons/react/24/outline';

interface ClaudeOutputTerminalProps {
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function ClaudeOutputTerminal({
  projectName,
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
    if (!isOpen || !projectName) return;

    // Connect to SSE stream
    const eventSource = new EventSource(
      `/api/build/output?projectName=${encodeURIComponent(projectName)}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('Connected to Claude CLI output stream');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.complete) {
          console.log('Build stream complete');
          setIsComplete(true);
          eventSource.close();
          return;
        }

        if (data.line) {
          setLines((prev) => [...prev, data.line]);
        }

        if (data.error) {
          console.error('Stream error:', data.error);
          setLines((prev) => [...prev, `ERROR: ${data.error}`]);
        }
      } catch (error) {
        console.error('Failed to parse stream data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      setIsConnected(false);
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [isOpen, projectName]);

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
            <h2 className="text-sm font-semibold text-gray-200">Claude CLI Output</h2>
            {isConnected && !isComplete && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded font-medium">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Live
              </span>
            )}
            {isComplete && (
              <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded font-medium">
                Completed
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
            <div>Waiting for Claude CLI output...</div>
            <div className="text-xs mt-2">Build may not have started yet</div>
          </div>
        ) : lines.length === 0 && isConnected ? (
          <div className="text-gray-500 text-center py-8">
            <div className="text-2xl mb-2">🔄</div>
            <div>Connected. Waiting for output...</div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {lines.map((line, index) => (
              <div
                key={index}
                className="leading-relaxed whitespace-pre-wrap break-words hover:bg-gray-800/30 px-1 -mx-1 rounded transition-colors"
              >
                {line}
              </div>
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
