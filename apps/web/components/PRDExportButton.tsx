'use client';

import React, { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { exportToPDF, exportToPPT } from '../lib/prd-export';

interface PRDExportButtonProps {
  project: any;
}

export default function PRDExportButton({ project }: PRDExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

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

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
      >
        <ArrowDownTrayIcon className="h-5 w-5" />
        Export PRD
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
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
