/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Eye, ArrowRight, CheckCircle2, Circle, Settings, Activity, Info, RefreshCw, Trophy, Spline, Timer, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { LEVELS, Level } from '@/src/types';
import { BezierEditor } from '@/src/components/BezierEditor';
import { SimulationStage } from '@/src/components/SimulationStage';

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'observe' | 'play' | 'result' | 'final'>('start');
  const [gameMode, setGameMode] = useState<'easy' | 'hard' | 'insane' | 'tournament'>('easy');
  const [timeLimit, setTimeLimit] = useState<15 | 30 | 60>(30);
  const [timeLeft, setTimeLeft] = useState(30);
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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const isTimerActive = (gameMode === 'insane' && gameState === 'play') || 
                         (gameMode === 'tournament' && (gameState === 'observe' || gameState === 'play' || gameState === 'result'));

    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      if (gameMode === 'tournament') {
        setGameState('final');
        setIsPlayingReference(false);
        setIsPlayingUser(false);
      } else {
        // Auto-submit on timeout for insane mode
        handleSubmit();
      }
    }
    return () => clearInterval(timer);
  }, [gameState, gameMode, timeLeft]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'play') {
        if (e.code === 'Space') {
          e.preventDefault();
          setUserBezier([0.25, 0.1, 0.25, 1]);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit();
        }
      } else if (gameState === 'result') {
        if (e.key === 'Enter') {
          e.preventDefault();
          nextRound();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, userBezier, randomTarget, roundScores]);

  const startGame = (mode: 'easy' | 'hard' | 'insane' | 'tournament', limit?: 15 | 30 | 60) => {
    setGameMode(mode);
    if (mode === 'insane' && limit) {
      setTimeLimit(limit);
      setTimeLeft(limit);
    } else if (mode === 'tournament') {
      setTimeLimit(15);
      setTimeLeft(15);
    }
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
        const maxLoops = gameMode === 'easy' ? 2 : 1; // Insane also gets 1 loop
        if (nextLoop < maxLoops) {
          // Play second loop after a short delay
          setTimeout(() => setIsPlayingReference(true), 100);
          return nextLoop;
        } else {
          // Finished loops, move to play phase
          setGameState('play');
          if (gameMode === 'insane') {
            setTimeLeft(timeLimit);
          }
          setIsPlayingUser(true); // Start live preview
          return 0; // Reset for next round
        }
      });
    } else if (gameState === 'play') {
      setIsPlayingUser(false);
      setTimeout(() => setIsPlayingUser(true), 100);
    } else if (gameState === 'result') {
      setIsPlayingReference(false);
      setIsPlayingUser(false);
      // Seamless loop for comparison: restart immediately
      requestAnimationFrame(() => {
        setIsPlayingReference(true);
        setIsPlayingUser(true);
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
    setIsPlayingReference(true);
    setIsPlayingUser(true);
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
      setIsPlayingUser(false);
    } else {
      setGameState('final');
      setIsPlayingReference(false);
      setIsPlayingUser(false);
    }
  };

  const restartGame = () => {
    setCurrentLevelIndex(0);
    setRoundScores([]);
    setUserBezier([0.25, 0.1, 0.25, 1]);
    setGameState('start');
    setIsPlayingReference(false);
    setIsPlayingUser(false);
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
            <div className="w-full max-w-5xl h-full max-h-[85vh] flex flex-col items-center justify-center border border-outline bg-surface text-on-surface font-body shadow-2xl text-center p-8 md:p-12 gap-8 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-2"
              >
                <Spline className="text-primary" size={60} />
                <h1 className="text-6xl font-black uppercase tracking-tighter">
                  Graph Copy
                </h1>
                <p className="text-on-surface-variant font-mono text-xs uppercase tracking-widest">
                  The Easing Lab / Kinetic Training
                </p>
              </motion.div>
              
              <div className="flex flex-col gap-8 w-full max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startGame('easy')}
                    className="flex flex-col items-center gap-4 p-6 border border-outline hover:border-primary transition-colors group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center border border-outline group-hover:border-primary">
                      <Circle className="text-on-surface-variant group-hover:text-primary" size={24} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-black uppercase tracking-tight">Easy Mode</h3>
                      <p className="text-[10px] font-mono text-on-surface-variant uppercase mt-1">Standard Training</p>
                    </div>
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startGame('hard')}
                    className="flex flex-col items-center gap-4 p-6 border border-outline hover:border-primary transition-colors group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center border border-outline group-hover:border-primary">
                      <Zap className="text-on-surface-variant group-hover:text-primary" size={24} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-black uppercase tracking-tight">Hard Mode</h3>
                      <p className="text-[10px] font-mono text-on-surface-variant uppercase mt-1">Hidden Coordinates</p>
                    </div>
                  </motion.button>

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col items-center gap-4 p-6 border border-outline bg-surface-container/30">
                      <div className="w-12 h-12 flex items-center justify-center border border-outline text-primary">
                        <Timer size={24} />
                      </div>
                      <div className="text-center">
                        <h3 className="font-black uppercase tracking-tight">Insane Mode</h3>
                        <p className="text-[10px] font-mono text-on-surface-variant uppercase mt-1">Time Per Round</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[15, 30, 60].map((limit) => (
                        <button
                          key={limit}
                          onClick={() => startGame('insane', limit as 15 | 30 | 60)}
                          className="flex-1 py-2 border border-outline hover:border-primary font-mono text-[10px] uppercase tracking-widest transition-colors"
                        >
                          {limit}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startGame('tournament')}
                    className="flex flex-col items-center gap-4 p-6 border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-1 bg-primary text-on-primary text-[8px] font-bold uppercase tracking-widest">Hot</div>
                    <div className="w-12 h-12 flex items-center justify-center border border-primary text-primary">
                      <Trophy size={24} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-black uppercase tracking-tight">Tournament</h3>
                      <p className="text-[10px] font-mono text-primary uppercase mt-1">15s Global Limit</p>
                    </div>
                  </motion.button>
                </div>

                {/* Guide Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left border-t border-outline pt-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Info size={16} />
                      <h4 className="text-xs font-black uppercase tracking-widest">How to Play</h4>
                    </div>
                    <ul className="space-y-2 text-[10px] text-on-surface-variant font-mono uppercase tracking-wider leading-relaxed">
                      <li className="flex gap-3">
                        <span className="text-primary font-black">01</span>
                        <span>Observe the Reference Motion and memorize its acceleration pattern.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-primary font-black">02</span>
                        <span>Adjust the Bezier handles to replicate the motion curve.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-primary font-black">03</span>
                        <span>Apply to compare your motion with the original and see your accuracy score.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Settings size={16} />
                      <h4 className="text-xs font-black uppercase tracking-widest">Keyboard Shortcuts</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3 border border-outline bg-surface-container/20">
                        <span className="text-[9px] font-mono text-on-surface-variant uppercase">Reset Graph</span>
                        <kbd className="px-2 py-1 bg-surface-container border border-outline rounded text-[9px] font-black">SPACE</kbd>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-outline bg-surface-container/20">
                        <span className="text-[9px] font-mono text-on-surface-variant uppercase">Apply / Next</span>
                        <kbd className="px-2 py-1 bg-surface-container border border-outline rounded text-[9px] font-black">ENTER</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                  LOOP {observationLoops + 1} / {gameMode === 'hard' ? 1 : 2}
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
                    duration={1}
                  />
                </div>

                {gameMode === 'easy' && (
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
                )}

                <div className="flex gap-2">
                  <div className={cn("w-12 h-1 transition-colors duration-500", observationLoops >= 0 ? "bg-primary" : "bg-outline")} />
                  {gameMode === 'easy' && (
                    <div className={cn("w-12 h-1 transition-colors duration-500", observationLoops >= 1 ? "bg-primary" : "bg-outline")} />
                  )}
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
            <div className="w-full max-w-6xl h-full max-h-[90vh] flex flex-col border border-outline bg-surface text-on-surface font-body shadow-2xl overflow-hidden">
              <header className="h-14 px-6 flex items-center justify-between border-b border-outline bg-surface-container">
                <div className="flex items-center gap-3">
                  <Spline className="text-primary" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Match Phase</span>
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant flex items-center gap-4">
                  {(gameMode === 'insane' || gameMode === 'tournament') && (
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 border-2 transition-all duration-300",
                      timeLeft <= 5 
                        ? "border-primary bg-primary/10 text-primary scale-110 shadow-[0_0_15px_rgba(204,255,0,0.3)]" 
                        : "border-outline bg-surface-container"
                    )}>
                      <Timer size={14} className={cn(timeLeft <= 5 && "animate-spin-slow")} />
                      <span className="text-sm font-black tracking-tighter">{timeLeft}S</span>
                    </div>
                  )}
                  <span className="bg-surface-container px-3 py-1 border border-outline">ROUND {roundScores.length + 1} / 5</span>
                </div>
              </header>
              
              <div className="flex-grow flex flex-row overflow-hidden">
                {/* Left Column: Preview & Info */}
                <div className="w-1/3 border-r border-outline p-6 flex flex-col gap-6 bg-surface-container/30">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Live Preview</h2>
                    <p className="text-on-surface-variant font-mono text-[9px] uppercase tracking-widest">Observe your current curve behavior</p>
                  </div>

                  <div className="w-full">
                    <SimulationStage 
                      referenceBezier={randomTarget}
                      userBezier={userBezier}
                      isPlayingReference={false}
                      isPlayingUser={isPlayingUser}
                      onAnimationComplete={handleAnimationComplete}
                      duration={1}
                    />
                  </div>

                  <div className="mt-auto p-4 border border-outline bg-surface-container text-[10px] font-mono text-on-surface-variant leading-relaxed">
                    <p className="font-bold text-primary mb-2 uppercase">Pro Tips:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Hold <kbd className="bg-surface px-1 border border-outline">SHIFT</kbd> to snap to grid</li>
                      <li>Y-axis is expanded for <span className="text-primary">Bounce</span> & <span className="text-primary">Elastic</span> effects</li>
                      <li>Match the ball's rhythm, not just the curve shape</li>
                    </ul>
                  </div>
                </div>

                {/* Right Column: Editor */}
                <div className="flex-grow p-6 flex flex-col gap-4 overflow-hidden">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Bezier Workspace</h2>
                    <p className="text-on-surface-variant font-mono text-[9px] uppercase tracking-widest">Adjust control points to match the motion</p>
                  </div>

                  <div className="flex-grow flex items-center justify-center min-h-0">
                    <div className="w-full max-w-2xl h-full flex items-center">
                      <BezierEditor 
                        value={userBezier} 
                        onChange={setUserBezier} 
                        hideValues={gameMode === 'hard'}
                      />
                    </div>
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
            <div className="w-full max-w-3xl h-full max-h-[90vh] flex flex-col border border-outline bg-surface text-on-surface font-body shadow-2xl overflow-hidden">
              <header className="h-14 px-6 flex items-center justify-between border-b border-outline bg-surface-container">
                <div className="flex items-center gap-3">
                  <Activity className="text-primary" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Analysis Result</span>
                </div>
              </header>
              
              <div className="flex-grow p-8 flex flex-col items-center justify-center text-center gap-4 overflow-y-auto">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                  className={cn(
                    "w-16 h-16 flex items-center justify-center border-2",
                    roundScores[roundScores.length - 1] >= 90 ? "border-primary text-primary" : "border-outline text-on-surface-variant"
                  )}
                >
                  {roundScores[roundScores.length - 1] >= 90 ? <Trophy size={32} /> : <RefreshCw size={32} />}
                </motion.div>

                <div className="space-y-1">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">
                    {roundScores[roundScores.length - 1] >= 90 ? "Masterful!" : "Analyzed"}
                  </h3>
                  <p className="text-on-surface-variant font-mono text-[10px] uppercase tracking-widest">Round {roundScores.length} Accuracy</p>
                </div>

                <div className="w-full max-w-md">
                  <SimulationStage 
                    referenceBezier={randomTarget}
                    userBezier={userBezier}
                    isPlayingReference={isPlayingReference}
                    isPlayingUser={isPlayingUser}
                    onAnimationComplete={handleAnimationComplete}
                    duration={1}
                    forceComparisonMode={true}
                  />
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-6xl font-black font-mono text-primary"
                >
                  {roundScores[roundScores.length - 1]}%
                </motion.div>

                <motion.button 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ x: 5 }}
                  onClick={nextRound}
                  className="px-10 py-4 bg-primary text-on-primary font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all flex items-center justify-center gap-3"
                >
                  {roundScores.length < 5 ? "Next Round" : "Final Results"} <ArrowRight size={18} />
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
                {roundScores.length > 0 
                  ? `${Math.round(roundScores.reduce((a, b) => a + b, 0) / roundScores.length)}%`
                  : <span className="text-6xl text-primary animate-pulse">TIME OUT</span>
                }
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
