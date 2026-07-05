import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingPage } from './components/LandingPage';
import { DecisionFlow } from './components/DecisionFlow';
import { ResultScreen } from './components/ResultScreen';
import type { Answer, AnalysisResult } from './services/analyzer';
import { BrainCircuit } from 'lucide-react';

type AppStage = 'landing' | 'flow' | 'analyzing' | 'result';

const LOADING_STATUSES = [
  'Reviewing your decision context...',
  'Assessing need versus want priorities...',
  'Evaluating financial readiness...',
  'Synthesizing long-term opportunity cost...',
  'Formulating rational verdict...'
];

const mapBackendToResult = (backendData: any): AnalysisResult => {
  let recommendation: 'proceed' | 'wait' | 'avoid' = 'wait';
  if (backendData.recommendation === 'Proceed') {
    recommendation = 'proceed';
  } else if (backendData.recommendation === 'Not Recommended') {
    recommendation = 'avoid';
  }

  // Use pros for proceed, cons for avoid/wait
  const reasons = recommendation === 'proceed' ? (backendData.pros || []) : (backendData.cons || []);

  const explanation = `${backendData.summary}\n\n${backendData.finalAdvice}`;

  const cards = [
    {
      title: 'Need vs Want',
      score: backendData.metrics.needVsWant.score,
      rating: backendData.metrics.needVsWant.rating,
      explanation: backendData.metrics.needVsWant.explanation,
    },
    {
      title: 'Urgency',
      score: backendData.metrics.urgency.score,
      rating: backendData.metrics.urgency.rating,
      explanation: backendData.metrics.urgency.explanation,
    },
    {
      title: 'Financial Readiness',
      score: backendData.metrics.financialReadiness.score,
      rating: backendData.metrics.financialReadiness.rating,
      explanation: backendData.metrics.financialReadiness.explanation,
    },
    {
      title: 'Long-term Value',
      score: backendData.metrics.longTermValue.score,
      rating: backendData.metrics.longTermValue.rating,
      explanation: backendData.metrics.longTermValue.explanation,
    },
    {
      title: 'Risk Level',
      score: backendData.metrics.riskLevel.score,
      rating: backendData.metrics.riskLevel.rating,
      explanation: backendData.metrics.riskLevel.explanation,
    },
    {
      title: 'Confidence Score',
      score: backendData.metrics.confidence.score,
      rating: backendData.metrics.confidence.rating,
      explanation: backendData.metrics.confidence.explanation,
    },
  ];

  return {
    recommendation,
    recommendationLabel: backendData.recommendation,
    recommendationEmoji: recommendation === 'proceed' ? '✅' : recommendation === 'avoid' ? '❌' : '⚠️',
    explanation,
    reasons,
    cards,
  };
};

function App() {
  const [stage, setStage] = useState<AppStage>('landing');
  const [decision, setDecision] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Custom cycling text for the thinking stage
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (stage === 'analyzing') {
      setLoadingTextIndex(0);
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stage]);

  const handleStart = () => {
    setStage('flow');
    setDecision('');
    setResult(null);
  };

  const handleFlowComplete = async (decText: string, ansList: Answer[]) => {
    setDecision(decText);
    setStage('analyzing');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: decText,
          responses: ansList.map((a) => ({
            question: a.questionText,
            answer: a.answerText,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server error occurred during analysis.');
      }

      const data = await response.json();
      const mappedResult = mapBackendToResult(data);
      
      setResult(mappedResult);
      setStage('result');
    } catch (err: any) {
      console.error("Analysis failed", err);
      alert(err.message || 'Could not complete the analysis. Make sure the backend is active.');
      setStage('landing');
    }
  };

  const handleReset = () => {
    setStage('landing');
    setDecision('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans selection:bg-brand-accent/10 selection:text-brand-accent">
      {/* Premium Top Navigation Bar */}
      <header className="border-b border-brand-border bg-brand-bg/80 backdrop-blur-md sticky top-0 z-40 w-full py-4 px-6 md:px-12 flex justify-between items-center select-none">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleReset}>
          <div className="w-6 h-6 rounded-lg bg-brand-text flex items-center justify-center text-brand-bg shadow-sm">
            <span className="text-xs font-bold font-mono">D</span>
          </div>
          <span className="font-sans font-semibold tracking-tight text-sm text-brand-text">
            Decision Maker
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest bg-brand-card border border-brand-border px-2 py-1 rounded shadow-sm">
            v1.0.0
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center items-center py-6 w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {stage === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <LandingPage onStart={handleStart} />
            </motion.div>
          )}

          {stage === 'flow' && (
            <motion.div
              key="flow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <DecisionFlow 
                onComplete={handleFlowComplete} 
                onBackToLanding={handleReset} 
              />
            </motion.div>
          )}

          {stage === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 px-4 max-w-md text-center"
            >
              <div className="relative mb-8">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="p-6 bg-brand-card border border-brand-border rounded-2xl shadow-premium text-brand-muted flex items-center justify-center"
                >
                  <BrainCircuit size={48} strokeWidth={1.2} className="text-brand-text" />
                </motion.div>
                <div className="absolute inset-0 bg-brand-accent/5 rounded-2xl filter blur-xl -z-10" />
              </div>
              
              {/* Cycling reflective thoughts */}
              <div className="h-6 overflow-hidden mb-3">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={loadingTextIndex}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-sm font-semibold text-brand-text uppercase tracking-wider"
                  >
                    {LOADING_STATUSES[loadingTextIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <p className="text-xs text-brand-muted font-normal max-w-[260px] leading-relaxed">
                Applying a quiet, rational framework to balance immediate impulse against long-term utility.
              </p>
            </motion.div>
          )}

          {stage === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <ResultScreen 
                decision={decision} 
                result={result} 
                onReset={handleReset} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Premium Quiet Footer */}
      <footer className="border-t border-brand-border py-6 px-6 text-center select-none text-[11px] text-brand-muted font-normal">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Decision Maker. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-brand-text cursor-default transition-colors">Quiet Design</span>
            <span className="hover:text-brand-text cursor-default transition-colors">Rational Framework</span>
            <span className="hover:text-brand-text cursor-default transition-colors">Privacy First</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
