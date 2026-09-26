import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Check, ShieldCheck } from 'lucide-react';
import { consentManager, useConsent } from '../lib/consent';

export default function CookieBanner() {
  const { choice } = useConsent();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!choice) {
      // Show banner after a slight delay if no choice has been made
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [choice]);

  const handleChoice = (choice: 'accepted' | 'rejected') => {
    consentManager.setChoice(choice);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="relative p-8 text-center">
              <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Cookie className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                We value your privacy
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleChoice('accepted')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20"
                >
                  <Check className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Accept All
                </button>
                <button
                  onClick={() => handleChoice('rejected')}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Reject Non-essential
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                <ShieldCheck className="w-3 h-3" />
                GDPR, CCPA & NDPC COMPLIANT
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
