import { isDemoMode, auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { User } from '../types';

const googleProvider = new GoogleAuthProvider();

export async function signUpWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
  if (isDemoMode) {
    return {
      uid: `demo_${Date.now()}`,
      email,
      emailVerified: true,
      displayName: email.split('@')[0],
      isAnonymous: false,
      metadata: {},
      providerData: [],
      reload: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      toJSON: () => ({}),
      delete: async () => {},
      toFirestore: () => ({}),
    } as any;
  }

  const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
  return userCredential.user;
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
  if (isDemoMode) {
    return {
      uid: `demo_user_${email}`,
      email,
      emailVerified: true,
      displayName: email.split('@')[0],
      isAnonymous: false,
      metadata: {},
      providerData: [],
      reload: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      toJSON: () => ({}),
      delete: async () => {},
      toFirestore: () => ({}),
    } as any;
  }

  const userCredential = await signInWithEmailAndPassword(auth!, email, password);
  return userCredential.user;
}

export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  if (isDemoMode) {
    return {
      uid: `demo_google_${Date.now()}`,
      email: 'demo@example.com',
      emailVerified: true,
      displayName: 'Demo User',
      isAnonymous: false,
      metadata: {},
      providerData: [],
      reload: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      toJSON: () => ({}),
      delete: async () => {},
      toFirestore: () => ({}),
    } as any;
  }

  const result = await signInWithPopup(auth!, googleProvider);
  return result.user;
}

export async function resetPassword(email: string): Promise<void> {
  if (isDemoMode) return;
  await sendPasswordResetEmail(auth!, email);
}

export async function signOut(): Promise<void> {
  if (isDemoMode) return;
  await firebaseSignOut(auth!);
}

export function getCurrentUser(): FirebaseUser | null {
  if (isDemoMode) return null;
  return auth?.currentUser || null;
}
