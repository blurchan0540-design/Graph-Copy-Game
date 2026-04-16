import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface SimulationStageProps {
  referenceBezier: [number, number, number, number];
  userBezier: [number, number, number, number];
  isPlayingReference: boolean;
  isPlayingUser: boolean;
  onAnimationComplete: () => void;
  duration?: number;
  forceComparisonMode?: boolean;
}

export const SimulationStage: React.FC<SimulationStageProps> = ({
  referenceBezier,
  userBezier,
  isPlayingReference,
  isPlayingUser,
  onAnimationComplete,
  duration = 1.5,
  forceComparisonMode = false
}) => {
  const isComparison = forceComparisonMode || (isPlayingReference && isPlayingUser);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative w-full bg-surface-container border border-outline flex flex-col justify-center px-10",
        isComparison ? "h-[180px] gap-10" : "h-[120px] gap-0"
      )}
    >
      <span className="absolute top-2 left-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-mono">
        {isComparison ? "Comparison Mode" : isPlayingReference ? "Reference Motion" : "Live Preview"}
      </span>

      {/* Reference Track */}
      {(isPlayingReference || isComparison) && (
        <div className="relative w-full">
          {isComparison && (
            <div className="absolute -top-6 left-0 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">Reference</span>
            </div>
          )}
          <div className="relative w-full h-0.5 bg-outline/50">
            <motion.div 
              key={`ref-${isPlayingReference}`}
              initial={{ left: "0%" }}
              animate={isPlayingReference ? { left: "100%" } : { left: "0%" }}
              transition={{ 
                duration: duration, 
                ease: referenceBezier
              }}
              onAnimationComplete={() => {
                if (isPlayingReference) onAnimationComplete();
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary shadow-[0_0_20px_rgba(204,255,0,0.4)] z-10"
            />
          </div>
        </div>
      )}

      {/* User Track */}
      {(isPlayingUser || isComparison) && (
        <div className="relative w-full">
          {isComparison && (
            <div className="absolute -top-6 left-0 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full border border-primary" />
              <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">Your Motion</span>
            </div>
          )}
          <div className="relative w-full h-0.5 bg-outline/50">
            <motion.div 
              key={`user-${isPlayingUser}`}
              initial={{ left: "0%" }}
              animate={isPlayingUser ? { left: "100%" } : { left: "0%" }}
              transition={{ 
                duration: duration, 
                ease: userBezier
              }}
              onAnimationComplete={() => {
                // Only trigger complete if not in comparison mode (where reference handles it)
                // or if we want both to finish. In App.tsx, handleAnimationComplete resets both.
                if (isPlayingUser && !isComparison) onAnimationComplete();
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-primary bg-surface z-20"
            />
          </div>
        </div>
      )}

      {/* Overlay Status */}
      <div className="absolute top-2 right-4">
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-1.5 h-1.5",
            isPlayingReference || isPlayingUser ? "bg-primary animate-pulse" : "bg-outline"
          )}></span>
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            {isComparison ? "Comparing" : isPlayingReference ? "Ref Active" : isPlayingUser ? "User Active" : "Standby"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
