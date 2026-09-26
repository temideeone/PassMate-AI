import { useState, useEffect } from 'react';

type ConsentChoice = 'accepted' | 'rejected' | null;

class ConsentManager {
  private choice: ConsentChoice = null;
  private listeners: ((choice: ConsentChoice) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.choice = localStorage.getItem('cookie-consent') as ConsentChoice;
    }
  }

  getChoice() {
    return this.choice;
  }

  setChoice(choice: ConsentChoice) {
    this.choice = choice;
    if (typeof window !== 'undefined') {
      if (choice) {
        localStorage.setItem('cookie-consent', choice);
      } else {
        localStorage.removeItem('cookie-consent');
      }
    }
    this.listeners.forEach(l => l(choice));
  }

  subscribe(listener: (choice: ConsentChoice) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Helper to check if non-essential features are allowed
  canTrack() {
    return this.choice === 'accepted';
  }
}

export const consentManager = new ConsentManager();

// React hook for convenience
export function useConsent() {
  const [choice, setChoice] = useState<ConsentChoice>(consentManager.getChoice());

  useEffect(() => {
    return consentManager.subscribe(newChoice => setChoice(newChoice));
  }, []);

  return {
    choice,
    isAccepted: choice === 'accepted',
    isRejected: choice === 'rejected',
    setChoice: (nc: ConsentChoice) => consentManager.setChoice(nc)
  };
}
