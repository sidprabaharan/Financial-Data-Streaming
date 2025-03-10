import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Grid, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import axios from 'axios';
import { useWebSocket } from '../contexts/WebSocketContext';

import StockPriceChart from './StockPriceChart';

const Dashboard = () => {
  const [symbols, setSymbols] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const { subscribeToStock, stockPrices, isConnected, latency } = useWebSocket();
  
  // Fetch available stock symbols
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/stock-prices/symbols');
        setSymbols(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching symbols:', error);
        setIsLoading(false);
      }
    };
    
    fetchSymbols();
  }, []);
  
  // Fetch system stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/stock-prices/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Subscribe to all stock symbols
  useEffect(() => {
    if (isConnected && symbols.length > 0) {
      symbols.forEach(symbol => {
        subscribeToStock(symbol);
      });
    }
  }, [isConnected, symbols, subscribeToStock]);
  
  // Format percentage change with color and arrow
  const formatChange = (change) => {
    if (!change) return null;
    
    const isPositive = change >= 0;
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: isPositive ? 'success.main' : 'error.main' 
        }}
      >
        {isPositive 
          ? <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} /> 
          : <ArrowDownward fontSize="small" sx={{ mr: 0.5 }} />}
        {Math.abs(change).toFixed(2)}%
      </Box>
    );
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Grid container spacing={3}>
      {/* System Stats */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" gutterBottom>
              Financial Data Streaming
            </Typography>
            <Typography variant="body1">
              Real-time stock price tracking with sub-{latency && latency < 50 ? '50ms' : '100ms'} latency
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip 
              label={`${isConnected ? 'Connected' : 'Disconnected'}`} 
              color={isConnected ? 'success' : 'error'} 
              variant="outlined" 
            />
            {latency && (
              <Chip 
                label={`Latency: ${Math.round(latency)}ms`} 
                color={latency < 50 ? 'success' : 'warning'} 
                variant="outlined" 
              />
            )}
            {stats && (
              <Chip 
                label={`${stats.totalDataPoints?.toLocaleString()} data points`} 
                color="primary" 
                variant="outlined" 
              />
            )}
          </Box>
        </Paper>
      </Grid>
      
      {/* Stock Table */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Real-time Stock Prices
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Change</TableCell>
                  <TableCell align="right">Volume</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {symbols.map((symbol) => {
                  const stockData = stockPrices[symbol];
                  return (
                    <TableRow key={symbol} hover component={Link} to={`/stock/${symbol}`} sx={{ textDecoration: 'none' }}>
                      <TableCell component="th" scope="row">
                        {symbol}
                      </TableCell>
                      <TableCell align="right">
                        {stockData ? `$${stockData.price}` : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {stockData ? formatChange(stockData.changePercent) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {stockData ? stockData.volume.toLocaleString() : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
      
      {/* Chart Preview */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Real-time Price Chart
          </Typography>
          {symbols.length > 0 && (
            <StockPriceChart symbol={symbols[0]} height={400} />
          )}
        </Paper>
      </Grid>
      
      {/* System Performance Metrics */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Data Processing
                </Typography>
                <Typography variant="h4">
                  {stats?.totalDataPoints?.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Total stock price data points processed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Query Time Improvement
                </Typography>
                <Typography variant="h4">
                  {stats?.queryTimeImprovement || '-'}
                </Typography>
                <Typography variant="body2">
                  TimescaleDB optimization vs standard queries
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Real-time Updates
                </Typography>
                <Typography variant="h4">
                  {stats?.subFiftyMsPercentage ? `${stats.subFiftyMsPercentage.toFixed(1)}%` : '-'}
                </Typography>
                <Typography variant="body2">
                  Updates delivered in under 50ms
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;