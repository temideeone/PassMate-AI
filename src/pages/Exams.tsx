import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generatePracticeQuestions } from '../services/geminiService';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle2, XCircle, ArrowRight, Loader2, Award, RefreshCw, ChevronLeft, Timer, Pause, Play, RotateCcw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analytics } from '../lib/analytics';
import UpgradeModal from '../components/UpgradeModal';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function Exams() {
  const { user, profile, isTrialActive } = useAuth();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  const isPremium = profile?.subscriptionStatus === 'premium' || profile?.role === 'admin';
  const canStartPractice = isPremium || isTrialActive;
  const questionsUsedToday = profile?.practiceQuestionsUsedToday || 0;

  // Timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      finishPractice();
    }
  }, [timeLeft, isActive]);

  const startPractice = async () => {
    if (!topic.trim()) return;

    if (!canStartPractice) {
      setIsUpgradeModalOpen(true);
      return;
    }

    // Users with access (Premium or Trial Active) get their requested count
    const actualCount = questionCount;
    
    setLoading(true);
    setPracticeError(null);
    try {
      // Track the event (will be blocked if cookie consent is rejected)
      analytics.trackEvent('practice_test_started', {
        topic,
        difficulty,
        questionCount: actualCount
      });

      const generatedQuestions = await generatePracticeQuestions(topic, difficulty, actualCount);
      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error("No questions were generated. Please try again with a different topic.");
      }
      setQuestions(generatedQuestions);
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setIsFinished(false);
      setShowExplanation(false);
      setSelectedOption(null);
      
      // Update usage count in Firestore
      if (!isPremium && user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          practiceQuestionsUsedToday: increment(generatedQuestions.length),
          practiceSubjectsUsedToday: increment(1),
          lastPracticeDate: new Date().toISOString()
        });
      }
      
      // Initialize timer (90 seconds per question)
      const duration = generatedQuestions.length * 90;
      setTimeLeft(duration);
      setIsActive(true);
      setIsPaused(false);
    } catch (error: any) {
      console.error('Error starting practice:', error);
      setPracticeError(error?.message || "Failed to generate practice test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (showExplanation || isPaused) return;
    setSelectedOption(option);
    setShowExplanation(true);
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = option;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      finishPractice();
    }
  };

  const finishPractice = async () => {
    setIsActive(false);
    setIsFinished(true);
    if (!user) return;

    const finalScore = answers.reduce((acc, curr, idx) => {
      if (!questions[idx]) return acc;
      return curr === questions[idx].correctAnswer ? acc + 1 : acc;
    }, 0);

    const resultPayload = {
      uid: user.uid,
      examType: topic.trim() || 'General Practice',
      score: Number(finalScore),
      totalQuestions: Number(questions.length),
      questions: questions,
      userAnswers: answers,
      date: new Date().toISOString()
    };

    setIsSavingResult(true);
    setSaveError(null);

    // Save to localStorage as a safety net so results are never lost
    try {
      const localKey = `offline_exam_results_${user.uid}`;
      const existingOffline = JSON.parse(localStorage.getItem(localKey) || '[]');
      existingOffline.push({ ...resultPayload, id: `local_${Date.now()}` });
      localStorage.setItem(localKey, JSON.stringify(existingOffline));
    } catch (e) {
      console.warn('Could not cache exam result locally:', e);
    }

    try {
      await addDoc(collection(db, 'exam_results'), resultPayload);
      console.log('Exam result successfully recorded to Firestore');
    } catch (error: any) {
      console.error('Error saving result to Firestore:', error);
      setSaveError(error?.message || 'Could not sync result to cloud. Saved locally.');
    } finally {
      setIsSavingResult(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const restartTimer = () => {
    setTimeLeft(questions.length * 90);
    setIsPaused(false);
  };

  const score = answers.reduce((acc, curr, idx) => {
    if (!questions[idx]) return acc;
    return curr === questions[idx].correctAnswer ? acc + 1 : acc;
  }, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] transition-colors duration-300">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-300 font-medium tracking-tight">Generating your practice test...</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Our AI is crafting perfect questions for you.</p>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-16 text-center transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300"
        >
          <Award className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Practice Complete!</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8">Great job on finishing the {topic} practice test.</p>
          
          <div className="flex justify-center gap-6 sm:gap-8 mb-6">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">{score}/{questions.length}</p>
              <p className="text-[10px] sm:text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400">{percentage}%</p>
              <p className="text-[10px] sm:text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Accuracy</p>
            </div>
          </div>

          <div className="mb-8">
            {isSavingResult ? (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving result to your profile...
              </p>
            ) : saveError ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 py-2 px-3 rounded-xl border border-amber-200 dark:border-amber-800 inline-block">
                Saved locally ({saveError})
              </p>
            ) : (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Result saved to your dashboard & performance tracker
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { setQuestions([]); setIsFinished(false); setTopic(''); setIsActive(false); }}
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Another Topic
            </button>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 transition-colors duration-300">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <button
              onClick={() => { setQuestions([]); setTopic(''); setIsActive(false); }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-2 font-medium text-sm sm:text-base"
            >
              <ChevronLeft className="w-5 h-5" />
              Exit
            </button>
            <div className="sm:hidden text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Q {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-sm sm:text-base ${timeLeft < 60 ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 animate-pulse' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
              <Timer className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
              <button 
                onClick={restartTimer}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
                title="Restart Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="hidden sm:block text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full mb-10 overflow-hidden">
          <motion.div
            className="bg-indigo-600 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {isPaused ? (
            <motion.div
              key="paused"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center transition-colors duration-300"
            >
              <Pause className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Practice Paused</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Take a breath. Your progress is safe.</p>
              <button
                onClick={() => setIsPaused(false)}
                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Resume Practice
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 transition-colors duration-300 overflow-hidden"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 leading-relaxed break-words">
                {currentQuestion.question}
              </h3>

              <div className="space-y-3 sm:space-y-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const showResult = showExplanation;

                  let buttonClass = "w-full p-3 sm:p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between gap-3 ";
                  if (!showResult) {
                    buttonClass += isSelected 
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300" 
                      : "border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:text-gray-300";
                  } else {
                    if (isCorrect) buttonClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300";
                    else if (isSelected && !isCorrect) buttonClass += "border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-300";
                    else buttonClass += "border-gray-100 dark:border-gray-700 opacity-50 dark:text-gray-500";
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showResult}
                      className={buttonClass}
                    >
                      <span className="font-medium text-sm sm:text-base break-words">{option}</span>
                      {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 dark:text-emerald-400" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 shrink-0 text-rose-500 dark:text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-300"
                  >
                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Explanation</p>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed break-words">{currentQuestion.explanation}</p>
                    <button
                      onClick={nextQuestion}
                      className="mt-6 w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {currentQuestionIndex === questions.length - 1 ? 'Finish Practice' : 'Next Question'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-16 transition-colors duration-300">
      <div className="text-center mb-8 sm:mb-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Practice Makes Perfect</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Enter a topic you're studying, and our AI will generate a custom practice test for you.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Study Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, Quadratic Equations"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-2 rounded-xl font-bold capitalize text-[10px] sm:text-sm transition-all ${
                      difficulty === level
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Questions</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300"
              >
                {[5, 10, 15, 20, 25, 30, 40, 50].map(count => (
                  <option key={count} value={count}>{count} Questions</option>
                ))}
              </select>
            </div>
          </div>

          {practiceError && (
            <div className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 rounded-2xl text-rose-700 dark:text-rose-300 transition-colors duration-300 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{practiceError}</span>
            </div>
          )}

          <button
            onClick={startPractice}
            disabled={!topic.trim() || loading}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Generate Practice Test'}
            {!loading && <ArrowRight className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center gap-2 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-700 dark:text-indigo-300 transition-colors duration-300">
            <Timer className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium">
              Each question gives you 90 seconds. Total time for {questionCount} questions: {formatTime(questionCount * 90)}.
            </p>
          </div>
        </div>
      </div>
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />
    </div>
  );
}
