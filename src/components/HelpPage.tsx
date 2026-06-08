import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Circle, Zap, Timer, Trophy, Target, Lightbulb } from 'lucide-react';
import { Tx } from '@/src/translations';

interface HelpPageProps {
  tx: Tx;
  onBack: () => void;
}

const modeColor = {
  easy:       { border: 'rgba(96,165,250,0.3)',  bg: 'rgba(96,165,250,0.06)',  text: '#60a5fa' },
  hard:       { border: 'rgba(176,110,255,0.3)', bg: 'rgba(176,110,255,0.06)', text: '#b06eff' },
  insane:     { border: 'rgba(34,211,238,0.3)',  bg: 'rgba(34,211,238,0.06)',  text: '#22d3ee' },
  tournament: { border: 'rgba(176,110,255,0.4)', bg: 'rgba(176,110,255,0.08)', text: '#b06eff' },
};

export const HelpPage: React.FC<HelpPageProps> = ({ tx, onBack }) => {
  const modes = [
    { key: 'easy' as const,       icon: <Circle size={20} />,  title: tx.easyGuideTitle,       desc: tx.easyGuideDesc,       tags: tx.easyGuideTags },
    { key: 'hard' as const,       icon: <Zap size={20} />,     title: tx.hardGuideTitle,       desc: tx.hardGuideDesc,       tags: tx.hardGuideTags },
    { key: 'insane' as const,     icon: <Timer size={20} />,   title: tx.insaneGuideTitle,     desc: tx.insaneGuideDesc,     tags: tx.insaneGuideTags },
    { key: 'tournament' as const, icon: <Trophy size={20} />,  title: tx.tournamentGuideTitle, desc: tx.tournamentGuideDesc, tags: tx.tournamentGuideTags },
  ];

  return (
    <motion.div
      key="help"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="h-full flex items-center justify-center p-4 md:p-8"
    >
      <div className="w-full max-w-4xl h-full max-h-[88vh] flex flex-col panel-glow rounded-2xl overflow-hidden">
        {/* Header */}
        <header className="h-16 px-6 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(42,42,90,0.8)', background: 'rgba(11,11,30,0.7)' }}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-mono text-base uppercase tracking-widest"
          >
            {tx.backToMenu}
          </button>
          <h1 className="text-base font-bold uppercase tracking-widest text-on-surface">
            {tx.helpPageTitle}
          </h1>
          <div className="w-24" />
        </header>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 flex flex-col gap-8">

          {/* Intro */}
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-on-surface-variant font-mono text-base leading-relaxed uppercase tracking-wider"
          >
            {tx.helpIntro}
          </motion.p>

          {/* Mode cards */}
          <section>
            <motion.h2
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="text-base font-bold uppercase tracking-widest text-on-surface-variant mb-4"
            >
              {tx.modeGuideTitle}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modes.map((mode, i) => {
                const c = modeColor[mode.key];
                return (
                  <motion.div
                    key={mode.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + i * 0.07 }}
                    className="rounded-xl p-5 flex flex-col gap-3"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(11,11,30,0.6)', color: c.text, border: `1px solid ${c.border}` }}>
                        {mode.icon}
                      </div>
                      <span className="font-bold text-base uppercase tracking-tight text-on-surface">
                        {mode.title}
                      </span>
                    </div>
                    <p className="text-on-surface-variant font-mono text-sm leading-relaxed uppercase tracking-wide">
                      {mode.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {mode.tags.map(tag => (
                        <span key={tag}
                          className="px-2 py-0.5 rounded-md font-mono text-sm uppercase tracking-widest"
                          style={{ background: 'rgba(11,11,30,0.5)', border: `1px solid ${c.border}`, color: c.text }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Scoring */}
          <motion.section
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{ background: 'rgba(11,11,30,0.5)', border: '1px solid rgba(42,42,90,0.8)' }}
          >
            <div className="flex items-center gap-2 text-on-surface">
              <Target size={15} style={{ color: '#b06eff' }} />
              <h2 className="font-bold text-base uppercase tracking-widest">{tx.scoringTitle}</h2>
            </div>
            <p className="text-on-surface-variant font-mono text-sm leading-relaxed uppercase tracking-wide">
              {tx.scoringDesc}
            </p>
          </motion.section>

          {/* Tips */}
          <motion.section
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }}
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{ background: 'rgba(11,11,30,0.5)', border: '1px solid rgba(42,42,90,0.8)' }}
          >
            <div className="flex items-center gap-2 text-on-surface">
              <Lightbulb size={15} style={{ color: '#60a5fa' }} />
              <h2 className="font-bold text-base uppercase tracking-widest">{tx.tipsTitle}</h2>
            </div>
            <ul className="flex flex-col gap-2">
              {tx.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-on-surface-variant font-mono text-sm uppercase tracking-wide leading-relaxed">
                  <span className="font-bold flex-shrink-0" style={{ color: '#60a5fa' }}>0{i + 1}</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
};
