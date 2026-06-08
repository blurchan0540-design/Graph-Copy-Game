import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Tx } from '@/src/translations';

interface SimulationStageProps {
  referenceBezier: [number, number, number, number];
  userBezier: [number, number, number, number];
  isPlayingReference: boolean;
  isPlayingUser: boolean;
  onAnimationComplete: () => void;
  duration?: number;
  forceComparisonMode?: boolean;
  tx?: Pick<Tx, 'comparisonMode' | 'referenceMotion' | 'livePreviewLabel' | 'referenceTrack' | 'yourMotion' | 'comparing' | 'refActive' | 'userActive' | 'standby'>;
}

const defaultTx = {
  comparisonMode: 'Comparison Mode', referenceMotion: 'Reference Motion',
  livePreviewLabel: 'Live Preview',  referenceTrack: 'Reference',
  yourMotion: 'Your Motion',         comparing: 'Comparing',
  refActive: 'Ref Active',           userActive: 'User Active',
  standby: 'Standby',
};

export const SimulationStage: React.FC<SimulationStageProps> = ({
  referenceBezier,
  userBezier,
  isPlayingReference,
  isPlayingUser,
  onAnimationComplete,
  duration = 1.5,
  forceComparisonMode = false,
  tx: txProp,
}) => {
  const tx = txProp ?? defaultTx;
  const isComparison = forceComparisonMode || (isPlayingReference && isPlayingUser);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative w-full flex flex-col justify-center px-10 rounded-lg overflow-hidden",
        isComparison ? "h-[200px] gap-10" : "h-[130px] gap-0"
      )}
      style={{
        background: 'rgba(11,11,30,0.8)',
        border: '1px solid rgba(42,42,90,0.8)',
        boxShadow: 'none'
      }}
    >
      {/* scanline texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)'
      }} />

      <span className="absolute top-2.5 left-4 text-sm uppercase tracking-widest text-on-surface-variant font-mono z-10">
        {isComparison ? tx.comparisonMode : isPlayingReference ? tx.referenceMotion : tx.livePreviewLabel}
      </span>

      {/* Reference Track */}
      {(isPlayingReference || isComparison) && (
        <div className="relative w-full z-10">
          {isComparison && (
            <div className="absolute -top-6 left-0 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#b06eff' }} />
              <span className="text-sm font-mono text-on-surface-variant uppercase tracking-widest">{tx.referenceTrack}</span>
            </div>
          )}
          <div className="relative w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(176,110,255,0.4), transparent)' }}>
            <motion.div
              key={`ref-${isPlayingReference}`}
              initial={{ left: "0%" }}
              animate={isPlayingReference ? { left: "100%" } : { left: "0%" }}
              transition={{ duration, ease: referenceBezier }}
              onAnimationComplete={() => { if (isPlayingReference) onAnimationComplete(); }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full z-10"
              style={{ background: '#b06eff' }}
            />
          </div>
        </div>
      )}

      {/* User Track */}
      {(isPlayingUser || isComparison) && (
        <div className="relative w-full z-10">
          {isComparison && (
            <div className="absolute -top-6 left-0 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ border: '2px solid #60a5fa' }} />
              <span className="text-sm font-mono text-on-surface-variant uppercase tracking-widest">{tx.yourMotion}</span>
            </div>
          )}
          <div className="relative w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.4), transparent)' }}>
            <motion.div
              key={`user-${isPlayingUser}`}
              initial={{ left: "0%" }}
              animate={isPlayingUser ? { left: "100%" } : { left: "0%" }}
              transition={{ duration, ease: userBezier }}
              onAnimationComplete={() => { if (isPlayingUser && !isComparison) onAnimationComplete(); }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full z-20"
              style={{
                background: 'rgba(11,11,30,0.9)',
                border: '2px solid #60a5fa',
              }}
            />
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="absolute top-2.5 right-4 z-10">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            isPlayingReference || isPlayingUser
              ? "animate-pulse"
              : ""
          )} style={{
            background: isPlayingReference || isPlayingUser ? '#b06eff' : 'rgba(42,42,90,0.8)',
            boxShadow: isPlayingReference || isPlayingUser ? '0 0 6px #b06eff' : 'none'
          }}></span>
          <p className="font-mono text-sm uppercase tracking-widest text-on-surface-variant">
            {isComparison ? tx.comparing : isPlayingReference ? tx.refActive : isPlayingUser ? tx.userActive : tx.standby}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
