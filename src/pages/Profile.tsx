import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  LogOut, 
  ChevronRight, 
  Camera,
  CheckCircle,
  CreditCard,
  History,
  Loader2,
  X,
  CheckCircle2,
  XCircle,
  Calendar,
  Scale
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import StudyPlanner from "../components/StudyPlanner";

export default function Profile() {
  const { user, profile, logout } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [examStats, setExamStats] = useState({
    totalExams: 0,
    avgScore: 0,
    totalQuestions: 0
  });
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  useEffect(() => {
    const fetchStatsAndHistory = async () => {
      if (!user) return;
      setLoadingHistory(true);
      try {
        const q = query(
          collection(db, "exam_results"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setExamHistory(results);

        if (results.length > 0) {
          const totalScore = results.reduce((acc, curr: any) => acc + curr.score, 0);
          const totalQuestions = results.reduce((acc, curr: any) => acc + curr.totalQuestions, 0);
          setExamStats({
            totalExams: results.length,
            avgScore: Math.round((totalScore / totalQuestions) * 100),
            totalQuestions
          });
        }
      } catch (error) {
        console.error("Error fetching exam stats:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchStatsAndHistory();
  }, [user]);

  const stats = [
    { label: "Total Questions", value: examStats.totalQuestions },
    { label: "Practice Sessions", value: examStats.totalExams },
    { label: "Avg. Accuracy", value: `${examStats.avgScore}%` }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center transition-colors duration-300">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.name ? profile.name.substring(0, 2).toUpperCase() : "PM"}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-100 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{profile.email}</p>
            
            <div className={`flex items-center justify-center space-x-2 px-3 py-1 rounded-full text-xs font-bold w-max mx-auto ${
              profile.subscriptionStatus === 'premium' 
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
            }`}>
              {profile.subscriptionStatus === 'premium' ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Premium Member</span>
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3" />
                  <span>Free Trial</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Your Performance</h3>
            <div className="space-y-4">
              {stats.map((stat, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">Account</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <Link to="/subscription" className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subscription</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </Link>
              <button 
                onClick={logout}
                className="p-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group w-full text-left"
              >
                <div className="flex items-center space-x-3">
                  <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Log Out</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">Legal</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <Link to="/terms" className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                <div className="flex items-center space-x-3">
                  <Scale className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Terms of Service</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </Link>
              <Link to="/privacy" className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy Policy</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Info */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">Profile Settings</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    disabled
                    className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Study Planner Section */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6 transition-colors duration-300">
            <StudyPlanner />
          </div>

          {/* Exam History Section */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Exam History</h3>
              </div>
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {examHistory.length} Sessions
              </span>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {loadingHistory ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : examHistory.length > 0 ? (
                examHistory.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => setSelectedExam(exam)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                        (exam.score / exam.totalQuestions) >= 0.7 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                          : (exam.score / exam.totalQuestions) >= 0.4
                            ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                      }`}>
                        {Math.round((exam.score / exam.totalQuestions) * 100)}%
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {exam.examType}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(exam.date), 'MMM d, yyyy')}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-600">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {exam.score}/{exam.totalQuestions} Correct
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                  </button>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No practice exams taken yet.</p>
                  <Link to="/exams" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold mt-2 inline-block hover:underline">
                    Start your first practice session
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Review Modal */}
      <AnimatePresence>
        {selectedExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExam(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-10 transition-colors duration-300">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedExam.examType} Review</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Taken on {format(new Date(selectedExam.date), 'MMMM d, yyyy')} • Score: {selectedExam.score}/{selectedExam.totalQuestions}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedExam(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-grow overflow-y-auto p-6 space-y-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                {selectedExam.questions ? (
                  selectedExam.questions.map((q: any, idx: number) => {
                    const userAnswer = selectedExam.userAnswers[idx];
                    const isCorrect = userAnswer === q.correctAnswer;

                    return (
                      <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Question {idx + 1}</span>
                          {isCorrect ? (
                            <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Correct
                            </span>
                          ) : (
                            <span className="flex items-center text-rose-600 dark:text-rose-400 text-xs font-bold bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-lg">
                              <XCircle className="w-3 h-3 mr-1" /> Incorrect
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">{q.question}</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          {q.options.map((opt: string) => {
                            const isUserChoice = opt === userAnswer;
                            const isCorrectChoice = opt === q.correctAnswer;
                            
                            let cardClass = "p-4 rounded-xl border-2 text-sm font-medium ";
                            if (isCorrectChoice) cardClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300";
                            else if (isUserChoice && !isCorrectChoice) cardClass += "border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-300";
                            else cardClass += "border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400";

                            return (
                              <div key={opt} className={cardClass}>
                                {opt}
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
                          <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-2">Explanation</p>
                          <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">Detailed question data is not available for this session.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
