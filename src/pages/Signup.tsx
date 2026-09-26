import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle, Loader2, ShieldCheck, AlertTriangle, Mail, Lock, User } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../hooks/useAuth";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMethod, setAuthMethod] = useState<"options" | "email">("options");
  const navigate = useNavigate();
  const { signIn, signInWithRedirectFlow, signUpWithEmail } = useAuth();
  
  const isEmbedded = typeof window !== 'undefined' && window.self !== window.top;

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Initiating Google Sign Up...");
      await signIn();
      console.log("Sign Up successful, navigating...");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Signup Error:", error);
      if (error?.code === 'auth/popup-blocked') {
        setError('Registration popup blocked. Click the link below to sign up directly with Google via redirect, or use Email & Password.');
      } else if (error?.code === 'auth/cancelled-popup-request') {
        setError('A registration window is already open. Check your other tabs or windows.');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        setError('Google window was closed before completing. Click "Sign up with Google" again or use the full redirect option below.');
      } else if (error?.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not yet enabled in the Firebase Console. Please use the Email & Password option below or enable Google Sign-In in Firebase Authentication > Sign-in method.');
      } else if (error?.code === 'auth/unauthorized-domain') {
        setError(`This domain (${window.location.hostname}) is not yet authorized in Firebase Console > Authentication > Settings > Authorized Domains.`);
      } else {
        setError(error?.message || "Failed to sign up with Google. You can sign up with Email & Password below.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithRedirectFlow();
    } catch (err: any) {
      setError(err?.message || "Failed to initiate redirect sign up.");
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please fill in your email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password, name || "Student");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Email Signup Error:", error);
      if (error?.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (error?.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (error?.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (error?.code === 'auth/operation-not-allowed') {
        setError("Email/Password sign-in provider is disabled in Firebase. Please enable 'Email/Password' in your Firebase Console under Authentication > Sign-in method.");
      } else {
        setError(error?.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center space-x-2 mb-6">
          <div className="relative">
            <BookOpen className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            <CheckCircle className="w-5 h-5 text-emerald-500 absolute -top-1 -right-1 bg-white dark:bg-gray-900 rounded-full" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">PassMate AI</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Start your free trial
        </h2>
        {error && (
          <div className="mt-4 mx-4 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm text-center">
            {error}
          </div>
        )}
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700 transition-colors duration-300"
        >
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-xs text-indigo-700 dark:text-indigo-300">
              You're getting <strong>14 days of Premium access</strong> for free. No credit card required to start.
            </p>
          </div>

          <div className="space-y-5">
            {/* Google Authentication Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
              >
                {loading && authMethod === "options" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-3" alt="Google" />
                    Sign up with Google
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRedirectSignup}
                disabled={loading}
                className="w-full text-xs text-indigo-600 dark:text-indigo-400 hover:underline text-center py-1 font-medium"
              >
                Having popup trouble? Tap here to sign up with Google directly (full redirect)
              </button>
            </div>

            {isEmbedded && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                Inside this preview iframe, create an account with <strong>Email & Password</strong> below or open the app in a new tab for Google Sign-In.
              </p>
            )}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">Or create with email & password</span>
              </div>
            </div>

            {/* Email / Password Sign Up Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
              </button>
            </form>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
              By signing up, you agree to our{" "}
              <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</Link> and{" "}
              <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</Link>.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
