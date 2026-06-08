import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Eye, ArrowRight, CheckCircle2, Circle, Copy, Settings, Info } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Point } from '@/src/types';

interface BezierEditorProps {
  value: [number, number, number, number];
  onChange: (value: [number, number, number, number]) => void;
  hideValues?: boolean;
}

export const BezierEditor: React.FC<BezierEditorProps> = ({ value, onChange, hideValues }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'p1' | 'p2' | null>(null);

  const [p1, v1, p2, v2] = value;

  const handleMouseDown = (point: 'p1' | 'p2') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(point);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      let x = (e.clientX - rect.left) / width;
      // Map mouse position (0 to 1) to Y range (1.5 to -0.5)
      let y = 1.5 - ((e.clientY - rect.top) / height) * 2;

      // Grid Snapping when Shift is held
      if (e.shiftKey) {
        const snapInterval = 0.1; // 10x10 grid
        x = Math.round(x / snapInterval) * snapInterval;
        y = Math.round(y / snapInterval) * snapInterval;
      }

      // Clamp X 0–1, Y -0.5–1.5 (workspace bounds)
      x = Math.max(0, Math.min(1, x));
      y = Math.max(-0.5, Math.min(1.5, y));

      x = Math.round(x * 100) / 100;
      y = Math.round(y * 100) / 100;

      const newValue: [number, number, number, number] = [value[0], value[1], value[2], value[3]];
      if (isDragging === 'p1') {
        newValue[0] = x;
        newValue[1] = y;
      } else {
        newValue[2] = x;
        newValue[3] = y;
      }
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, value, onChange]);

  // Coordinate mapping for SVG (Y range: -0.5 to 1.5)
  const getSvgCoords = (x: number, y: number) => {
    return {
      x: x * 400,
      y: (1.5 - y) * 200 // 1.5 maps to 0, -0.5 maps to 400
    };
  };

  const cp1 = getSvgCoords(p1, v1);
  const cp2 = getSvgCoords(p2, v2);

  return (
    <div className="bg-surface p-6 relative overflow-hidden w-full h-full flex flex-col panel-glow rounded-lg">
      <div className="absolute top-0 right-0 p-4 z-10">
        <span className="font-mono font-bold text-sm text-on-surface-variant uppercase tracking-widest">Bezier Workspace</span>
      </div>

      <div className="flex-grow bg-surface-container rounded-md border border-outline relative graph-grid overflow-visible min-h-[300px]" style={{ borderColor: 'rgba(42,42,90,0.8)' }}>
        {/* Boundary Indicators */}
        <div className="absolute inset-x-0 top-[25%] border-t border-outline-variant opacity-40 pointer-events-none z-0" />
        <div className="absolute inset-x-0 top-[75%] border-t border-outline-variant opacity-40 pointer-events-none z-0" />

        {/* The Drawing Area (Content Box) */}
        <div
          ref={containerRef}
          className="absolute inset-8 pointer-events-none overflow-visible"
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox="0 0 400 400"
            preserveAspectRatio="none"
          >
            {/* Reference Lines */}
            <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(96,165,250,0.2)" strokeWidth="1" strokeDasharray="4" />
            <line x1="0" y1="300" x2="400" y2="300" stroke="rgba(96,165,250,0.2)" strokeWidth="1" strokeDasharray="4" />

            {/* Construction Lines */}
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              x1="0" y1="300"
              x2={cp1.x} y2={cp1.y}
              stroke="rgba(176,110,255,0.35)" strokeDasharray="5 3" strokeWidth="1.5"
            />
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              x1="400" y1="100"
              x2={cp2.x} y2={cp2.y}
              stroke="rgba(96,165,250,0.35)" strokeDasharray="5 3" strokeWidth="1.5"
            />

            {/* Glow path (blurred duplicate) */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              d={`M 0 300 C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, 400 100`}
              fill="none"
              stroke="rgba(176,110,255,0.25)"
              strokeWidth="10"
              strokeLinecap="round"
              style={{ filter: 'blur(6px)' }}
            />

            {/* The Curve */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              d={`M 0 300 C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, 400 100`}
              fill="none"
              stroke="#b06eff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Anchor dots */}
            <circle cx="0" cy="300" r="5" fill="rgba(96,165,250,0.6)" />
            <circle cx="400" cy="100" r="5" fill="rgba(176,110,255,0.6)" />
          </svg>

          {/* Handle 1 — purple */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing pointer-events-auto"
            style={{ left: `${p1 * 100}%`, top: `${((1.5 - v1) / 2) * 100}%` }}
            onMouseDown={handleMouseDown('p1')}
          >
            <motion.div
              whileHover={{ scale: 1.4 }}
              whileTap={{ scale: 0.85 }}
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(176,110,255,0.2)',
                border: '2px solid #b06eff',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            </motion.div>
          </motion.div>

          {/* Handle 2 — blue */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing pointer-events-auto"
            style={{ left: `${p2 * 100}%`, top: `${((1.5 - v2) / 2) * 100}%` }}
            onMouseDown={handleMouseDown('p2')}
          >
            <motion.div
              whileHover={{ scale: 1.4 }}
              whileTap={{ scale: 0.85 }}
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(96,165,250,0.2)',
                border: '2px solid #60a5fa',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Axis Labels */}
        <div className="absolute left-4 bottom-2 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest z-10 pointer-events-none">Time (x)</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest -rotate-90 z-10 pointer-events-none">Value (y)</div>
      </div>

      {!hideValues && (
        <div className="mt-6 flex gap-3 items-center">
          <div className="flex-1 px-4 py-2.5 rounded-md relative overflow-hidden shimmer-line"
            style={{ background: 'rgba(176,110,255,0.08)', border: '1px solid rgba(176,110,255,0.3)' }}
          >
            <code className="text-primary font-mono text-sm relative z-10">
              cubic-bezier({value.map(v => v.toFixed(2)).join(', ')})
            </code>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(`cubic-bezier(${value.join(', ')})`)}
            className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded"
          >
            <Copy size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
