import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import Dashboard from './components/Dashboard';
import Header from './components/Header';
import StockDetail from './components/StockDetail';
import SystemMetrics from './components/SystemMetrics';
import { WebSocketProvider } from './contexts/WebSocketContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
    },
    h2: {
      fontSize: '2rem',
    },
    h3: {
      fontSize: '1.8rem',
    },
    h4: {
      fontSize: '1.5rem',
    },
    h5: {
      fontSize: '1.2rem',
    },
    h6: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
        },
      },
    },
  },
});

function App() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <WebSocketProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Header isConnected={isConnected} />
            <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/stock/:symbol" element={<StockDetail />} />
                <Route path="/metrics" element={<SystemMetrics />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;