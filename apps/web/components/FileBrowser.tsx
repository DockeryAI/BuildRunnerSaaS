'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
  children?: FileTreeNode[];
}

interface FileBrowserProps {
  projectId: string;
  buildId: string | null;
  onFileSelect?: (filePath: string, content: string) => void;
}

export default function FileBrowser({ projectId, buildId, onFileSelect }: FileBrowserProps) {
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/']));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isContentOpen, setIsContentOpen] = useState(false);

  useEffect(() => {
    if (buildId) {
      loadFileTree();
    }
  }, [buildId, projectId]);

  const loadFileTree = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/build/files?projectId=${projectId}&buildId=${buildId}&action=tree`
      );

      if (!response.ok) {
        throw new Error('Failed to load file tree');
      }

      const data = await response.json();
      setFileTree(data.tree || []);
    } catch (err) {
      console.error('Failed to load file tree:', err);
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFileContent = async (filePath: string) => {
    try {
      const response = await fetch(
        `/api/build/files?projectId=${projectId}&buildId=${buildId}&action=read&file=${encodeURIComponent(filePath)}`
      );

      if (!response.ok) {
        throw new Error('Failed to load file content');
      }

      const data = await response.json();
      setFileContent(data.content);
      setSelectedFile(filePath);
      setIsContentOpen(true);

      // Call parent callback if provided
      if (onFileSelect) {
        onFileSelect(filePath, data.content);
      }
    } catch (err) {
      console.error('Failed to load file content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load file content');
    }
  };

  const toggleDirectory = (dirPath: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(dirPath)) {
      newExpanded.delete(dirPath);
    } else {
      newExpanded.add(dirPath);
    }
    setExpandedDirs(newExpanded);
  };

  const renderTreeNode = (node: FileTreeNode, level: number = 0) => {
    const isExpanded = expandedDirs.has(node.path);
    const isSelected = selectedFile === node.path;

    if (node.type === 'directory') {
      return (
        <div key={node.path}>
          <div
            className={`flex items-center gap-1 py-1 px-2 hover:bg-gray-100 cursor-pointer rounded ${
              isSelected ? 'bg-blue-50' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => toggleDirectory(node.path)}
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpenIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
            ) : (
              <FolderIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
            <span className="text-sm text-gray-700 truncate">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => renderTreeNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        className={`flex items-center gap-1 py-1 px-2 hover:bg-gray-100 cursor-pointer rounded ${
          isSelected ? 'bg-blue-50' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 24}px` }}
        onClick={() => loadFileContent(node.path)}
      >
        <DocumentTextIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm text-gray-700 truncate">{node.name}</span>
        {node.size && (
          <span className="text-xs text-gray-400 ml-auto">
            {formatFileSize(node.size)}
          </span>
        )}
      </div>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getFileLanguage = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  if (!buildId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Start a build to see generated files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <FolderIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Build Files</h3>
        </div>
        <button
          onClick={loadFileTree}
          disabled={isLoading}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && fileTree.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">Loading files...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600">
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        ) : fileTree.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">No files generated yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {fileTree.map((node) => renderTreeNode(node))}
          </div>
        )}
      </div>

      {/* File Content Modal */}
      {isContentOpen && selectedFile && fileContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {selectedFile}
                </h3>
              </div>
              <button
                onClick={() => setIsContentOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* File Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-green-400 font-mono">
                  {fileContent}
                </code>
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Language: {getFileLanguage(selectedFile)}
                </span>
                <button
                  onClick={() => setIsContentOpen(false)}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
