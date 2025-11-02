'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';

interface BuildCanvasProps {
  children: React.ReactNode;
  onZoomChange?: (zoom: number) => void;
}

export default function BuildCanvas({ children, onZoomChange }: BuildCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (canvasRef.current?.contains(e.target as Node)) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.1, Math.min(3, zoom + delta));

        setZoom(newZoom);
        onZoomChange?.(newZoom);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [zoom, onZoomChange]);

  // Handle mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(3, zoom + 0.2);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.1, zoom - 0.2);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onZoomChange?.(1);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
          title="Zoom In"
        >
          <MagnifyingGlassPlusIcon className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
          title="Zoom Out"
        >
          <MagnifyingGlassMinusIcon className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleResetView}
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
          title="Reset View"
        >
          <ArrowsPointingOutIcon className="w-5 h-5 text-gray-700" />
        </button>
        <div className="bg-white px-3 py-1 rounded-lg shadow-md border border-gray-200 text-sm font-medium text-gray-700">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Canvas Content */}
      <div
        ref={canvasRef}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="w-full h-full"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
