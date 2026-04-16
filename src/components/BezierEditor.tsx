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

      // Clamp X between 0 and 1 as per cubic-bezier spec
      x = Math.max(0, Math.min(1, x));
      
      // Round to 2 decimal places to avoid floating point issues
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
    <div className="bg-surface p-6 relative overflow-hidden border border-outline w-full h-full flex flex-col">
      <div className="absolute top-0 right-0 p-4 z-10">
        <span className="font-mono font-bold text-[10px] text-on-surface-variant uppercase tracking-widest">Bezier Workspace</span>
      </div>

      <div className="flex-grow bg-surface-container rounded-none border border-outline relative graph-grid overflow-visible min-h-[300px]">
        {/* Boundary Indicators */}
        <div className="absolute inset-x-0 top-[25%] border-t border-outline-variant opacity-30 pointer-events-none z-0" /> {/* Y=1.0 */}
        <div className="absolute inset-x-0 top-[75%] border-t border-outline-variant opacity-30 pointer-events-none z-0" /> {/* Y=0.0 */}
        
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
            {/* Reference Lines (0 and 1) */}
            <line x1="0" y1="100" x2="400" y2="100" stroke="#333" strokeWidth="1" strokeDasharray="2" />
            <line x1="0" y1="300" x2="400" y2="300" stroke="#333" strokeWidth="1" strokeDasharray="2" />

            {/* Construction Lines */}
            <motion.line 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              x1="0" y1="300" 
              x2={cp1.x} y2={cp1.y} 
              stroke="#444" strokeDasharray="4" strokeWidth="1" 
            />
            <motion.line 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              x1="400" y1="100" 
              x2={cp2.x} y2={cp2.y} 
              stroke="#444" strokeDasharray="4" strokeWidth="1" 
            />

            {/* The Curve */}
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              d={`M 0 300 C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, 400 100`} 
              fill="none" 
              stroke="#CCFF00" 
              strokeWidth="3" 
            />
          </svg>

          {/* Interactive Handles */}
          {/* Handle 1 */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group/handle cursor-grab active:cursor-grabbing pointer-events-auto"
            style={{ left: `${p1 * 100}%`, top: `${((1.5 - v1) / 2) * 100}%` }}
            onMouseDown={handleMouseDown('p1')}
          >
            <motion.div 
              whileHover={{ scale: 1.2, rotate: 45 }}
              whileTap={{ scale: 0.9, rotate: 0 }}
              className="w-4 h-4 rounded-none bg-surface border-2 border-primary transition-colors flex items-center justify-center"
            >
              <div className="w-1 h-1 bg-primary"></div>
            </motion.div>
          </motion.div>

          {/* Handle 2 */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group/handle cursor-grab active:cursor-grabbing pointer-events-auto"
            style={{ left: `${p2 * 100}%`, top: `${((1.5 - v2) / 2) * 100}%` }}
            onMouseDown={handleMouseDown('p2')}
          >
            <motion.div 
              whileHover={{ scale: 1.2, rotate: -45 }}
              whileTap={{ scale: 0.9, rotate: 0 }}
              className="w-4 h-4 rounded-none bg-surface border-2 border-primary transition-colors flex items-center justify-center"
            >
              <div className="w-1 h-1 bg-primary"></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Axis Labels */}
        <div className="absolute left-4 bottom-2 text-[8px] font-mono text-on-surface-variant uppercase tracking-widest z-10">Time (x)</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] font-mono text-on-surface-variant uppercase tracking-widest -rotate-90 z-10">Value (y)</div>
      </div>

      {!hideValues && (
        <div className="mt-8 flex gap-4 items-center">
          <div className="bg-surface-container px-6 py-3 border border-outline">
            <code className="text-primary font-mono text-sm">
              cubic-bezier({value.map(v => v.toFixed(2)).join(', ')})
            </code>
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText(`cubic-bezier(${value.join(', ')})`)}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <Copy size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
