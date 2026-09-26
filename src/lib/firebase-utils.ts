import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  DocumentReference,
  CollectionReference,
  Query,
  getDocFromServer
} from "firebase/firestore";
import { auth, db } from "../firebase";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    console.log("Firestore network connection verified.");
  } catch (error: any) {
    const isOffline = error?.message?.includes('the client is offline');
    const isPermissionDenied = error?.code === 'permission-denied';
    const isNotFound = error?.code === 'not-found';

    if (isOffline) {
      console.warn("Firestore connectivity: Client reported as offline. Long polling might be required.");
    } else if (isPermissionDenied || isNotFound) {
      // Permission denied or not found means we successfully reached the backend
      console.log("Firestore network connection verified (reached backend).");
    } else {
      console.error("Firestore Initial Connection Check:", error);
    }
  }
}

/**
 * Safe Firestore write helper with built-in authentication enforcement and retry logic.
 */
export async function safeWrite<T>(
  operation: (data: T) => Promise<any>,
  data: T,
  operationType: OperationType,
  path: string,
  maxRetries = 3
): Promise<any> {
  if (!auth.currentUser) {
    throw new Error("Authentication required for this operation.");
  }

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation(data);
    } catch (error: any) {
      attempt++;
      const isRetryable = error?.code === 'unavailable' || error?.code === 'deadline-exceeded';
      
      if (!isRetryable || attempt >= maxRetries) {
        handleFirestoreError(error, operationType, path);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
