import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Timeline,
  ShowChart,
  Speed,
  Home,
} from '@mui/icons-material';
import { useWebSocket } from '../contexts/WebSocketContext';

const Header = () => {
  const theme = useTheme();
  const location = useLocation();
  const { isConnected, latency } = useWebSocket();
  
  return (
    <AppBar position="sticky" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'inherit',
            textDecoration: 'none',
            flexGrow: 1,
          }}
        >
          <Timeline sx={{ mr: 1 }} />
          Financial Data Stream
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            component={Link}
            to="/"
            color="inherit"
            startIcon={<Home />}
            sx={{
              mr: 2,
              fontWeight: location.pathname === '/' ? 'bold' : 'normal',
              borderBottom: location.pathname === '/' ? '2px solid' : 'none',
            }}
          >
            Dashboard
          </Button>
          
          <Button
            component={Link}
            to="/metrics"
            color="inherit"
            startIcon={<Speed />}
            sx={{
              mr: 2,
              fontWeight: location.pathname === '/metrics' ? 'bold' : 'normal',
              borderBottom: location.pathname === '/metrics' ? '2px solid' : 'none',
            }}
          >
            System Metrics
          </Button>
          
          <Chip
            icon={<ShowChart />}
            label={isConnected ? 'Connected' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
          
          {isConnected && latency && (
            <Chip
              label={`${Math.round(latency)}ms`}
              color={latency < 50 ? 'success' : 'warning'}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;