import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { isTrialActive, trialDaysLeft } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
          >
            {/* Header Image/Pattern */}
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white/50 animate-pulse" />
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {isTrialActive ? "Experience Full Access!" : "Upgrade for Full Access"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {isTrialActive 
                    ? `You're currently in your 14-day free trial. You have ${trialDaysLeft} days left of unlimited access!`
                    : "Your 14-day free trial has expired. Upgrade to Premium to unlock Unlimited Questions, Exam Practice, and Study Reminders."}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  'Unlimited AI Tutor questions',
                  'Priority response times',
                  'Advanced analytics & insights',
                  'Custom study plans',
                  'Ad-free experience'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/subscription"
                  onClick={onClose}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-center hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center"
                >
                  Upgrade Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                >
                  Maybe Later
                </button>
              </div>

              <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
                Join 10,000+ students crushing their exams with PassMate Premium.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
