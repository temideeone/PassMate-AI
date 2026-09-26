import { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, addDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

export default function StudyReminder() {
  const { user, profile, isTrialActive } = useAuth();
  const [schedule, setSchedule] = useState<any[]>([]);
  const notifiedRefs = useRef<Set<string>>(new Set());

  const isEligible = profile?.subscriptionStatus === 'premium' || isTrialActive;

  // 1. Sync the schedule locally using manual fetch + polling
  const fetchSchedule = async () => {
    if (!user || !isEligible) return;
    try {
      const q = query(collection(db, 'study_schedule'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      setSchedule(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Reminder sync error:", error);
    }
  };

  useEffect(() => {
    fetchSchedule();
    const interval = setInterval(fetchSchedule, 300000); // Sync every 5 mins
    return () => clearInterval(interval);
  }, [user, isEligible]);

  // 2. Periodically check the local schedule (every 30 seconds)
  useEffect(() => {
    if (!user || !isEligible || schedule.length === 0) return;

    const playBeep = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.error("Audio error:", e);
      }
    };

    const checkReminders = async () => {
      const now = new Date();
      
      for (const item of schedule) {
        const scheduleTime = new Date(item.date);
        const diffMs = scheduleTime.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        // If it's between 0 and 6 minutes before and we haven't notified yet
        // Using a range (0-6) instead of exact 5 to be more robust with 30s intervals
        if (diffMins >= 0 && diffMins <= 5 && !notifiedRefs.current.has(item.id)) {
          notifiedRefs.current.add(item.id);
          
          try {
            playBeep();
            await addDoc(collection(db, 'notifications'), {
              uid: user.uid,
              title: 'Study Reminder',
              message: `Your study session "${item.title}" starts soon! Get ready.`,
              type: 'warning',
              read: false,
              createdAt: new Date()
            });
            console.log(`[EMAIL SENT] To: ${user.email} | Subject: Study Reminder | Body: Your session "${item.title}" starts soon.`);
          } catch (error) {
            console.error("Error sending reminder:", error);
          }
        }
      }
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [user, profile, schedule, isEligible]);

  return null;
}
