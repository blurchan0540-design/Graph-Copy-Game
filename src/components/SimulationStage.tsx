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
}

export const SimulationStage: React.FC<SimulationStageProps> = ({
  referenceBezier,
  userBezier,
  isPlayingReference,
  isPlayingUser,
  onAnimationComplete,
  duration = 1.5
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full h-[120px] bg-surface-container border border-outline flex items-center px-10"
    >
      <span className="absolute top-2 left-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-mono">
        {isPlayingReference ? "Reference Motion" : "Live Preview"}
      </span>
      
      <div className="relative w-full h-0.5 bg-outline">
        {/* Reference Ball */}
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

        {/* User Ball */}
        <motion.div 
          key={`user-${isPlayingUser}`}
          initial={{ left: "0%" }}
          animate={isPlayingUser ? { left: "100%" } : { left: "0%" }}
          transition={{ 
            duration: duration, 
            ease: userBezier
          }}
          onAnimationComplete={() => {
            if (isPlayingUser) onAnimationComplete();
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-primary bg-surface z-20"
        />
      </div>

      {/* Overlay Status */}
      <div className="absolute top-2 right-4">
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-1.5 h-1.5",
            isPlayingReference || isPlayingUser ? "bg-primary animate-pulse" : "bg-outline"
          )}></span>
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            {isPlayingReference ? "Ref Active" : isPlayingUser ? "User Active" : "Standby"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
