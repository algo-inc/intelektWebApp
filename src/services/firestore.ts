import { isDemoMode, db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { User, Workspace } from '../types';

// Demo data
const demoWorkspace: Workspace = {
  id: 'demo-workspace',
  name: 'Demo Workspace',
  activePageId: 'assets',
  settings: {
    statusOptions: ['На складі', 'В роботі', 'Ремонт', 'Списано'],
    showStats: true,
    theme: {
      mode: 'dark',
      primary: '#cfbdff',
      primaryContainer: '#54389a',
      secondaryContainer: '#4a4458',
      tertiary: '#efb8c8',
      background: '#141218',
      surface: '#211f26',
      blockAccent: '#7c5cff',
    },
  },
  departments: [
    { id: 'main', name: 'Основний підрозділ', responsibleUid: '' },
  ],
  pages: [
    {
      id: 'assets',
      name: 'Облік майна',
      icon: '▦',
      blocks: [
        {
          id: 'main-assets',
          title: 'Основна таблиця',
          columns: [],
          rows: [],
        },
      ],
    },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export async function getUserProfile(uid: string): Promise<User | null> {
  if (isDemoMode) {
    return {
      uid,
      email: 'demo@example.com',
      displayName: 'Demo User',
      role: 'user',
      createdAt: Date.now(),
    };
  }

  const userRef = doc(db!, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    return userDoc.data() as User;
  }

  return null;
}

export async function createUserProfile(uid: string, email: string, role: 'user' = 'user'): Promise<User> {
  const user: User = {
    uid,
    email,
    role,
    createdAt: Date.now(),
  };

  if (!isDemoMode) {
    await setDoc(doc(db!, 'users', uid), user);
  }

  return user;
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  if (isDemoMode) {
    return demoWorkspace;
  }

  const workspaceRef = doc(db!, 'workspaces', workspaceId);
  const workspaceDoc = await getDoc(workspaceRef);

  if (workspaceDoc.exists()) {
    return workspaceDoc.data() as Workspace;
  }

  return null;
}

export async function saveWorkspace(workspace: Workspace): Promise<void> {
  if (isDemoMode) {
    localStorage.setItem('demo-workspace', JSON.stringify(workspace));
    return;
  }

  await setDoc(doc(db!, 'workspaces', workspace.id), workspace);
}
