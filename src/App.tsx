import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { LoginPanel } from './components/Auth/LoginPanel';
import { AppRail } from './components/Workspace/AppRail';
import { WorkspaceTable } from './components/Tables/WorkspaceTable';
import { AppProvider, useAppContext } from './context/AppContext';
import { getUserProfile, getWorkspace } from './services/firestore';
import { User } from './types';
import './App.css';

function AppContent() {
  const { user, setUser, workspace, setWorkspace } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  const handleLoginSuccess = async (firebaseUser: any) => {
    try {
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        setUser(profile);
        const workspace = await getWorkspace('default');
        if (workspace) {
          setWorkspace(workspace);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleDemoMode = async () => {
    const demoUser: User = {
      uid: 'demo-user',
      email: 'demo@example.com',
      displayName: 'Demo User',
      role: 'admin',
      createdAt: Date.now(),
    };
    setUser(demoUser);
    const workspace = await getWorkspace('demo-workspace');
    if (workspace) {
      setWorkspace(workspace);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setWorkspace(null);
  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (!user) {
    return (
      <LoginPanel
        onLoginSuccess={handleLoginSuccess}
        onDemoMode={handleDemoMode}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppRail userEmail={user.email} onLogout={handleLogout} />
      <Box sx={{ flex: 1, p: 2, overflow: 'auto', backgroundColor: '#f5f5f5' }}>
        {workspace && workspace.pages[0].blocks[0] && (
          <WorkspaceTable
            block={workspace.pages[0].blocks[0]}
            onAddRow={() => console.log('Add row')}
            onAddColumn={() => console.log('Add column')}
          />
        )}
      </Box>
    </Box>
  );
}

function App() {
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#6750a4',
      },
      secondary: {
        main: '#7d5260',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
