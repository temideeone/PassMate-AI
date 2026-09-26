import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, MessageSquare, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const { user, signIn } = useAuth();

  const features = [
    {
      title: 'AI-Powered Tutoring',
      description: 'Get instant explanations for complex topics with our advanced AI tutor, available 24/7.',
      icon: MessageSquare,
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      title: 'Practice Exams',
      description: 'Take realistic practice tests tailored to your curriculum and track your progress over time.',
      icon: BookOpen,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Personalized Study Plans',
      description: 'Our AI analyzes your performance to create a custom roadmap for your success.',
      icon: Sparkles,
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
                Master Your Exams with <span className="text-indigo-600">PassMate AI</span>
              </h1>
              <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
                The ultimate AI-powered study companion. Personalized tutoring, practice tests, and smart insights to help you excel in your studies.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                ) : (
                  <button
                    onClick={signIn}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Get Started for Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                )}
                <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Succeed</h2>
            <p className="mt-4 text-lg text-gray-500">Powerful tools designed for modern students.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Trusted by Thousands of Students</h2>
              <div className="space-y-4">
                {[
                  '98% student satisfaction rate',
                  'Average grade improvement of 15%',
                  'Over 1 million practice questions answered',
                  'Used in 50+ countries worldwide'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <ShieldCheck className="w-12 h-12 mb-6 opacity-80" />
                <p className="text-2xl font-medium italic mb-6">
                  "PassMate AI transformed my study routine. I went from struggling with calculus to getting an A in my finals. The AI tutor is like having a private teacher available anytime."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-400 rounded-full" />
                  <div>
                    <p className="font-bold">Sarah Jenkins</p>
                    <p className="text-indigo-200 text-sm">Medical Student</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-500 rounded-full opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Ace Your Next Exam?</h2>
          <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of students who are already using PassMate AI to achieve their academic goals.
          </p>
          <button
            onClick={signIn}
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-indigo-900 bg-white hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-6 h-6" />
          </button>
        </div>
      </section>
    </div>
  );
};
