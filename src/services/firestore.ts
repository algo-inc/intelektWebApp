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
import { User, Workspace, Block, Row, Column, FieldType } from '../types';
import { DEFAULT_STATUSES, DEFAULT_THEME, STORAGE_KEYS } from '../constants';

// Demo data
const demoWorkspace: Workspace = {
  id: 'demo-workspace',
  name: 'Демо Workspace',
  activePageId: 'assets',
  settings: {
    statusOptions: DEFAULT_STATUSES,
    showStats: true,
    theme: DEFAULT_THEME,
  },
  departments: [
    { id: 'main', name: 'Основний підрозділ', responsibleUid: '' },
    { id: 'warehouse', name: 'Склад', responsibleUid: '' },
    { id: 'it', name: 'IT відділ', responsibleUid: '' },
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
          statusField: 'status',
          statusSort: 'block',
          columns: [
            { id: 'name', name: 'Назва', type: 'text', order: 0 },
            { id: 'serial', name: 'Серійний номер', type: 'text', order: 1 },
            { id: 'quantity', name: 'Кількість', type: 'number', order: 2 },
            { id: 'status', name: 'Статус', type: 'status', order: 3 },
            { id: 'department', name: 'Підрозділ', type: 'department', order: 4 },
            { id: 'price', name: 'Вартість', type: 'currency', order: 5 },
          ],
          rows: [
            {
              id: 'row-1',
              cells: {
                name: { value: 'Монітор Dell 27"' },
                serial: { value: 'DELL-2024-001' },
                quantity: { value: 3 },
                status: { value: 'На складі' },
                department: { value: 'IT відділ' },
                price: { value: 15000 },
              },
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            {
              id: 'row-2',
              cells: {
                name: { value: 'Клавіатура механічна' },
                serial: { value: 'MECH-2024-001' },
                quantity: { value: 10 },
                status: { value: 'В роботі' },
                department: { value: 'Основний підрозділ' },
                price: { value: 3500 },
              },
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        },
      ],
    },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export async function getUserProfile(uid: string): Promise<User | null> {
  if (isDemoMode) {
    const stored = localStorage.getItem(STORAGE_KEYS.demoUser);
    if (stored) {
      return JSON.parse(stored);
    }
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
    const stored = localStorage.getItem(STORAGE_KEYS.workspace);
    if (stored) {
      return JSON.parse(stored);
    }
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
  workspace.updatedAt = Date.now();
  if (isDemoMode) {
    localStorage.setItem(STORAGE_KEYS.workspace, JSON.stringify(workspace));
    return;
  }

  await setDoc(doc(db!, 'workspaces', workspace.id), workspace);
}

export async function addRowToBlock(workspaceId: string, blockId: string, row: Row): Promise<void> {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) return;

  const page = workspace.pages.find(p => p.blocks.some(b => b.id === blockId));
  if (!page) return;

  const block = page.blocks.find(b => b.id === blockId);
  if (!block) return;

  block.rows.push(row);
  await saveWorkspace(workspace);
}

export async function updateCell(workspaceId: string, blockId: string, rowId: string, columnId: string, value: any): Promise<void> {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) return;

  let found = false;
  for (const page of workspace.pages) {
    for (const block of page.blocks) {
      if (block.id === blockId) {
        const row = block.rows.find(r => r.id === rowId);
        if (row) {
          if (!row.cells[columnId]) {
            row.cells[columnId] = { value };
          } else {
            row.cells[columnId].value = value;
          }
          row.cells[columnId].updatedAt = Date.now();
          row.updatedAt = Date.now();
          found = true;
          break;
        }
      }
    }
    if (found) break;
  }

  if (found) {
    await saveWorkspace(workspace);
  }
}

export async function deleteRow(workspaceId: string, blockId: string, rowId: string): Promise<void> {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) return;

  for (const page of workspace.pages) {
    for (const block of page.blocks) {
      if (block.id === blockId) {
        block.rows = block.rows.filter(r => r.id !== rowId);
        break;
      }
    }
  }

  await saveWorkspace(workspace);
}

export async function addColumn(workspaceId: string, blockId: string, column: Column): Promise<void> {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) return;

  for (const page of workspace.pages) {
    for (const block of page.blocks) {
      if (block.id === blockId) {
        block.columns.push(column);
        break;
      }
    }
  }

  await saveWorkspace(workspace);
}
