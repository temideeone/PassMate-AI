import { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

export default function SubscriptionReminder() {
  const { user, profile, trialDaysLeft, isTrialActive, subscriptionDaysLeft } = useAuth();
  const lastCheckRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !profile || profile.role === 'admin') return;

    const checkAndSendNotification = async () => {
      const today = new Date().toISOString().split('T')[0];
      if (lastCheckRef.current === today) return;

      try {
        // 1. Handle Trial Reminders (Last 7 days)
        if (isTrialActive && trialDaysLeft <= 7 && trialDaysLeft > 0) {
          const q = query(
            collection(db, 'notifications'),
            where('uid', '==', user.uid),
            where('type', '==', 'trial_reminder'),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          
          const snapshot = await getDocs(q);
          let shouldSend = true;

          if (!snapshot.empty) {
            const lastNotif = snapshot.docs[0].data();
            const lastNotifDate = new Date(lastNotif.createdAt).toISOString().split('T')[0];
            if (lastNotifDate === today) shouldSend = false;
          }

          if (shouldSend) {
            const messages = [
              `Don't lose your momentum! Your free trial ends in ${trialDaysLeft} days. Upgrade now for just ₦2,500/month to keep unlimited AI Tutor access and practice exams!`,
              `You've been doing great! Only ${trialDaysLeft} days left in your trial. Unlock your full potential with PassMate Premium: Unlimited questions, study reminders, and deep analytics.`,
              `Time is running out! ${trialDaysLeft} days left to enjoy PassMate for free. Subscribe today for ₦2,500 to ensure your study schedule stays on track.`,
              `Ready to ace your exams? Your trial expires in ${trialDaysLeft} days. Join our premium community for unlimited practice and personalized AI guidance for only ₦2,500/month!`
            ];

            const randomMessage = messages[Math.floor(Math.random() * messages.length)];

            await addDoc(collection(db, 'notifications'), {
              uid: user.uid,
              title: 'Trial Ending Soon! ⏳',
              message: randomMessage,
              type: 'trial_reminder',
              read: false,
              createdAt: new Date(),
              actionUrl: '/subscription'
            });
            lastCheckRef.current = today;
          }
        }

        // 2. Handle Paid Subscription Reminders (Last 5 days)
        if (profile.subscriptionStatus === 'premium' && subscriptionDaysLeft <= 5 && subscriptionDaysLeft > 0) {
          const q = query(
            collection(db, 'notifications'),
            where('uid', '==', user.uid),
            where('type', '==', 'subscription_renewal'),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          
          const snapshot = await getDocs(q);
          let shouldSend = true;

          if (!snapshot.empty) {
            const lastNotif = snapshot.docs[0].data();
            const lastNotifDate = new Date(lastNotif.createdAt).toISOString().split('T')[0];
            if (lastNotifDate === today) shouldSend = false;
          }

          if (shouldSend) {
            await addDoc(collection(db, 'notifications'), {
              uid: user.uid,
              title: 'Subscription Renewal 🔔',
              message: `Your PassMate Premium subscription expires in ${subscriptionDaysLeft} days. Renew now for ₦2,500 to maintain uninterrupted access to all premium features!`,
              type: 'subscription_renewal',
              read: false,
              createdAt: new Date(),
              actionUrl: '/subscription'
            });
            lastCheckRef.current = today;
          }
        }
      } catch (error) {
        console.error('Error sending reminder:', error);
      }
    };

    checkAndSendNotification();
  }, [user, profile, trialDaysLeft, isTrialActive, subscriptionDaysLeft]);

  return null;
}
