'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface DraggableSignatureProps {
  signatureImage: string | null;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  onPage: number;
  onDragEnd?: () => void;
}

export function DraggableSignature({
  signatureImage,
  position,
  onPositionChange,
  scale,
  onScaleChange,
  onPage,
  onDragEnd
}: DraggableSignatureProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const signatureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging || !signatureRef.current) return;

      const container = signatureRef.current.parentElement?.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      const newX = clientX - containerRect.left - dragOffset.x;
      const newY = clientY - containerRect.top - dragOffset.y;

      // Keep signature within bounds
      const signatureWidth = signatureRef.current.offsetWidth * scale;
      const signatureHeight = signatureRef.current.offsetHeight * scale;

      const boundedX = Math.max(0, Math.min(newX, containerRect.width - signatureWidth));
      const boundedY = Math.max(0, Math.min(newY, containerRect.height - signatureHeight));

      onPositionChange({ x: boundedX, y: boundedY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault(); // Prevent scrolling while dragging
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        onDragEnd?.();
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragOffset, onPositionChange, onDragEnd, scale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!signatureRef.current) return;

    const container = signatureRef.current.parentElement?.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - containerRect.left - position.x,
      y: e.clientY - containerRect.top - position.y
    });
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!signatureRef.current || e.touches.length === 0) return;

    const container = signatureRef.current.parentElement?.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const touch = e.touches[0];

    setDragOffset({
      x: touch.clientX - containerRect.left - position.x,
      y: touch.clientY - containerRect.top - position.y
    });
    setIsDragging(true);
  };

  const handleScaleChange = (direction: 'up' | 'down') => {
    const newScale = direction === 'up' ? Math.min(scale + 0.1, 3) : Math.max(scale - 0.1, 0.5);
    onScaleChange(newScale);
  };

  if (!signatureImage) {
    return (
      <div className="text-center text-gray-500 p-4">
        Por favor, crea una firma primero
      </div>
    );
  }

  return (
    <div
      ref={signatureRef}
      className={`absolute cursor-move select-none ${
        isDragging ? 'opacity-70 scale-105 z-50' : 'opacity-90 z-40'
      } transition-all duration-150`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none', // Prevent default touch behavior
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      title="Arrastra para posicionar la firma. Usa la rueda del mouse para cambiar el tamaño."
    >
      <div
        className="border-2 border-blue-500 rounded bg-white/90 shadow-xl backdrop-blur-sm"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <img
          src={signatureImage}
          alt="Signature"
          className="max-w-none"
          style={{
            pointerEvents: 'none',
            width: '150px',
            height: 'auto'
          }}
          draggable={false}
        />
      </div>

      {/* Size controls overlay */}
      <div className="absolute -top-8 left-0 right-0 flex justify-center gap-1 lg:opacity-0 lg:hover:opacity-100 opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleScaleChange('down');
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          className="bg-black/70 text-white px-3 py-1.5 rounded text-xs hover:bg-black touch-manipulation"
          type="button"
        >
          -
        </button>
        <span className="bg-black/70 text-white px-3 py-1.5 rounded text-xs">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleScaleChange('up');
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          className="bg-black/70 text-white px-3 py-1.5 rounded text-xs hover:bg-black touch-manipulation"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}