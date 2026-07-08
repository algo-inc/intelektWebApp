import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { User, Workspace } from '../types';
import { getUserProfile, getWorkspace, saveWorkspace } from '../services/firestore';

interface AppContextType {
  user: User | null;
  workspace: Workspace | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setWorkspace: (workspace: Workspace | null) => void;
  updateWorkspace: (workspace: Workspace) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateWorkspace = useCallback(async (newWorkspace: Workspace) => {
    setIsLoading(true);
    try {
      await saveWorkspace(newWorkspace);
      setWorkspace(newWorkspace);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        workspace,
        isLoading,
        setUser,
        setWorkspace,
        updateWorkspace,
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
