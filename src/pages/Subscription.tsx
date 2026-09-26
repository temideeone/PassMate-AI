import { useState } from "react";
import { 
  CheckCircle, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Loader2,
  GraduationCap
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function Subscription() {
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();

  const handleUpgrade = () => {
    if (!user) return;
    setLoading(true);

    const handler = window.PaystackPop.setup({
      key: (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: 2500 * 100, // ₦2,500 in kobo
      currency: "NGN",
      metadata: {
        uid: user.uid,
        custom_fields: [
          {
            display_name: "User ID",
            variable_name: "uid",
            value: user.uid
          }
        ]
      },
      callback: function(response: any) {
        console.log("Payment successful. Ref:", response.reference);
        setLoading(false);
        alert("Payment successful! Your subscription will be updated shortly.");
      },
      onClose: function() {
        setLoading(false);
        console.log("Window closed.");
      }
    });

    handler.openIframe();
  };

  const features = [
    "Unlimited AI Homework Help",
    "Unlimited Exam Practice Sessions",
    "Custom Study Timetables",
    "Advanced Performance Analytics",
    "Priority AI Response Time",
    "Ad-free Experience"
  ];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full transition-colors duration-300">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Upgrade to Premium</h2>
        <p className="text-gray-500 dark:text-gray-400">Unlock the full power of PassMate AI and ace your exams.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Plan Details */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Premium Plan</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Full access to all features</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">₦2,500</span>
              <span className="text-sm text-gray-400 dark:text-gray-500 block">/month</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={loading || profile?.subscriptionStatus === 'premium'}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : profile?.subscriptionStatus === 'premium' ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Active Subscription
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Upgrade Now
              </>
            )}
          </button>

          <div className="mt-6 flex items-center justify-center space-x-4 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">
            <div className="flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Secure Payment
            </div>
            <div className="flex items-center">
              <CreditCard className="w-3 h-3 mr-1" />
              Powered by Paystack
            </div>
          </div>
        </div>

        {/* Why Upgrade */}
        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 transition-colors duration-300">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Unlimited Learning</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 leading-relaxed">
              Don't let daily limits slow you down. Ask as many questions as you need to fully grasp difficult concepts.
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 transition-colors duration-300">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-xl flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-2">Better Results</h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
              Students who use Premium practice 4x more often and see a 35% average improvement in their mock scores.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed transition-colors duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center">
              "PassMate Premium was the best investment I made for my JAMB prep. The unlimited practice questions were a life saver!"
              <span className="block mt-2 font-bold text-gray-700 dark:text-gray-300">— Sarah O., Medical Student</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
