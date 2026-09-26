import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
import localConfig from "../firebase-applet-config.json";

// Robust validation and cleaning for configuration values
const cleanVal = (val: any): string => {
  if (typeof val !== 'string') return '';
  // Remove quotes, smart quotes, and whitespace
  return val.replace(/["']/g, '').replace(/[\u201C\u201D\u2018\u2019]/g, '').trim();
};

const isValueValid = (val: any) => {
  const cleaned = cleanVal(val);
  return cleaned.length > 0 && 
         !cleaned.includes('YOUR_') && 
         cleaned !== 'undefined' && 
         cleaned !== 'null';
};

// Explicit sources for Vite environment variables
const env = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
};

// We prefer environment variables globally if the API key is provided there
const isEnvActive = isValueValid(env.apiKey);

const getVal = (key: keyof typeof env, localVal: any) => {
  // Special case for databaseId: if env says "(default)" or "default", we honor it
  if (key === 'databaseId' && isValueValid(env.databaseId)) {
    const d = cleanVal(env.databaseId);
    if (d === 'default' || d === '(default)') return '(default)';
    return d;
  }

  if (isEnvActive && isValueValid(env[key])) {
    return cleanVal(env[key]);
  }
  
  const l = cleanVal(localVal);
  return isValueValid(l) ? l : undefined;
};

// Explicit mapping for configuration
const firebaseConfig = {
  apiKey: getVal('apiKey', localConfig.apiKey),
  authDomain: getVal('authDomain', localConfig.authDomain),
  projectId: getVal('projectId', localConfig.projectId),
  storageBucket: getVal('storageBucket', localConfig.storageBucket),
  messagingSenderId: getVal('messagingSenderId', localConfig.messagingSenderId),
  appId: getVal('appId', localConfig.appId),
  measurementId: getVal('measurementId', localConfig.measurementId),
};

// Database ID resolution - STRICT ENFORCEMENT
const envDbId = cleanVal(import.meta.env.VITE_FIREBASE_DATABASE_ID);
const localDbId = cleanVal(localConfig.firestoreDatabaseId);
const userProvidedId = "ai-studio-6a71108d-9bec-4553-86ba-3f52962cbfee";

let rawDatabaseId = userProvidedId; // Default to the one the user said is correct
let dbSource = "Hardcoded Priority";

if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  const forceDb = params.get('force_db');
  if (forceDb) {
    rawDatabaseId = forceDb;
    dbSource = "URL Parameter Override";
  }
}

// Ensure "(default)" translates to undefined for the SDK
const effectiveDatabaseId = (rawDatabaseId === "default" || rawDatabaseId === "(default)" || !rawDatabaseId) ? undefined : rawDatabaseId;

console.log(`[Firebase] Configured Database: ${effectiveDatabaseId || "(default)"} | Source: ${dbSource}`);
console.log(`[Firebase] Environment VITE_FIREBASE_DATABASE_ID: ${envDbId || "not set"}`);
console.log(`[Firebase] Local firestoreDatabaseId: ${localDbId || "not set"}`);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
}, effectiveDatabaseId);

// Connection state tracking
let isOffline = !navigator.onLine;
export const getIsOffline = () => isOffline;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOffline = false;
  });
  window.addEventListener('offline', () => {
    isOffline = true;
  });
}
