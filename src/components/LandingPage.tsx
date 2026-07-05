import React from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-between min-h-[80vh] py-16 px-4 md:px-8 max-w-4xl mx-auto w-full select-none">
      {/* Top Brand Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-brand-card shadow-sm text-xs font-medium tracking-wide text-brand-muted"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span>
        <span className="font-sans text-[11px] tracking-widest uppercase">Structured Reflection Engine</span>
      </motion.div>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 p-4 rounded-2xl bg-brand-card border border-brand-border shadow-premium text-brand-accent"
        >
          <Compass size={32} strokeWidth={1.5} />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-text leading-[1.1] mb-6"
        >
          Think Before <br className="hidden sm:inline" /> You Decide.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-md md:text-lg text-brand-muted max-w-lg leading-relaxed mb-12 font-normal"
        >
          Make better life and business decisions through structured reflection instead of impulse. Connect with a calm, rational advisor.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={onStart}
            className="group relative flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-full border border-brand-border bg-brand-card hover:bg-brand-text hover:text-brand-bg hover:border-brand-text text-brand-text text-[11px] font-semibold tracking-widest uppercase shadow-premium active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse group-hover:bg-brand-bg transition-colors duration-300"></span>
            Start Decision
            <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-200">
              →
            </span>
          </button>
        </motion.div>
      </div>

      {/* Footer / Context */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-[11px] tracking-wider text-brand-muted uppercase font-medium flex items-center gap-6"
      >
        <span>No Randomness</span>
        <span className="w-1 h-1 rounded-full bg-brand-border"></span>
        <span>Isolated Architecture</span>
        <span className="w-1 h-1 rounded-full bg-brand-border"></span>
        <span>Calm Guidance</span>
      </motion.div>
    </div>
  );
};
