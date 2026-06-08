/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, ArrowRight, Circle, Settings, Activity, Info, RefreshCw, Trophy, Spline, Timer, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { LEVELS, Level } from '@/src/types';
import { BezierEditor } from '@/src/components/BezierEditor';
import { SimulationStage } from '@/src/components/SimulationStage';
import { HelpPage } from '@/src/components/HelpPage';
import { translations, Lang } from '@/src/translations';

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const tx = translations[lang];

  const [gameState, setGameState] = useState<'start' | 'observe' | 'play' | 'result' | 'final' | 'help'>('start');
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
    const x1 = Math.round(Math.random() * 100) / 100;
    const y1 = Math.round((Math.random() * 1.2 - 0.1) * 100) / 100; // -0.1 to 1.1
    const x2 = Math.round(Math.random() * 100) / 100;
    const y2 = Math.round((Math.random() * 1.2 - 0.1) * 100) / 100;
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
    const getBezierPoint = (t: number, p: [number, number, number, number]) => {
      const [x1, y1, x2, y2] = p;
      // Parametric Cubic Bezier formula: P0=(0,0), P3=(1,1)
      const x = 3 * Math.pow(1 - t, 2) * t * x1 + 3 * (1 - t) * Math.pow(t, 2) * x2 + Math.pow(t, 3);
      const y = 3 * Math.pow(1 - t, 2) * t * y1 + 3 * (1 - t) * Math.pow(t, 2) * y2 + Math.pow(t, 3);
      return { x, y };
    };

    let totalDist = 0;
    const samples = 25;
    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      const ptTarget = getBezierPoint(t, randomTarget);
      const ptUser = getBezierPoint(t, userBezier);
      
      // Calculate Euclidean distance between points at the same parametric step
      const dist = Math.sqrt(
        Math.pow(ptTarget.x - ptUser.x, 2) + 
        Math.pow(ptTarget.y - ptUser.y, 2)
      );
      totalDist += dist;
    }

    const avgDist = totalDist / samples;
    
    // Scoring logic: use exponential decay for a more natural feel
    // avgDist of 0.0 = 100%
    // avgDist of 0.1 = ~60%
    // avgDist of 0.2 = ~36%
    const score = Math.round(100 * Math.exp(-avgDist * 5));
    
    return Math.max(0, Math.min(100, score));
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    const newScores = [...roundScores, finalScore];
    setRoundScores(newScores);

    if (gameMode === 'tournament') {
      setIsPlayingReference(false);
      setIsPlayingUser(false);
      if (newScores.length < 5) {
        const nextIdx = (currentLevelIndex + 1) % LEVELS.length;
        setCurrentLevelIndex(nextIdx);
        setRandomTarget(generateRandomBezier());
        setUserBezier([0.25, 0.1, 0.25, 1]);
        setGameState('observe');
        setObservationLoops(0);
        setTimeLeft(15);
        setIsPlayingReference(true);
      } else {
        setGameState('final');
      }
    } else {
      setGameState('result');
      setIsPlayingReference(true);
      setIsPlayingUser(true);
    }
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
    <div className="h-screen motion-bg overflow-hidden relative">
      <div className="orb-purple absolute -top-20 -left-20 opacity-60 pointer-events-none" />
      <div className="orb-blue absolute -bottom-20 -right-10 opacity-50 pointer-events-none" />

      {/* ── Language toggle (always visible) ── */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setLang(l => l === 'en' ? 'th' : 'en')}
        className="fixed top-4 right-4 z-[200] px-3 py-1.5 rounded-lg font-mono text-base font-bold uppercase tracking-widest transition-all"
        style={{ background: 'rgba(11,11,30,0.85)', border: '1px solid rgba(176,110,255,0.35)', color: '#b06eff', backdropFilter: 'blur(8px)' }}
      >
        {tx.otherLang}
      </motion.button>

      <AnimatePresence mode="wait">

        {/* ── HELP ── */}
        {gameState === 'help' && (
          <HelpPage key="help" tx={tx} onBack={() => setGameState('start')} />
        )}

        {/* ── START ── */}
        {gameState === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="h-full flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-5xl h-full max-h-[88vh] flex flex-col items-center justify-center panel-glow rounded-2xl text-on-surface text-center p-8 md:p-12 gap-8 overflow-y-auto relative">
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-30">
                <div className="graph-grid w-full h-full" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-3 relative z-10"
              >
                <motion.div className="float-anim">
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                    {/* Axes */}
                    <line x1="12" y1="14" x2="12" y2="88" stroke="rgba(96,165,250,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="12" y1="88" x2="88" y2="88" stroke="rgba(96,165,250,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                    {/* Mid grid */}
                    <line x1="12" y1="51" x2="88" y2="51" stroke="rgba(42,42,90,0.6)" strokeWidth="1" strokeDasharray="3 3"/>
                    <line x1="50" y1="14" x2="50" y2="88" stroke="rgba(42,42,90,0.6)" strokeWidth="1" strokeDasharray="3 3"/>
                    {/* Glow layer */}
                    <motion.path
                      d="M 12 88 C 42 88, 58 14, 88 14"
                      animate={{ d: [
                        "M 12 88 C 42 88, 58 14, 88 14",
                        "M 12 88 C 12 14, 88 88, 88 14",
                        "M 12 88 C 12 88, 88 14, 88 14",
                        "M 12 88 C 50 88, 50 14, 88 14",
                        "M 12 88 C 12 0, 88 102, 88 14",
                        "M 12 88 C 42 88, 58 14, 88 14",
                      ]}}
                      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
                      stroke="rgba(176,110,255,0.35)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      style={{ filter: 'blur(5px)' }}
                    />
                    {/* Main curve */}
                    <motion.path
                      d="M 12 88 C 42 88, 58 14, 88 14"
                      animate={{ d: [
                        "M 12 88 C 42 88, 58 14, 88 14",
                        "M 12 88 C 12 14, 88 88, 88 14",
                        "M 12 88 C 12 88, 88 14, 88 14",
                        "M 12 88 C 50 88, 50 14, 88 14",
                        "M 12 88 C 12 0, 88 102, 88 14",
                        "M 12 88 C 42 88, 58 14, 88 14",
                      ]}}
                      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
                      stroke="#b06eff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Anchor dots */}
                    <circle cx="12" cy="88" r="3.5" fill="rgba(96,165,250,0.8)"/>
                    <circle cx="88" cy="14" r="3.5" fill="rgba(176,110,255,0.8)"/>
                  </svg>
                </motion.div>
                <h1 className="text-6xl font-black uppercase tracking-tighter text-primary flex">
                  {Array.from(tx.gameTitle).map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 1, x: -7 }}
                      animate={{ x: 7 }}
                      transition={{
                        duration: 1.4,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatType: 'mirror',
                        ease: 'easeInOut',
                      }}
                    >
                      {char === ' ' ? ' ' : char}
                    </motion.span>
                  ))}
                </h1>
                <p className="text-on-surface-variant font-mono text-base uppercase tracking-widest">{tx.gameSubtitle}</p>
              </motion.div>

              <div className="flex flex-col gap-8 w-full max-w-4xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Easy */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => startGame('easy')}
                    className="glass-card flex flex-col items-center gap-4 p-6 rounded-xl transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(176,110,255,0.1)', border: '1px solid rgba(176,110,255,0.3)' }}>
                      <Circle className="text-primary" size={22} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold uppercase tracking-tight text-on-surface">{tx.easyMode}</h3>
                      <p className="text-base font-mono text-on-surface-variant uppercase mt-1">{tx.easyModeDesc}</p>
                    </div>
                  </motion.button>

                  {/* Hard */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
                    whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => startGame('hard')}
                    className="glass-card flex flex-col items-center gap-4 p-6 rounded-xl transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)' }}>
                      <Zap className="text-secondary" size={22} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold uppercase tracking-tight text-on-surface">{tx.hardMode}</h3>
                      <p className="text-base font-mono text-on-surface-variant uppercase mt-1">{tx.hardModeDesc}</p>
                    </div>
                  </motion.button>

                  {/* Insane */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.39 }}
                    className="flex flex-col gap-2"
                  >
                    <div className="glass-card flex flex-col items-center gap-4 p-6 rounded-xl">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)' }}>
                        <Timer size={22} style={{ color: '#22d3ee' }} />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold uppercase tracking-tight text-on-surface">{tx.insaneMode}</h3>
                        <p className="text-base font-mono text-on-surface-variant uppercase mt-1">{tx.insaneModeDesc}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[15, 30, 60].map((limit) => (
                        <motion.button
                          key={limit}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => startGame('insane', limit as 15 | 30 | 60)}
                          className="flex-1 py-2 rounded-md font-mono text-base uppercase tracking-widest transition-all"
                          style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.25)', color: '#22d3ee' }}
                        >
                          {limit}s
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Tournament */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
                    whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => startGame('tournament')}
                    className="flex flex-col items-center gap-4 p-6 rounded-xl transition-all relative overflow-hidden"
                    style={{ background: 'rgba(176,110,255,0.08)', border: '1px solid rgba(176,110,255,0.5)' }}
                  >
                    <div className="absolute top-0 right-0 px-2 py-0.5 text-base font-bold uppercase tracking-widest rounded-bl-lg"
                      style={{ background: 'linear-gradient(135deg, #b06eff, #60a5fa)', color: '#04040f' }}>{tx.hot}</div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(176,110,255,0.15)', border: '1px solid rgba(176,110,255,0.5)' }}>
                      <Trophy className="text-primary" size={22} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold uppercase tracking-tight text-primary">{tx.tournament}</h3>
                      <p className="text-base font-mono text-primary uppercase mt-1">{tx.tournamentDesc}</p>
                    </div>
                  </motion.button>
                </div>

                {/* Guide + Help button */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                  className="flex flex-col gap-6 text-left pt-6"
                  style={{ borderTop: '1px solid rgba(42,42,90,0.8)' }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Info size={14} />
                        <h4 className="text-base font-bold uppercase tracking-widest">{tx.howToPlay}</h4>
                      </div>
                      <ul className="space-y-2 text-base text-on-surface-variant font-mono uppercase tracking-wider leading-relaxed">
                        {[tx.step1, tx.step2, tx.step3].map((txt, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="text-primary font-bold">0{i + 1}</span>
                            <span>{txt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-secondary">
                        <Settings size={14} />
                        <h4 className="text-base font-bold uppercase tracking-widest">{tx.keyboardShortcuts}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {([[tx.resetGraph, 'SPACE'], [tx.applyNext, 'ENTER']] as [string, string][]).map(([label, key]) => (
                          <div key={key} className="flex items-center justify-between p-3 rounded-lg"
                            style={{ background: 'rgba(11,11,30,0.6)', border: '1px solid rgba(42,42,90,0.6)' }}>
                            <span className="text-sm font-mono text-on-surface-variant uppercase">{label}</span>
                            <kbd className="px-2 py-1 rounded text-sm font-bold"
                              style={{ background: 'rgba(176,110,255,0.12)', border: '1px solid rgba(176,110,255,0.3)', color: '#b06eff' }}>{key}</kbd>
                          </div>
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setGameState('help')}
                        className="w-full py-2.5 rounded-lg font-mono text-base font-bold uppercase tracking-widest transition-all"
                        style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa' }}
                      >
                        {tx.helpBtn} →
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── OBSERVE ── */}
        {gameState === 'observe' && (
          <motion.div
            key="observe"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="h-full flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-5xl h-full max-h-[85vh] flex flex-col panel-glow rounded-2xl overflow-hidden">
              <header className="h-16 px-8 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(42,42,90,0.8)', background: 'rgba(11,11,30,0.7)' }}>
                <div className="flex items-center gap-3">
                  <Eye className="text-primary" size={16} />
                  <span className="text-base font-bold uppercase tracking-widest text-on-surface">{tx.observationPhase}</span>
                </div>
                <div className="font-mono text-base text-on-surface-variant px-3 py-1 rounded-md"
                  style={{ background: 'rgba(176,110,255,0.08)', border: '1px solid rgba(176,110,255,0.2)' }}>
                  {tx.loopLabel(observationLoops + 1, gameMode === 'hard' ? 1 : 2)}
                </div>
              </header>

              <div className="flex-grow p-16 flex flex-col items-center justify-center gap-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-primary">{tx.memorizeMotion}</h2>
                  <p className="text-on-surface-variant font-mono text-base uppercase tracking-widest">{tx.memorizeDesc}</p>
                </motion.div>

                <div className="w-full max-w-2xl">
                  <SimulationStage
                    referenceBezier={randomTarget} userBezier={userBezier}
                    isPlayingReference={isPlayingReference} isPlayingUser={false}
                    onAnimationComplete={handleAnimationComplete} duration={1} tx={tx}
                  />
                </div>

                {gameMode === 'easy' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="px-5 py-2.5 rounded-lg relative overflow-hidden shimmer-line"
                    style={{ background: 'rgba(176,110,255,0.08)', border: '1px solid rgba(176,110,255,0.3)' }}
                  >
                    <code className="text-primary font-mono text-base relative z-10">
                      {tx.ref}: cubic-bezier({randomTarget.map(v => v.toFixed(2)).join(', ')})
                    </code>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  {(gameMode === 'easy' ? [0, 1] : [0]).map(idx => (
                    <motion.div key={idx} className="w-14 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(42,42,90,0.6)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: observationLoops > idx ? '100%' : observationLoops === idx ? '50%' : '0%' }}
                        transition={{ duration: 0.4 }}
                        style={{ background: 'linear-gradient(90deg, #7c3aed, #b06eff)' }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PLAY ── */}
        {gameState === 'play' && (
          <motion.div
            key="play"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="h-full flex items-center justify-center p-4 md:p-6"
          >
            <div className="w-full max-w-6xl h-full max-h-[90vh] flex flex-col panel-glow rounded-2xl overflow-hidden">
              <header className="h-14 px-6 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(42,42,90,0.8)', background: 'rgba(11,11,30,0.7)' }}>
                <div className="flex items-center gap-3">
                  <Spline className="text-primary" size={15} />
                  <span className="text-base font-bold uppercase tracking-widest text-on-surface">{tx.matchPhase}</span>
                </div>
                <div className="font-mono text-base text-on-surface-variant flex items-center gap-4">
                  {(gameMode === 'insane' || gameMode === 'tournament') && (
                    <motion.div
                      animate={timeLeft <= 5 ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-md"
                      style={timeLeft <= 5
                        ? { background: 'rgba(176,110,255,0.25)', border: '2px solid #b06eff', color: '#e0c4ff' }
                        : { background: 'rgba(11,11,30,0.6)', border: '1px solid rgba(42,42,90,0.8)' }}
                    >
                      <Timer size={13} className={cn(timeLeft <= 5 && "animate-spin")} />
                      <span className="text-base font-bold tracking-tighter">{timeLeft}S</span>
                    </motion.div>
                  )}
                  <span className="px-3 py-1 rounded-md text-base"
                    style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa' }}>
                    {tx.roundLabel(roundScores.length + 1, 5)}
                  </span>
                </div>
              </header>

              <div className="flex-grow flex flex-row overflow-hidden">
                <div className="w-1/3 p-6 flex flex-col gap-5 overflow-hidden"
                  style={{ borderRight: '1px solid rgba(42,42,90,0.8)', background: 'rgba(7,7,26,0.4)' }}>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-tighter text-on-surface">{tx.livePreview}</h2>
                    <p className="text-on-surface-variant font-mono text-sm uppercase tracking-widest mt-0.5">{tx.livePreviewDesc}</p>
                  </div>
                  <SimulationStage
                    referenceBezier={randomTarget} userBezier={userBezier}
                    isPlayingReference={false} isPlayingUser={isPlayingUser}
                    onAnimationComplete={handleAnimationComplete} duration={1} tx={tx}
                  />
                  <div className="mt-auto p-4 rounded-xl text-base font-mono text-on-surface-variant leading-relaxed"
                    style={{ background: 'rgba(11,11,30,0.6)', border: '1px solid rgba(42,42,90,0.6)' }}>
                    <p className="font-bold text-primary mb-2 uppercase">{tx.proTips}</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>{tx.tipShift}</li>
                      <li>{tx.tipBounce}</li>
                      <li>{tx.tipRhythm}</li>
                    </ul>
                  </div>
                </div>

                <div className="flex-grow p-6 flex flex-col gap-4 overflow-hidden">
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-tighter text-on-surface">{tx.bezierWorkspace}</h2>
                    <p className="text-on-surface-variant font-mono text-sm uppercase tracking-widest mt-0.5">{tx.workspaceDesc}</p>
                  </div>
                  <div className="flex-grow flex items-center justify-center min-h-0">
                    <div className="w-full max-w-2xl h-full flex items-center">
                      <BezierEditor value={userBezier} onChange={setUserBezier} hideValues={gameMode === 'hard'} />
                    </div>
                  </div>
                </div>
              </div>

              <footer className="h-20 px-8 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(42,42,90,0.8)', background: 'rgba(11,11,30,0.7)' }}>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setUserBezier([0.25, 0.1, 0.25, 1])}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold uppercase tracking-widest text-base transition-all"
                  style={{ background: 'rgba(42,42,90,0.3)', border: '1px solid rgba(42,42,90,0.8)', color: '#7070a0' }}
                >
                  <RefreshCw size={12} /> {tx.resetBtn}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  className="aurora-btn px-10 py-3.5 rounded-xl font-bold uppercase tracking-widest text-base transition-all"
                  style={{ color: '#04040f' }}
                >
                  {tx.applyCompare}
                </motion.button>
              </footer>
            </div>
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {gameState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="h-full flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-3xl h-full max-h-[90vh] flex flex-col panel-glow rounded-2xl overflow-hidden">
              <header className="h-14 px-6 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(42,42,90,0.8)', background: 'rgba(11,11,30,0.7)' }}>
                <div className="flex items-center gap-3">
                  <Activity className="text-primary" size={15} />
                  <span className="text-base font-bold uppercase tracking-widest text-on-surface">{tx.analysisResult}</span>
                </div>
              </header>

              <div className="flex-grow p-8 flex flex-col items-center justify-center text-center gap-5 overflow-y-auto">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
                  className="w-16 h-16 flex items-center justify-center rounded-2xl"
                  style={roundScores[roundScores.length - 1] >= 90
                    ? { background: 'rgba(176,110,255,0.15)', border: '2px solid rgba(176,110,255,0.6)' }
                    : { background: 'rgba(42,42,90,0.3)', border: '2px solid rgba(42,42,90,0.8)' }}
                >
                  {roundScores[roundScores.length - 1] >= 90
                    ? <Trophy size={30} style={{ color: '#b06eff' }} />
                    : <RefreshCw size={30} className="text-on-surface-variant" />}
                </motion.div>

                <div className="space-y-1">
                  <h3 className={cn("text-3xl font-black uppercase tracking-tighter", roundScores[roundScores.length - 1] >= 90 ? "text-primary" : "text-on-surface")}>
                    {roundScores[roundScores.length - 1] >= 90 ? tx.masterful : tx.analyzed}
                  </h3>
                  <p className="text-on-surface-variant font-mono text-base uppercase tracking-widest">{tx.roundAccuracy(roundScores.length)}</p>
                </div>

                <div className="w-full max-w-md">
                  <SimulationStage
                    referenceBezier={randomTarget} userBezier={userBezier}
                    isPlayingReference={isPlayingReference} isPlayingUser={isPlayingUser}
                    onAnimationComplete={handleAnimationComplete} duration={1}
                    forceComparisonMode={true} tx={tx}
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="text-6xl font-black font-mono text-primary"
                >
                  {roundScores[roundScores.length - 1]}%
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  whileHover={{ x: 5 }} whileTap={{ scale: 0.97 }}
                  onClick={nextRound}
                  className="aurora-btn px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-base flex items-center justify-center gap-3 transition-all"
                  style={{ color: '#04040f' }}
                >
                  {roundScores.length < 5 ? tx.nextRound : tx.finalResults} <ArrowRight size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── FINAL ── */}
        {gameState === 'final' && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
            className="h-full flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-5xl h-full max-h-[85vh] flex flex-col items-center justify-center panel-glow rounded-2xl text-center p-12 md:p-20 gap-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="graph-grid w-full h-full rounded-2xl" />
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <Trophy className="text-primary" size={90} />
              </motion.div>

              <div className="space-y-2 relative z-10">
                <h2 className="text-4xl font-black uppercase tracking-tighter text-primary">{tx.trainingComplete}</h2>
                <p className="text-on-surface-variant font-mono text-base uppercase tracking-widest">{tx.finalEval}</p>
              </div>

              <motion.div
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.3 }}
                className="text-8xl font-black font-mono text-primary relative z-10"
              >
                {roundScores.length > 0
                  ? `${Math.round(roundScores.reduce((a, b) => a + b, 0) / roundScores.length)}%`
                  : <span className="text-6xl animate-pulse" style={{ color: '#b06eff' }}>{tx.timeout}</span>}
              </motion.div>

              <div className="grid grid-cols-5 gap-3 w-full max-w-md relative z-10">
                {roundScores.map((s, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex flex-col gap-2 items-center"
                  >
                    <span className="text-base text-on-surface-variant font-mono">R{i + 1}</span>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(42,42,90,0.6)' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${s}%` }}
                        transition={{ duration: 1, delay: 1 + i * 0.12, ease: "easeOut" }}
                        className="h-full rounded-full score-bar"
                      />
                    </div>
                    <span className="text-base font-mono text-on-surface">{s}%</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={restartGame}
                className="px-12 py-4 rounded-xl font-bold uppercase tracking-widest text-base transition-all relative z-10"
                style={{ background: 'rgba(176,110,255,0.1)', border: '1px solid rgba(176,110,255,0.5)', color: '#b06eff' }}
              >
                {tx.restartSession}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 right-0 pointer-events-none flex justify-center z-[100]">
        <div className="px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(4,4,15,0.7)', border: '1px solid rgba(42,42,90,0.6)', backdropFilter: 'blur(8px)' }}>
          <p className="text-xs font-mono text-on-surface-variant uppercase tracking-[0.15em]">
            <span className="font-bold" style={{ color: '#b06eff' }}>blurChan.</span> with Gemini Ai studio
          </p>
        </div>
      </footer>
    </div>
  );
}
