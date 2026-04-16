/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Eye, ArrowRight, CheckCircle2, Circle, Settings, Activity, Info, RefreshCw, Trophy, Spline } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { LEVELS, Level } from '@/src/types';
import { BezierEditor } from '@/src/components/BezierEditor';
import { SimulationStage } from '@/src/components/SimulationStage';

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'observe' | 'play' | 'result' | 'final'>('start');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [userBezier, setUserBezier] = useState<[number, number, number, number]>([0.25, 0.1, 0.25, 1]);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [observationLoops, setObservationLoops] = useState(0);

  const currentLevel = LEVELS[currentLevelIndex];

  const generateRandomBezier = (): [number, number, number, number] => {
    // Generate values between -0.5 and 1.5 for Y to allow for overshoot/anticipation
    // X must be between 0 and 1
    const x1 = Math.round(Math.random() * 100) / 100;
    const y1 = Math.round((Math.random() * 2 - 0.5) * 100) / 100;
    const x2 = Math.round(Math.random() * 100) / 100;
    const y2 = Math.round((Math.random() * 2 - 0.5) * 100) / 100;
    return [x1, y1, x2, y2];
  };

  const [randomTarget, setRandomTarget] = useState<[number, number, number, number]>(LEVELS[0].targetBezier);

  const startGame = () => {
    setGameState('observe');
    setObservationLoops(0);
    setRandomTarget(generateRandomBezier());
    setIsPlayingReference(true);
  };

  const handleAnimationComplete = () => {
    if (gameState === 'observe') {
      setIsPlayingReference(false); // Reset state first
      
      setObservationLoops(prev => {
        const nextLoop = prev + 1;
        if (nextLoop < 2) {
          // Play second loop after a short delay
          setTimeout(() => setIsPlayingReference(true), 100);
          return nextLoop;
        } else {
          // Finished 2 loops, move to play phase
          setGameState('play');
          return 0; // Reset for next round
        }
      });
    } else {
      setIsPlayingReference(false);
      setIsPlayingUser(false);
    }
  };

  const calculateScore = () => {
    const target = randomTarget;
    const diff = target.reduce((acc, val, i) => acc + Math.abs(val - userBezier[i]), 0);
    const accuracy = Math.max(0, 100 - (diff * 50));
    return Math.round(accuracy);
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    const newScores = [...roundScores, finalScore];
    setRoundScores(newScores);
    setGameState('result');
  };

  const nextRound = () => {
    if (roundScores.length < 5) {
      const nextIdx = (currentLevelIndex + 1) % LEVELS.length;
      setCurrentLevelIndex(nextIdx);
      setRandomTarget(generateRandomBezier());
      setUserBezier([0.25, 0.1, 0.25, 1]);
      setGameState('observe');
      setObservationLoops(0);
      setIsPlayingReference(true);
    } else {
      setGameState('final');
    }
  };

  const restartGame = () => {
    setCurrentLevelIndex(0);
    setRoundScores([]);
    setUserBezier([0.25, 0.1, 0.25, 1]);
    setGameState('start');
  };

  return (
    <div className="h-screen bg-surface overflow-hidden">
      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-5xl h-full max-h-[70vh] flex flex-col items-center justify-center border border-outline bg-surface text-on-surface font-body shadow-2xl text-center p-12 md:p-20 gap-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-4"
              >
                <Spline className="text-primary" size={80} />
                <h1 className="text-7xl font-black uppercase tracking-tighter">
                  Graph Copy
                </h1>
                <p className="text-on-surface-variant font-mono text-sm uppercase tracking-widest">
                  The Easing Lab / Kinetic Training
                </p>
              </motion.div>
              
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-16 py-6 bg-primary text-on-primary font-bold uppercase tracking-[0.3em] text-xl hover:brightness-110 transition-all"
              >
                Initialize
              </motion.button>
            </div>
          </motion.div>
        )}

        {gameState === 'observe' && (
          <motion.div 
            key="observe"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="h-full flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-5xl h-full max-h-[85vh] flex flex-col border border-outline bg-surface text-on-surface font-body shadow-2xl overflow-hidden">
              <header className="h-16 px-8 flex items-center justify-between border-b border-outline bg-surface-container">
                <div className="flex items-center gap-3">
                  <Eye className="text-primary" size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Observation Phase</span>
                </div>
                <div className="font-mono text-xs text-on-surface-variant">
                  LOOP {observationLoops + 1} / 2
                </div>
              </header>
              
              <div className="flex-grow p-20 flex flex-col items-center justify-center gap-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black uppercase tracking-tighter">Memorize the Motion</h2>
                  <p className="text-on-surface-variant font-mono text-xs uppercase tracking-widest">Watch the kinetic behavior carefully</p>
                </div>

                <div className="w-full max-w-2xl">
                  <SimulationStage 
                    referenceBezier={randomTarget}
                    userBezier={userBezier}
                    isPlayingReference={isPlayingReference}
                    isPlayingUser={false}
                    onAnimationComplete={handleAnimationComplete}
                  />
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-surface-container px-6 py-3 border border-outline"
                >
                  <code className="text-primary font-mono text-sm">
                    REF: cubic-bezier({randomTarget.map(v => v.toFixed(2)).join(', ')})
                  </code>
                </motion.div>

                <div className="flex gap-2">
                  <div className={cn("w-12 h-1 transition-colors duration-500", observationLoops >= 0 ? "bg-primary" : "bg-outline")} />
                  <div className={cn("w-12 h-1 transition-colors duration-500", observationLoops >= 1 ? "bg-primary" : "bg-outline")} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'play' && (
          <motion.div 
            key="play"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="h-full flex items-center justify-center p-4 md:p-6"
          >
            <div className="w-full max-w-4xl h-full max-h-[90vh] flex flex-col border border-outline bg-surface text-on-surface font-body shadow-2xl overflow-hidden">
              <header className="h-14 px-6 flex items-center justify-between border-b border-outline bg-surface-container">
                <div className="flex items-center gap-3">
                  <Spline className="text-primary" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Match Phase</span>
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant">
                  ROUND {roundScores.length + 1} / 5
                </div>
              </header>
              
              <div className="flex-grow p-6 flex flex-col gap-4 overflow-hidden">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Bezier Workspace</h2>
                  <p className="text-on-surface-variant font-mono text-[9px] uppercase tracking-widest">Adjust control points to match the motion</p>
                </div>

                <div className="flex-grow flex items-center justify-center min-h-0">
                  <div className="w-full max-w-3xl">
                    <BezierEditor value={userBezier} onChange={setUserBezier} />
                  </div>
                </div>
              </div>

              <footer className="h-20 px-8 border-t border-outline flex items-center justify-between bg-surface-container">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserBezier([0.25, 0.1, 0.25, 1])}
                  className="flex items-center gap-2 px-5 py-2.5 border border-outline text-on-surface-variant font-bold uppercase tracking-widest text-[10px] hover:bg-surface transition-colors"
                >
                  <RefreshCw size={12} /> Reset
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="px-10 py-3.5 bg-primary text-on-primary font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all"
                >
                  Apply & Compare
                </motion.button>
              </footer>
            </div>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="h-full flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-3xl h-full max-h-[75vh] flex flex-col border border-outline bg-surface text-on-surface font-body shadow-2xl overflow-hidden">
              <header className="h-16 px-8 flex items-center justify-between border-b border-outline bg-surface-container">
                <div className="flex items-center gap-3">
                  <Activity className="text-primary" size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Analysis Result</span>
                </div>
              </header>
              
              <div className="flex-grow p-16 flex flex-col items-center justify-center text-center gap-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                  className={cn(
                    "w-24 h-24 flex items-center justify-center border-2",
                    roundScores[roundScores.length - 1] >= 90 ? "border-primary text-primary" : "border-outline text-on-surface-variant"
                  )}
                >
                  {roundScores[roundScores.length - 1] >= 90 ? <Trophy size={48} /> : <RefreshCw size={48} />}
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-5xl font-black uppercase tracking-tighter">
                    {roundScores[roundScores.length - 1] >= 90 ? "Masterful!" : "Analyzed"}
                  </h3>
                  <p className="text-on-surface-variant font-mono text-xs uppercase tracking-widest">Round {roundScores.length} Accuracy</p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-8xl font-black font-mono text-primary"
                >
                  {roundScores[roundScores.length - 1]}%
                </motion.div>

                <motion.button 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ x: 5 }}
                  onClick={nextRound}
                  className="mt-4 px-12 py-5 bg-primary text-on-primary font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all flex items-center justify-center gap-3"
                >
                  {roundScores.length < 5 ? "Next Round" : "Final Results"} <ArrowRight size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'final' && (
          <motion.div 
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="h-full flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-5xl h-full max-h-[85vh] flex flex-col items-center justify-center border border-outline bg-surface text-on-surface font-body shadow-2xl text-center p-12 md:p-20 gap-8">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="text-primary" size={100} />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-5xl font-black uppercase tracking-tighter">Training Complete</h2>
                <p className="text-on-surface-variant font-mono text-sm uppercase tracking-widest">Final Performance Evaluation</p>
              </div>
              
              <div className="text-9xl font-black font-mono text-primary my-4">
                {Math.round(roundScores.reduce((a, b) => a + b, 0) / roundScores.length)}%
              </div>

              <div className="grid grid-cols-5 gap-4 w-full max-w-md mb-8">
                {roundScores.map((s, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-[10px] text-on-surface-variant font-mono">R{i+1}</span>
                    <div className="h-2 bg-surface-container border border-outline overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${s}%` }}
                        transition={{ duration: 1, delay: 1 + i * 0.1 }}
                        className="h-full bg-primary" 
                      />
                    </div>
                    <span className="text-xs font-mono">{s}%</span>
                  </motion.div>
                ))}
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restartGame}
                className="px-12 py-5 border border-primary text-primary font-bold uppercase tracking-widest text-sm hover:bg-primary hover:text-on-primary transition-all"
              >
                Restart Session
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
