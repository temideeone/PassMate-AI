import React, { useState } from 'react';
import StudyPlanner from '../components/StudyPlanner';
import { Calendar, Sparkles, Wand2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateAISchedule } from '../services/geminiService';
import { db } from '../firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import UpgradeModal from '../components/UpgradeModal';

export default function Planner() {
  const { user, profile, isTrialActive } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [plannerKey, setPlannerKey] = useState(0);

  const isPremium = profile?.subscriptionStatus === 'premium' || profile?.role === 'admin';

  const handleGenerateAI = async () => {
    if (!user) return;

    if (!isPremium && !isTrialActive) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    try {
      // 1. Fetch current exams to inform the AI
      const q = query(collection(db, 'study_schedule'), where('uid', '==', user.uid), where('type', '==', 'exam'));
      const snapshot = await getDocs(q);
      const exams = snapshot.docs.map(doc => doc.data());

      // 2. Generate schedule
      const newItems = await generateAISchedule(exams, "Focus on morning sessions, 1 hour each.");

      // 3. Save to Firestore
      if (Array.isArray(newItems) && newItems.length > 0) {
        const batch = writeBatch(db);
        newItems.forEach((item: any) => {
          const newDocRef = doc(collection(db, 'study_schedule'));
          batch.set(newDocRef, {
            ...item,
            uid: user.uid,
            createdAt: new Date().toISOString()
          });
        });
        await batch.commit();
      }
      
      setPlannerKey((k) => k + 1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (error: any) {
      console.error("Error generating AI schedule:", error);
      setErrorMessage(error?.message || "Failed to generate AI schedule. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Study Planner</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Organize your study sessions and track your progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-800/50 text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-xs font-bold"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Schedule Generated!</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            )}
            {isGenerating ? 'Generating...' : 'AI Generate Schedule'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <StudyPlanner key={plannerKey} />
      </div>

      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-bold mb-2">Pro Tip: Consistency</h3>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Studying for 30 minutes every day is more effective than a single 5-hour session. Use the planner to break down your topics into manageable chunks.
          </p>
        </div>
        <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-bold mb-2">Active Recall</h3>
          <p className="text-emerald-100 text-sm leading-relaxed">
            After each study session, try to write down everything you remember without looking at your notes. This strengthens your long-term memory.
          </p>
        </div>
      </div>
    </div>
  );
}
