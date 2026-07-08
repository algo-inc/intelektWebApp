import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Menu, MenuItem } from '@mui/material';
import { signOut } from '../../services/auth';

interface AppRailProps {
  userEmail?: string;
  onLogout: () => void;
}

export function AppRail({ userEmail = 'User', onLogout }: AppRailProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await signOut();
    onLogout();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              IW
            </Typography>
            <Typography variant="body1">
              Облік майна
            </Typography>
          </Box>

          <Button
            onClick={handleMenuOpen}
            color="inherit"
            size="small"
          >
            {userEmail}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              Вихід
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </>
  );
}
