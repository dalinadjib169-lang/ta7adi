import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, CheckCircle2, XCircle, ArrowRight, Brain, Trophy, Star } from 'lucide-react';
import { Question } from '../types';
import { generateQuestion } from '../questionGenerator';
import confetti from 'canvas-confetti';

interface GameProps {
  onComplete: (score: number, answers: string[]) => void;
  onCancel: () => void;
}

export default function Game({ onComplete, onCancel }: GameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    // Generate 10 questions for a session
    const qList = Array.from({ length: 10 }, (_, i) => generateQuestion(Math.floor(i / 3) + 1));
    setQuestions(qList);
    setTimeLeft(qList[0].timer);
  }, []);

  useEffect(() => {
    if (isGameOver || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(''); // Time out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isGameOver, questions]);

  const handleAnswer = (answer: string) => {
    if (feedback || isGameOver) return;

    const isCorrect = answer === questions[currentIndex].correctAnswer;
    setAnswers([...answers, answer]);
    
    if (isCorrect) {
      setScore(score + 10);
      setFeedback('correct');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#A855F7', '#3B82F6', '#10B981']
      });
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setTimeLeft(questions[currentIndex + 1].timer);
      } else {
        setIsGameOver(true);
        onComplete(score + (isCorrect ? 10 : 0), [...answers, answer]);
      }
    }, 1500);
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center" dir="rtl">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
            <ArrowRight className="rotate-180" />
          </button>
          <div className="flex-1 mx-8 h-2 bg-slate-900 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <div className="font-black text-purple-400">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative overflow-hidden"
          >
            {/* Timer Ring */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-slate-700">
              <Timer size={16} className={timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-blue-400'} />
              <span className={cn("font-mono font-bold", timeLeft < 10 ? 'text-red-500' : 'text-white')}>
                {timeLeft}s
              </span>
            </div>

            <div className="mt-8 text-center">
              <Brain size={40} className="mx-auto mb-4 text-purple-500 opacity-50" />
              <h2 className="text-2xl md:text-3xl font-bold leading-relaxed mb-8">
                {currentQ.content}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQ.options.map((option, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option)}
                    disabled={!!feedback}
                    className={cn(
                      "p-6 rounded-2xl text-xl font-bold border-2 transition-all",
                      feedback === 'correct' && option === currentQ.correctAnswer ? "bg-green-500/20 border-green-500 text-green-400" :
                      feedback === 'wrong' && option === answers[answers.length - 1] ? "bg-red-500/20 border-red-500 text-red-400" :
                      feedback === 'wrong' && option === currentQ.correctAnswer ? "bg-green-500/20 border-green-500 text-green-400" :
                      "bg-slate-800/50 border-slate-700 hover:border-purple-500 hover:bg-slate-800"
                    )}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Feedback Overlay */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20"
                >
                  {feedback === 'correct' ? (
                    <>
                      <CheckCircle2 size={80} className="text-green-500 mb-4" />
                      <p className="text-2xl font-black text-green-500">إجابة صحيحة! +10</p>
                    </>
                  ) : (
                    <>
                      <XCircle size={80} className="text-red-500 mb-4" />
                      <p className="text-2xl font-black text-red-500">إجابة خاطئة</p>
                      <p className="text-slate-400 mt-2">الإجابة الصحيحة: {currentQ.correctAnswer}</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Stats Footer */}
        <div className="mt-8 flex justify-center gap-8">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">النقاط الحالية</p>
            <div className="flex items-center gap-2 text-2xl font-black text-yellow-500">
              <Trophy size={24} />
              {score}
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">المكافأة</p>
            <div className="flex items-center gap-2 text-2xl font-black text-purple-400">
              <Star size={24} />
              x1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
