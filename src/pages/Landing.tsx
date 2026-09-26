import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "motion/react";
import { 
  BookOpen, 
  CheckCircle, 
  Brain, 
  Clock, 
  BarChart3, 
  MessageSquare, 
  ArrowRight,
  GraduationCap,
  Sparkles
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../hooks/useAuth";
import { analytics } from "../lib/analytics";

export default function Landing() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    analytics.trackPageView("Landing");
  }, []);

  const handleGetStarted = async () => {
    analytics.trackEvent("get_started_clicked");
    if (user) {
      navigate('/dashboard');
    } else {
      try {
        await signIn();
        analytics.trackEvent("sign_in_success");
        navigate('/dashboard');
      } catch (error) {
        analytics.trackEvent("sign_in_failed", { error: (error as Error).message });
        console.error("Sign in failed:", error);
      }
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-indigo-600" />,
      title: "AI Homework Helper",
      description: "Get instant, step-by-step explanations for any homework question or complex topic."
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
      title: "Exam Practice Mode",
      description: "Practice with AI-generated questions tailored for WAEC, JAMB, NECO, and more."
    },
    {
      icon: <Clock className="w-6 h-6 text-indigo-600" />,
      title: "Smart Timetable",
      description: "Automatically generate a study schedule that adapts to your exam dates and goals."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
      title: "Progress Tracking",
      description: "Visualize your strengths and weaknesses with detailed performance analytics."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Sign up",
      description: "Create your free account and start your study journey."
    },
    {
      number: "02",
      title: "Ask or Practice",
      description: "Chat with the AI tutor or start a mock exam in your subject."
    },
    {
      number: "03",
      title: "Improve",
      description: "Review explanations and track your scores over time."
    },
    {
      number: "04",
      title: "Pass Exams",
      description: "Walk into your exam hall with confidence and ace your tests."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 mb-6 font-bold">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Exam Success
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
                Pass Your Exams <br />
                <span className="text-indigo-600 dark:text-indigo-400">with AI Confidence</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
                The ultimate study companion. Get instant tutoring, practice tests, and personalized study plans powered by advanced AI.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {user ? 'Go to Dashboard' : 'Get Started for Free'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <Link
                  to="/exams"
                  className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 dark:border-gray-700 text-lg font-bold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Try Practice Test
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-full h-full opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -right-20 w-72 h-72 bg-emerald-400 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to succeed</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Powerful features designed to help you study smarter, not harder.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-indigo-600 dark:bg-indigo-700 text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-indigo-100 max-w-2xl mx-auto">Four simple steps to academic excellence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-black text-indigo-500/30 mb-4">{step.number}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-indigo-100 text-sm">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-px bg-indigo-400/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Start for free, upgrade when you're ready.</p>
          </div>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Free Tier</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                  3 AI questions per day
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                  Basic progress tracking
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                  Standard exam practice
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full py-3 px-4 rounded-xl border border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold text-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              >
                Get Started
              </button>
            </div>
            {/* Premium Plan */}
            <div className="p-8 rounded-3xl bg-indigo-600 dark:bg-indigo-700 text-white shadow-xl relative overflow-hidden flex flex-col transition-colors duration-300">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-indigo-500 dark:bg-indigo-600 text-[10px] uppercase font-bold px-2 py-1 rounded">Popular</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₦2,500</span>
                <span className="text-indigo-200">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center text-sm text-indigo-50">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
                  Unlimited AI questions
                </li>
                <li className="flex items-center text-sm text-indigo-50">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
                  Advanced analytics & insights
                </li>
                <li className="flex items-center text-sm text-indigo-50">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
                  Priority AI response time
                </li>
                <li className="flex items-center text-sm text-indigo-50">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
                  Custom study plans
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full py-3 px-4 rounded-xl bg-white text-indigo-600 dark:text-indigo-700 font-bold text-center hover:bg-indigo-50 dark:hover:bg-indigo-100 transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
