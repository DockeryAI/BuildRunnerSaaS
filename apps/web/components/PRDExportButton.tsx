'use client';

import React, { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { exportToPDF, exportToPPT, downloadMarkdown, exportToClaudeBuilder } from '../lib/prd-export';

interface PRDExportButtonProps {
  project: any;
  onClaudeBuilderExport?: (success: boolean, message: string) => void;
}

export default function PRDExportButton({ project, onClaudeBuilderExport }: PRDExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = () => {
    exportToPDF({
      productName: project.productName || project.name || 'Product',
      productIdea: project.productIdea || '',
      prdSections: project.prdSections || {},
    });
    setShowMenu(false);
  };

  const handleExportPPT = () => {
    exportToPPT({
      productName: project.productName || project.name || 'Product',
      productIdea: project.productIdea || '',
      prdSections: project.prdSections || {},
    });
    setShowMenu(false);
  };

  const handleExportMarkdown = () => {
    downloadMarkdown({
      productName: project.productName || project.name || 'Product',
      productIdea: project.productIdea || '',
      prdSections: project.prdSections || {},
    });
    setShowMenu(false);
  };

  const handleExportToClaudeBuilder = async () => {
    setExporting(true);
    setShowMenu(false);

    try {
      const result = await exportToClaudeBuilder(
        {
          productName: project.productName || project.name || 'Product',
          productIdea: project.productIdea || '',
          prdSections: project.prdSections || {},
        },
        project.productName || project.name || 'Product'
      );

      if (onClaudeBuilderExport) {
        onClaudeBuilderExport(result.success, result.message);
      }
    } catch (error) {
      if (onClaudeBuilderExport) {
        onClaudeBuilderExport(
          false,
          error instanceof Error ? error.message : 'Export failed'
        );
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        disabled={exporting}
      >
        <ArrowDownTrayIcon className="h-5 w-5" />
        {exporting ? 'Exporting...' : 'Export PRD'}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            <button
              onClick={handleExportToClaudeBuilder}
              className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors text-gray-700 border-b border-gray-100"
              disabled={exporting}
            >
              <div className="font-medium flex items-center gap-2">
                🤖 Export to Claude Builder
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Auto-build with Claude CLI daemon
              </div>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors text-gray-700 border-b border-gray-100"
            >
              <div className="font-medium">Export as Markdown</div>
              <div className="text-xs text-gray-500 mt-0.5">For Claude Code / Developers</div>
            </button>
            <button
              onClick={handleExportPDF}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-gray-700"
            >
              Export as PDF
            </button>
            <button
              onClick={handleExportPPT}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-gray-700"
            >
              Export as PowerPoint
            </button>
          </div>
        </>
      )}
    </div>
  );
}
