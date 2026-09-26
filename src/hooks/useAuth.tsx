import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAuthReady: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number;
  subscriptionDaysLeft: number;
  signIn: () => Promise<void>;
  signInWithRedirectFlow: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  isTrialActive: false,
  trialDaysLeft: 0,
  subscriptionDaysLeft: 0,
  signIn: async () => {},
  signInWithRedirectFlow: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const isFetching = React.useRef(false);

  const isTrialActive = useMemo(() => {
    if (profile?.role === 'admin') return true;
    if (!profile?.trialStartDate) return false;
    
    // Robust date parsing
    const startDateRaw = profile.trialStartDate;
    let startDate: Date;
    
    if (typeof startDateRaw === 'string') {
      startDate = new Date(startDateRaw);
    } else if (startDateRaw?.toDate) {
      startDate = startDateRaw.toDate();
    } else if (startDateRaw?.seconds) {
      startDate = new Date(startDateRaw.seconds * 1000);
    } else {
      startDate = new Date(startDateRaw);
    }

    if (isNaN(startDate.getTime())) return false;

    const now = new Date();
    const diffTime = now.getTime() - startDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 14;
  }, [profile]);

  const trialDaysLeft = useMemo(() => {
    if (!profile?.trialStartDate) return 0;
    
    const startDateRaw = profile.trialStartDate;
    let startDate: Date;
    
    if (typeof startDateRaw === 'string') {
      startDate = new Date(startDateRaw);
    } else if (startDateRaw?.toDate) {
      startDate = startDateRaw.toDate();
    } else if (startDateRaw?.seconds) {
      startDate = new Date(startDateRaw.seconds * 1000);
    } else {
      startDate = new Date(startDateRaw);
    }

    if (isNaN(startDate.getTime())) return 0;

    const now = new Date();
    const diffTime = now.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 14 - diffDays);
  }, [profile]);

  const subscriptionDaysLeft = useMemo(() => {
    if (profile?.subscriptionStatus !== 'premium' || !profile?.subscriptionEndDate) return 0;
    const endDate = new Date(profile.subscriptionEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [profile]);

  const fetchProfile = async (currentUser: User) => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setProfile(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is returning from a redirect sign-in
    getRedirectResult(auth).catch((error) => {
      console.error("[Auth] Redirect result error:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[Auth] State changed:", user ? `Logged in as ${user.email}` : "Logged out");
      setUser(user);
      setIsAuthReady(true);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      
      // Initial check and creation
      const checkProfile = async () => {
        try {
          const userDoc = await getDoc(userRef);
          const now = new Date();
          const today = now.toISOString().split('T')[0];
          
          if (!userDoc.exists()) {
            const isAdminEmail = user.email === "dayosamuel54@gmail.com";
            const newProfile = {
              uid: user.uid,
              name: user.displayName || 'Student',
              email: user.email,
              trialStartDate: now.toISOString(),
              subscriptionStatus: 'free',
              questionsUsedToday: 0,
              practiceQuestionsUsedToday: 0,
              practiceSubjectsUsedToday: 0,
              lastQuestionDate: now.toISOString(),
              lastPracticeDate: now.toISOString(),
              role: isAdminEmail ? 'admin' : 'user',
              createdAt: now.toISOString()
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);

            // Send welcome email
            try {
              fetch('/api/email/welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: newProfile.name,
                  email: newProfile.email
                })
              });
            } catch (emailError) {
              console.error("Error triggering welcome email:", emailError);
            }
          } else {
            const data = userDoc.data();
            const isAdminEmail = user.email === "dayosamuel54@gmail.com";
            const updates: any = {};
            
            // Force admin role for the admin user
            if (isAdminEmail && data.role !== 'admin') {
              updates.role = 'admin';
            }

            const getDateString = (dateVal: any) => {
              if (typeof dateVal === 'string') return dateVal;
              if (dateVal?.toDate) return dateVal.toDate().toISOString();
              if (dateVal?.seconds) return new Date(dateVal.seconds * 1000).toISOString();
              return null;
            };

            // Critical Fix: Ensure existing users get a trialStartDate
            if (!data.trialStartDate) {
              updates.trialStartDate = now.toISOString();
            }

            const lastQDate = getDateString(data.lastQuestionDate)?.split('T')[0] || '';
            const lastPDate = getDateString(data.lastPracticeDate)?.split('T')[0] || '';
            
            if (lastQDate !== today) {
              updates.questionsUsedToday = 0;
              updates.lastQuestionDate = now.toISOString();
            }
            if (lastPDate !== today) {
              updates.practiceQuestionsUsedToday = 0;
              updates.practiceSubjectsUsedToday = 0;
              updates.lastPracticeDate = now.toISOString();
            }

            if (Object.keys(updates).length > 0) {
              await setDoc(userRef, updates, { merge: true });
            }
            
            // Fetch the latest profile after potential updates
            await fetchProfile(user);
          }
        } catch (error: any) {
          if (error?.message?.includes('client is offline')) {
            console.warn("[Auth] Firestore is offline. This may be transient or due to project/database mismatch.");
          } else {
            console.error("Error checking/creating profile:", error);
          }
        } finally {
          setLoading(false);
        }
      };
      
      checkProfile();

      // Poll for profile updates every 5 minutes instead of onSnapshot
      const interval = setInterval(() => fetchProfile(user), 300000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      console.log('Attempting sign-in with API Key:', auth.app.options.apiKey?.substring(0, 6) + '...');
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Sign in error:', error);
      // If popup is blocked or closed unexpectedly, fall back to redirect on mobile/tablets
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
        console.log('Popup blocked/cancelled, attempting redirect flow...');
        await signInWithRedirect(auth, provider);
        return;
      }
      throw error;
    }
  };

  const signInWithRedirectFlow = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Redirect sign in error:', error);
      throw error;
    }
  };

  const resetPassword = async (emailToReset: string) => {
    try {
      await sendPasswordResetEmail(auth, emailToReset.trim());
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (error) {
      console.error('Sign in with email error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name && userCredential.user) {
        await updateFirebaseProfile(userCredential.user, {
          displayName: name.trim()
        });
      }
    } catch (error) {
      console.error('Sign up with email error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAuthReady, 
      isTrialActive, 
      trialDaysLeft, 
      subscriptionDaysLeft, 
      signIn, 
      signInWithRedirectFlow,
      signInWithEmail, 
      signUpWithEmail, 
      resetPassword,
      logout, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
