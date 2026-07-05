import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import type { Answer } from '../services/analyzer';

const DECISION_EXAMPLES = [
  'Should I buy a MacBook?',
  'Should I switch jobs?',
  'Should I start a business?',
  'Should I purchase an iPhone?',
];

interface DecisionFlowProps {
  onComplete: (decision: string, answers: Answer[]) => void;
  onBackToLanding: () => void;
}

interface DynamicQuestion {
  id: string;
  text: string;
}

export const DecisionFlow: React.FC<DecisionFlowProps> = ({ onComplete, onBackToLanding }) => {
  // Mode: 'decision' (what is the decision) | 'fetching_questions' (loading) | 'questions' (reflecting)
  const [flowStage, setFlowStage] = useState<'decision' | 'fetching_questions' | 'questions'>('decision');
  const [decision, setDecision] = useState('');
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea on question/stage changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [flowStage, currentQuestionIndex]);

  // Handle Cmd/Ctrl + Enter submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleNext();
    }
  };

  const fetchQuestions = async (decisionText: string) => {
    setFlowStage('fetching_questions');
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: decisionText }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server error occurred while generating questions.');
      }
      
      const data = await response.json();
      const mappedQuestions = data.questions.map((text: string, idx: number) => ({
        id: `q_${idx}`,
        text,
      }));
      
      setQuestions(mappedQuestions);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setFlowStage('questions');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not connect to the advisor server. Please ensure the backend is running.');
      setFlowStage('decision');
    }
  };

  const handleNext = () => {
    setError('');

    if (flowStage === 'decision') {
      if (!decision.trim()) {
        setError('Please describe the decision you are making.');
        return;
      }
      fetchQuestions(decision);
    } else if (flowStage === 'questions') {
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) return;

      const answerVal = answers[currentQuestion.id] || '';

      if (!answerVal.trim()) {
        setError('Please share your thoughts before proceeding.');
        return;
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Complete decision flow
        const formattedAnswers: Answer[] = questions.map((q) => ({
          questionId: q.id,
          questionText: q.text,
          answerText: answers[q.id] || '',
        }));
        onComplete(decision, formattedAnswers);
      }
    }
  };

  const handleBack = () => {
    setError('');
    if (flowStage === 'decision') {
      onBackToLanding();
    } else if (flowStage === 'fetching_questions') {
      setFlowStage('decision');
    } else {
      if (currentQuestionIndex === 0) {
        setFlowStage('decision');
      } else {
        setCurrentQuestionIndex((prev) => prev - 1);
      }
    }
  };

  const handleAnswerChange = (val: string) => {
    setError('');
    if (flowStage === 'decision') {
      setDecision(val);
    } else {
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) return;
      
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: val,
      }));
    }
  };

  const selectExample = (example: string) => {
    setDecision(example);
    setError('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const progressPercent = flowStage === 'decision' || flowStage === 'fetching_questions'
    ? 0 
    : ((currentQuestionIndex + 1) / (questions.length || 1)) * 100;

  const slideVariants: Variants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 30 : -30,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -30 : 30,
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswerVal = flowStage === 'decision' ? decision : (currentQuestion ? (answers[currentQuestion.id] || '') : '');

  return (
    <div className="flex flex-col flex-1 items-center justify-start py-8 px-4 md:px-8 max-w-2xl mx-auto w-full select-none">
      {/* Top Header Navigation */}
      <div className="w-full flex items-center justify-between mb-12">
        <button
          onClick={handleBack}
          disabled={flowStage === 'fetching_questions'}
          className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-text disabled:opacity-50 transition-colors duration-200"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
        {flowStage === 'questions' && (
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="w-24 h-[3px] bg-brand-border rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand-accent rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Form area */}
      <div className="w-full flex-1 flex flex-col justify-center min-h-[40vh]">
        <AnimatePresence mode="wait" custom={currentQuestionIndex}>
          {flowStage === 'decision' ? (
            <motion.div
              key="decision-stage"
              custom={1}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col w-full"
            >
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-brand-text mb-6">
                What decision are you trying to make?
              </h2>

              <textarea
                ref={textareaRef}
                value={decision}
                onChange={(e) => handleAnswerChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Should I buy a MacBook?"
                className="w-full min-h-[140px] p-5 text-base md:text-lg bg-brand-card border border-brand-border rounded-xl shadow-input focus:outline-none focus:border-brand-accent/40 focus:ring-1 focus:ring-brand-accent/10 transition-all resize-none font-sans text-brand-text placeholder:text-brand-muted/50 leading-relaxed"
              />

              {/* Examples */}
              <div className="mt-6">
                <span className="text-xs text-brand-muted block mb-3 font-medium">Examples</span>
                <div className="flex flex-wrap gap-2">
                  {DECISION_EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => selectExample(ex)}
                      className="px-3 py-1.5 text-xs text-brand-muted bg-brand-card hover:bg-brand-text hover:text-brand-bg hover:border-brand-text border border-brand-border rounded-lg transition-all duration-200"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : flowStage === 'fetching_questions' ? (
            <motion.div
              key="fetching-questions"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  className="text-brand-text p-3 bg-brand-card border border-brand-border rounded-xl shadow-premium"
                >
                  <Compass size={28} strokeWidth={1.5} />
                </motion.div>
              </div>
              <p className="text-sm font-semibold text-brand-text mb-2 tracking-tight">
                Advisor is formulating reflection points...
              </p>
              <p className="text-xs text-brand-muted max-w-[320px] leading-relaxed">
                We are tailoring custom questions based entirely on your specific decision topic.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              custom={1}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col w-full"
            >
              <div className="mb-2 text-xs font-semibold text-brand-muted/80 tracking-widest uppercase">
                Reflective Step
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-brand-text mb-6 leading-tight">
                {currentQuestion?.text}
              </h2>

              <textarea
                ref={textareaRef}
                value={currentAnswerVal}
                onChange={(e) => handleAnswerChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your thoughts..."
                className="w-full min-h-[180px] p-5 text-base md:text-lg bg-brand-card border border-brand-border rounded-xl shadow-input focus:outline-none focus:border-brand-accent/40 focus:ring-1 focus:ring-brand-accent/10 transition-all resize-none font-sans text-brand-text placeholder:text-brand-muted/50 leading-relaxed"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <div className="h-6 mt-3">
          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-500 font-medium"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Button Controls */}
      {flowStage !== 'fetching_questions' && (
        <div className="w-full flex items-center justify-between mt-12 border-t border-brand-border pt-6">
          <span className="text-[11px] text-brand-muted flex items-center gap-1">
            <span className="font-mono border border-brand-border px-1 py-0.5 rounded bg-brand-card shadow-sm">⌘</span>
            <span>+</span>
            <span className="font-mono border border-brand-border px-1 py-0.5 rounded bg-brand-card shadow-sm">↵</span>
            <span className="ml-1">to continue</span>
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-text text-brand-bg rounded-lg font-medium text-xs hover:bg-opacity-90 active:scale-[0.98] transition-all duration-200 shadow-premium"
          >
            <span>{flowStage === 'questions' && currentQuestionIndex === questions.length - 1 ? 'Analyze' : 'Continue'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
