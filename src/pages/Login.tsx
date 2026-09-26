import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle, Loader2, AlertTriangle, Mail, Lock, KeyRound } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signInWithRedirectFlow, signInWithEmail, resetPassword } = useAuth();
  
  const isEmbedded = typeof window !== 'undefined' && window.self !== window.top;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      console.log("Initiating Google Sign In...");
      await signIn();
      console.log("Sign In successful, navigating...");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error?.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. You can click the button below to sign in via full redirect, or use Email & Password.');
      } else if (error?.code === 'auth/cancelled-popup-request') {
        setError('A sign-in window is already open. Check your other browser tabs or windows.');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        setError('Google window was closed before signing in. Try clicking "Continue with Google" again or use the full redirect option below.');
      } else if (error?.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is disabled in the Firebase Console. Please enable Google in Authentication > Sign-in method.');
      } else if (error?.code === 'auth/unauthorized-domain') {
        setError(`This domain (${window.location.hostname}) is not yet authorized in Firebase Console > Authentication > Settings > Authorized Domains.`);
      } else {
        setError(error?.message || "Failed to sign in with Google. You can sign in with Email & Password below.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithRedirectFlow();
    } catch (err: any) {
      setError(err?.message || "Failed to initiate redirect sign in.");
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address to receive a password reset link.");
      return;
    }
    setResetLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setSuccessMsg(`Password reset link sent to ${email.trim()}. Check your inbox or spam folder.`);
      setShowForgot(false);
    } catch (err: any) {
      setError(err?.message || "Failed to send password reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await signInWithEmail(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Email Login Error:", error);
      if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        setError("Invalid email or password. If you originally signed up with Google, click 'Continue with Google' above.");
      } else if (error?.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (error?.code === 'auth/operation-not-allowed') {
        setError("Email/Password sign-in is not enabled in Firebase Console. Please enable 'Email/Password' in Authentication > Sign-in method.");
      } else {
        setError(error?.message || "Failed to sign in. Please try again.");
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
          Welcome back
        </h2>
        {error && (
          <div className="mt-4 mx-4 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm text-center">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mt-4 mx-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm text-center">
            {successMsg}
          </div>
        )}
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
            Start your 14-day free trial
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700 transition-colors duration-300"
        >
          <div className="space-y-5">
            {/* Google Authentication Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-3" alt="Google" />
                    Continue with Google
                  </>
                )}
              </button>

              {/* Mobile / Restricted Browser Direct Redirect Option */}
              <button
                type="button"
                onClick={handleRedirectSignIn}
                disabled={loading}
                className="w-full text-xs text-indigo-600 dark:text-indigo-400 hover:underline text-center py-1 font-medium"
              >
                Having popup trouble? Tap here to sign in with Google directly (full redirect)
              </button>
            </div>

            {isEmbedded && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                Inside this preview iframe, sign in with <strong>Email & Password</strong> below or open the app in a new tab for Google Sign-In.
              </p>
            )}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">Or sign in with email</span>
              </div>
            </div>

            {/* Email / Password Sign In Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(!showForgot)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot or need to set password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required={!showForgot}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              {showForgot && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs space-y-2">
                  <p className="text-indigo-900 dark:text-indigo-200 font-medium">
                    Enter your email above and click below. We will send you a link to set a password so you can sign in anytime without Google popups.
                  </p>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={resetLoading}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    {resetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                    Send Password Setup / Reset Link
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In with Email"}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                By continuing, you agree to PassMate AI's <br />
                <Link to="/terms" className="underline hover:text-gray-600 dark:hover:text-gray-300">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
