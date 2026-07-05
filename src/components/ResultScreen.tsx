import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { RefreshCw, Check, AlertTriangle, XOctagon } from 'lucide-react';
import type { AnalysisResult } from '../services/analyzer';

interface ResultScreenProps {
  decision: string;
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ decision, result, onReset }) => {
  const getRecommendationStyles = (recommendation: 'proceed' | 'wait' | 'avoid') => {
    switch (recommendation) {
      case 'proceed':
        return {
          bg: 'bg-emerald-50/50 border-emerald-100',
          text: 'text-brand-emerald',
          icon: <Check size={28} className="text-brand-emerald" />,
        };
      case 'avoid':
        return {
          bg: 'bg-rose-50/40 border-rose-100',
          text: 'text-rose-600',
          icon: <XOctagon size={28} className="text-rose-600" />,
        };
      case 'wait':
      default:
        return {
          bg: 'bg-amber-50/50 border-amber-100',
          text: 'text-amber-600',
          icon: <AlertTriangle size={28} className="text-amber-600" />,
        };
    }
  };

  const getMetricColor = (title: string, score: number) => {
    if (title === 'Risk Level') {
      if (score > 65) return 'bg-rose-500';
      if (score >= 35) return 'bg-amber-500';
      return 'bg-brand-emerald';
    }
    if (score > 70) return 'bg-brand-emerald';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const styles = getRecommendationStyles(result.recommendation);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as const,
      }
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-start py-8 px-4 md:px-8 max-w-4xl mx-auto w-full select-none"
    >
      {/* Decided Question Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <span className="text-xs font-semibold text-brand-muted/80 tracking-widest uppercase block mb-2">
          Decision Analysis
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-text max-w-xl mx-auto">
          "{decision}"
        </h1>
      </motion.div>

      {/* Primary recommendation alert card */}
      <motion.div 
        variants={itemVariants}
        className={`w-full p-6 md:p-8 rounded-xl border ${styles.bg} bg-brand-card shadow-premium flex flex-col md:flex-row gap-5 items-start mb-10`}
      >
        <div className="p-3 rounded-xl bg-white border border-brand-border shadow-sm flex items-center justify-center shrink-0">
          {styles.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Advisor Verdict
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-border"></span>
            <span className={`text-xs font-bold ${styles.text} uppercase tracking-wider`}>
              {result.recommendationLabel}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-brand-text mb-3 tracking-tight">
            {result.recommendationEmoji} {result.recommendationLabel}
          </h2>
          <p className="text-sm md:text-base text-brand-muted leading-relaxed mb-6 font-normal">
            {result.explanation}
          </p>

          <div className="h-px bg-brand-border/60 w-full mb-5" />

          <div>
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3">
              Supporting Factors:
            </h4>
            <ul className="space-y-2.5">
              {result.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-brand-text">
                  <span className={`mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full ${result.recommendation === 'proceed' ? 'bg-brand-emerald' : result.recommendation === 'avoid' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Analysis Metrics Grid Header */}
      <motion.div variants={itemVariants} className="w-full flex items-center justify-between mb-4 border-b border-brand-border pb-3">
        <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">
          Score Breakdown
        </h3>
        <span className="text-[11px] text-brand-muted">
          Based on reflective depth
        </span>
      </motion.div>

      {/* 6 metrics card layout */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-12"
      >
        {result.cards.map((card, idx) => (
          <div 
            key={idx} 
            className="p-5 bg-brand-card border border-brand-border rounded-xl shadow-premium flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block mb-1">
                {card.title}
              </span>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-semibold text-brand-text">
                  {card.rating}
                </span>
                <span className="text-xs font-mono text-brand-muted">
                  {card.score}%
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-1 bg-brand-border/60 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full rounded-full ${getMetricColor(card.title, card.score)}`}
                  style={{ width: `${card.score}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-brand-muted font-normal">
              {card.explanation}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Reset CTA */}
      <motion.div variants={itemVariants} className="w-full flex justify-center border-t border-brand-border pt-8 mb-8">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-8 py-3.5 border border-brand-border bg-brand-card hover:bg-brand-text hover:text-brand-bg hover:border-brand-text text-brand-text rounded-lg font-medium text-xs active:scale-[0.98] transition-all duration-200 shadow-premium"
        >
          <RefreshCw size={12} />
          <span>Start Another Decision</span>
        </button>
      </motion.div>
    </motion.div>
  );
};
