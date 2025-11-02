'use client';

import { useEffect, useRef } from 'react';
import { CommandLineIcon, FolderIcon } from '@heroicons/react/24/outline';

export interface TerminalLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'command' | 'response' | 'llm_request' | 'llm_response' | 'file_operation' | 'consensus';
  message: string;
  metadata?: {
    model?: string;
    component?: string;
    promptLength?: number;
    responseLength?: number;
    filePath?: string;
    agreementRatio?: number;
    models?: string[];
  };
}

interface TerminalPanelProps {
  logs: TerminalLog[];
  buildStatus: 'idle' | 'running' | 'paused' | 'completed';
  onSendCommand?: (command: string) => void;
  onInterrupt?: () => void;
  isFilesOpen: boolean;
  onToggleFiles: () => void;
  position: { x: number; y: number };
  onMouseDown: (e: React.MouseEvent) => void;
  onMinimize: () => void;
}

export default function TerminalPanel({
  logs,
  buildStatus,
  onSendCommand,
  onInterrupt,
  isFilesOpen,
  onToggleFiles,
  position,
  onMouseDown,
  onMinimize,
}: TerminalPanelProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogColor = (type: TerminalLog['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'command':
        return 'text-cyan-400';
      case 'response':
        return 'text-blue-400';
      case 'llm_request':
        return 'text-purple-400';
      case 'llm_response':
        return 'text-green-300';
      case 'file_operation':
        return 'text-orange-400';
      case 'consensus':
        return 'text-pink-400';
      default:
        return 'text-gray-300';
    }
  };

  const getLogIcon = (type: TerminalLog['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'command':
        return '>';
      case 'response':
        return '←';
      case 'llm_request':
        return '🤖';
      case 'llm_response':
        return '✅';
      case 'file_operation':
        return '📁';
      case 'consensus':
        return '🔍';
      default:
        return '•';
    }
  };

  const formatLogMessage = (log: TerminalLog) => {
    const timestamp = log.timestamp.toLocaleTimeString();
    const icon = getLogIcon(log.type);
    const color = getLogColor(log.type);

    let detailedMessage = log.message;

    // Add detailed information based on log type and metadata
    if (log.type === 'llm_request' && log.metadata) {
      const { model, component, promptLength } = log.metadata;
      detailedMessage = `LLM Request: ${model || 'unknown'}
  Component: ${component || 'N/A'}
  Prompt: ${promptLength || 0} characters (preview: ${log.message.substring(0, 200)}${log.message.length > 200 ? '...' : ''})`;
    } else if (log.type === 'llm_response' && log.metadata) {
      const { model, responseLength } = log.metadata;
      detailedMessage = `LLM Response: ${model || 'unknown'}
  Response Length: ${responseLength || 0} characters
  Token Count: ~${Math.floor((responseLength || 0) / 4)} tokens
  Preview: ${log.message.substring(0, 200)}${log.message.length > 200 ? '...' : ''}`;
    } else if (log.type === 'file_operation' && log.metadata?.filePath) {
      detailedMessage = `File Operation
  Path: ${log.metadata.filePath}
  Action: ${log.message}`;
    } else if (log.type === 'consensus' && log.metadata) {
      const { agreementRatio, models } = log.metadata;
      detailedMessage = `Multi-LLM Consensus Check
  Agreement: ${((agreementRatio || 0) * 100).toFixed(0)}%
  Models: ${models?.join(', ') || 'N/A'}
  Result: ${log.message}`;
    }

    return (
      <div className="font-mono text-xs leading-relaxed">
        <span className="text-gray-500">[{timestamp}]</span>
        <span className={`ml-2 ${color}`}>{icon}</span>
        <span className={`ml-2 ${color}`}>
          <pre className="whitespace-pre-wrap break-words">{detailedMessage}</pre>
        </span>
      </div>
    );
  };

  return (
    <div
      className="fixed z-40 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '700px',
        height: '500px',
      }}
      onMouseDown={onMouseDown}
    >
      {/* Terminal Header */}
      <div className="terminal-header flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <button
              onClick={onMinimize}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
              title="Close"
            />
            <button
              onClick={onMinimize}
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
              title="Minimize"
            />
            <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <CommandLineIcon className="w-4 h-4 text-green-400" />
            <h2 className="text-sm font-semibold text-gray-200">Build Terminal</h2>
            {logs.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded font-medium">
                {logs.length}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onToggleFiles}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
            isFilesOpen
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
          title="Toggle Build Files"
        >
          <FolderIcon className="w-3.5 h-3.5" />
          Files
        </button>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto bg-gray-900 p-4 space-y-2">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">
            Terminal logs will appear here...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="border-l-2 border-gray-700 pl-2 hover:border-gray-500 transition-colors">
              {formatLogMessage(log)}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Terminal Footer */}
      {buildStatus === 'running' && onInterrupt && (
        <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 rounded-b-lg">
          <button
            onClick={onInterrupt}
            className="w-full px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
          >
            Interrupt Build
          </button>
        </div>
      )}
    </div>
  );
}
