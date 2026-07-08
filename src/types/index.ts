export type UserRole = 'admin' | 'storekeeper' | 'manager' | 'user';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: number;
}

export interface Column {
  id: string;
  name: string;
  type: FieldType;
  order: number;
}

export interface Row {
  id: string;
  cells: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface Block {
  id: string;
  title: string;
  columns: Column[];
  rows: Row[];
}

export interface Page {
  id: string;
  name: string;
  icon: string;
  blocks: Block[];
}

export interface Department {
  id: string;
  name: string;
  responsibleUid?: string;
}

export interface Workspace {
  id: string;
  name: string;
  activePageId: string;
  settings: {
    statusOptions: string[];
    showStats: boolean;
    theme: Theme;
  };
  departments: Department[];
  pages: Page[];
  createdAt: number;
  updatedAt: number;
}

export interface Theme {
  mode: 'light' | 'dark';
  primary: string;
  primaryContainer: string;
  secondaryContainer: string;
  tertiary: string;
  background: string;
  surface: string;
  blockAccent: string;
}

export type FieldType = 'text' | 'number' | 'status' | 'block' | 'department' | 'date' | 'currency' | 'checkbox';
