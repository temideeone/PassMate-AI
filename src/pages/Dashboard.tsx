import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Calendar, 
  Award, 
  ChevronRight, 
  Clock, 
  PlusCircle, 
  Sparkles,
  CheckCircle2,
  Play,
  Target,
  Zap,
  X,
  FileText,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

import StudyPlanner from '../components/StudyPlanner';

export default function Dashboard() {
  const { user, profile, isTrialActive } = useAuth();
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'PassMate AI',
      text: 'Check out PassMate AI - The AI-powered exam preparation platform!',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Load offline cached exam results immediately for instant UI response
    const localKey = `offline_exam_results_${user.uid}`;
    let cachedResults: any[] = [];
    try {
      cachedResults = JSON.parse(localStorage.getItem(localKey) || '[]');
      if (cachedResults.length > 0) {
        setRecentResults(cachedResults);
      }
    } catch (e) {
      console.warn('Error reading cached results:', e);
    }

    const q = query(
      collection(db, 'exam_results'),
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cloudResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Merge cloud results with any local cached items not yet synced
        const cloudIds = new Set(cloudResults.map(r => (r as any).date));
        const unsynced = cachedResults.filter(r => !cloudIds.has(r.date));
        const combined = [...cloudResults, ...unsynced].sort(
          (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setRecentResults(combined);
        setLoading(false);
      },
      (error) => {
        console.error('Real-time exam results error:', error);
        // Fallback to one-time fetch or cached
        if (cachedResults.length > 0) {
          setRecentResults(cachedResults);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const chartData = recentResults.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0,
    topic: r.examType
  })).slice(-7);

  const stats = [
    { name: 'Exams Taken', value: recentResults.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Average Score', value: recentResults.length > 0 ? `${Math.round(recentResults.reduce((acc, r) => acc + (r.totalQuestions > 0 ? r.score/r.totalQuestions : 0), 0) / recentResults.length * 100)}%` : '0%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Study Streak', value: '12 Days', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Badges Earned', value: '5', icon: Award, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  const onboardingSteps = [
    { id: 1, title: "Set your first goal", desc: "Define what you want to achieve this week.", icon: <Target className="w-5 h-5" />, color: "bg-blue-500", done: false },
    { id: 2, title: "Try AI Tutor", desc: "Ask a question about any subject.", icon: <Zap className="w-5 h-5" />, color: "bg-amber-500", done: false },
    { id: 3, title: "Take a practice test", desc: "Test your knowledge with 5 questions.", icon: <Play className="w-5 h-5" />, color: "bg-emerald-500", done: recentResults.length > 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back, {profile?.name || user?.displayName}! 👋</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Here's how you're performing this week.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleShare}
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm relative"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {isCopied ? "Copied!" : "Share App"}
          </button>
          <Link to="/chat" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            Ask AI Tutor
          </Link>
          <Link to="/document-exam" className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg">
            <FileText className="w-4 h-4 mr-2" />
            Analyze Notes
          </Link>
          <Link to="/exams" className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
            Start Practice
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-10 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl"
          >
            <button 
              onClick={() => setShowOnboarding(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">Quick Start Guide</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {onboardingSteps.map((step) => (
                  <div key={step.id} className="bg-white/10 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                        {step.icon}
                      </div>
                      <h3 className="font-bold text-sm sm:text-base mb-1">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">{step.desc}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${step.done ? 'text-emerald-300' : 'text-indigo-200'}`}>
                        {step.done ? 'Completed' : 'Next Step'}
                      </span>
                      {step.done && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Overall</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Progress Chart & Recent Activity */}
        <div className="lg:col-span-2 space-y-10">
          {/* Performance Chart */}
          <div className="bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Performance Trend</h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Your score progress over the last 7 tests.</p>
              </div>
              <div className="flex items-center self-start sm:self-auto gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] sm:text-xs font-bold">
                <TrendingUp className="w-3 h-3" />
                <span>+12% vs last week</span>
              </div>
            </div>
            <div className="h-[250px] sm:h-[300px] w-full relative">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={40} minHeight={40}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl">
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Take more tests to see your progress chart!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Recent Results</h2>
              <Link to="/exams" className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">View All</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <div className="p-10 text-center text-gray-500">Loading results...</div>
              ) : recentResults.length > 0 ? (
                recentResults.slice(-5).reverse().map((result) => (
                  <div key={result.id} className="px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-base sm:text-lg">
                        {result.examType?.[0]}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">{result.examType}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(result.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-bold text-indigo-600 dark:text-indigo-400 text-base sm:text-lg">{result.score}/{result.totalQuestions}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium">{result.totalQuestions > 0 ? Math.round((result.score / result.totalQuestions) * 100) : 0}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-6">No practice results yet.</p>
                  <Link
                    to="/exams"
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                  >
                    Start Your First Test
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Subscription Status */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Subscription</h3>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-black">Current Plan</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                (profile?.subscriptionStatus === 'premium' || isTrialActive) ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {isTrialActive ? 'Free Trial' : (profile?.subscriptionStatus || 'Free')}
              </span>
            </div>
            {profile?.subscriptionStatus !== 'premium' && !isTrialActive ? (
              <Link to="/subscription" className="block w-full py-4 bg-indigo-600 text-white text-center font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg">
                Upgrade to Premium
              </Link>
            ) : (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold leading-relaxed">
                  {isTrialActive 
                    ? "You're currently in your 14-day free trial! Enjoy unlimited access to all features."
                    : "You have unlimited access to AI Tutor and Practice Exams. Keep up the great work!"}
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Exams & Study Schedule */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <StudyPlanner limit={5} />
          </div>

          {/* AI Tip of the Day */}
          <div className="bg-amber-50 dark:bg-amber-900/20 p-8 rounded-3xl border border-amber-100 dark:border-amber-800/50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100">AI Study Tip</h3>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              "Try the Pomodoro technique: Study for 25 minutes, then take a 5-minute break. It helps maintain high focus levels throughout your session."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
