import { consentManager } from './consent';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Real Enforcement of Cookie Privacy & Global Analytics
 * This service ensures that no tracking data is sent unless the user has
 * explicitly clicked "Accept All" on the cookie banner.
 */
export const analytics = {
  trackEvent: async (eventName: string, params?: Record<string, any>) => {
    if (!consentManager.canTrack()) {
      console.log(`[Privacy Guard] Analytics event "${eventName}" blocked (Consent: Rejected/Pending)`);
      return;
    }

    const user = auth.currentUser;
    if (!user) return; // Only track for authenticated users to match rules and prevent spam

    const eventData = {
      event: eventName,
      uid: user.uid,
      timestamp: serverTimestamp(),
      path: window.location.pathname,
      metadata: params || {}
    };

    // Log to console for dev visibility
    console.log(`[Privacy Guard] Logging event: "${eventName}"`, {
      ...eventData,
      timestamp: '[Server Timestamp Placeholder]'
    });
    console.log(`[Privacy Guard] Auth Status: uid=${user?.uid}, emailVerified=${user?.emailVerified}`);
    
    // Save to Firestore for Admin Dashboard insights
    try {
      await addDoc(collection(db, 'analytics_events'), eventData);
      console.log(`[Privacy Guard] Event "${eventName}" saved successfully.`);
    } catch (error) {
      console.warn("[Privacy Guard] Failed to save analytics event (non-blocking):", error);
    }
  },

  trackPageView: (pageName: string) => {
    if (!consentManager.canTrack()) return;
    analytics.trackEvent('page_view', { page: pageName });
  }
};
