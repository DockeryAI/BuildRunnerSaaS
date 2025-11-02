'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  StopIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'command' | 'response';
  message: string;
}

interface LiveFeedPanelProps {
  logs: LogEntry[];
  buildStatus: 'idle' | 'running' | 'paused' | 'completed';
  onSendCommand: (command: string) => void;
  onInterrupt: () => void;
}

export default function LiveFeedPanel({
  logs,
  buildStatus,
  onSendCommand,
  onInterrupt,
}: LiveFeedPanelProps) {
  const [command, setCommand] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isExpanded) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  const handleSendCommand = () => {
    if (!command.trim()) return;

    onSendCommand(command.trim());
    setCommand('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendCommand();
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'info':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'command':
        return 'text-purple-400';
      case 'response':
        return 'text-cyan-400';
      default:
        return 'text-gray-300';
    }
  };

  const getLogPrefix = (type: LogEntry['type']) => {
    switch (type) {
      case 'info':
        return '[INFO]';
      case 'success':
        return '[SUCCESS]';
      case 'warning':
        return '[WARNING]';
      case 'error':
        return '[ERROR]';
      case 'command':
        return '[CMD]';
      case 'response':
        return '[RESPONSE]';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col bg-gray-900 rounded-lg overflow-hidden shadow-xl border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            buildStatus === 'running' ? 'bg-green-500 animate-pulse' :
            buildStatus === 'paused' ? 'bg-yellow-500' :
            buildStatus === 'completed' ? 'bg-blue-500' :
            'bg-gray-500'
          }`} />
          <h3 className="text-sm font-semibold text-gray-100">Live Build Feed</h3>
          <span className="text-xs text-gray-400">
            ({logs.length} {logs.length === 1 ? 'entry' : 'entries'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {buildStatus === 'running' && (
            <button
              onClick={onInterrupt}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
            >
              <StopIcon className="w-3 h-3" />
              Interrupt
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUpIcon className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Log Display */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs min-h-[200px] max-h-[400px]">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No build activity yet.</p>
                <p className="text-xs mt-2">Logs will appear here when the build starts.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-gray-600">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className={getLogColor(log.type)}>
                    {getLogPrefix(log.type)}
                  </span>
                  <span className="text-gray-300 flex-1">
                    {log.message}
                  </span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Command Input */}
          <div className="p-3 bg-gray-800 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter command to send to build process..."
                className="flex-1 bg-gray-900 text-gray-100 px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono placeholder-gray-600"
                disabled={buildStatus !== 'running'}
              />
              <button
                onClick={handleSendCommand}
                disabled={buildStatus !== 'running' || !command.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send command • Available commands: pause, resume, skip, retry
            </p>
          </div>
        </>
      )}
    </div>
  );
}
