import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { User, Workspace, Row, Column } from '../types';
import { getUserProfile, getWorkspace, saveWorkspace, addRowToBlock, updateCell, deleteRow, addColumn } from '../services/firestore';

interface AppContextType {
  user: User | null;
  workspace: Workspace | null;
  isLoading: boolean;
  selectedRowId: string | null;
  searchQuery: string;
  
  setUser: (user: User | null) => void;
  setWorkspace: (workspace: Workspace | null) => void;
  setSelectedRowId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  updateWorkspace: (workspace: Workspace) => Promise<void>;
  addRow: (blockId: string, row: Row) => Promise<void>;
  updateCellValue: (blockId: string, rowId: string, columnId: string, value: any) => Promise<void>;
  removeRow: (blockId: string, rowId: string) => Promise<void>;
  addNewColumn: (blockId: string, column: Column) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const updateWorkspace = useCallback(async (newWorkspace: Workspace) => {
    setIsLoading(true);
    try {
      await saveWorkspace(newWorkspace);
      setWorkspace(newWorkspace);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRow = useCallback(async (blockId: string, row: Row) => {
    if (!workspace) return;
    setIsLoading(true);
    try {
      await addRowToBlock(workspace.id, blockId, row);
      const updatedWorkspace = await getWorkspace(workspace.id);
      if (updatedWorkspace) {
        setWorkspace(updatedWorkspace);
      }
    } finally {
      setIsLoading(false);
    }
  }, [workspace]);

  const updateCellValue = useCallback(async (blockId: string, rowId: string, columnId: string, value: any) => {
    if (!workspace) return;
    setIsLoading(true);
    try {
      await updateCell(workspace.id, blockId, rowId, columnId, value);
      const updatedWorkspace = await getWorkspace(workspace.id);
      if (updatedWorkspace) {
        setWorkspace(updatedWorkspace);
      }
    } finally {
      setIsLoading(false);
    }
  }, [workspace]);

  const removeRow = useCallback(async (blockId: string, rowId: string) => {
    if (!workspace) return;
    setIsLoading(true);
    try {
      await deleteRow(workspace.id, blockId, rowId);
      const updatedWorkspace = await getWorkspace(workspace.id);
      if (updatedWorkspace) {
        setWorkspace(updatedWorkspace);
      }
    } finally {
      setIsLoading(false);
    }
  }, [workspace]);

  const addNewColumn = useCallback(async (blockId: string, column: Column) => {
    if (!workspace) return;
    setIsLoading(true);
    try {
      await addColumn(workspace.id, blockId, column);
      const updatedWorkspace = await getWorkspace(workspace.id);
      if (updatedWorkspace) {
        setWorkspace(updatedWorkspace);
      }
    } finally {
      setIsLoading(false);
    }
  }, [workspace]);

  return (
    <AppContext.Provider
      value={{
        user,
        workspace,
        isLoading,
        selectedRowId,
        searchQuery,
        setUser,
        setWorkspace,
        setSelectedRowId,
        setSearchQuery,
        updateWorkspace,
        addRow,
        updateCellValue,
        removeRow,
        addNewColumn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
