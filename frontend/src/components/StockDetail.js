import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { ArrowBack, TrendingUp, TrendingDown, AccessTime } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { useWebSocket } from '../contexts/WebSocketContext';
import StockPriceChart from './StockPriceChart';

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('1d');
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { subscribeToStock, stockPrices } = useWebSocket();
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (symbol) {
      subscribeToStock(symbol);
    }
  }, [symbol, subscribeToStock]);
  
  // Update stock data from WebSocket
  useEffect(() => {
    if (stockPrices[symbol]) {
      setStockData(stockPrices[symbol]);
    }
  }, [stockPrices, symbol]);
  
  // Fetch historical data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        
        // Calculate time range
        const endTime = new Date();
        const startTime = new Date(endTime);
        
        switch(timeRange) {
          case '1d':
            startTime.setHours(endTime.getHours() - 24);
            break;
          case '1w':
            startTime.setDate(endTime.getDate() - 7);
            break;
          case '1m':
            startTime.setMonth(endTime.getMonth() - 1);
            break;
          case '3m':
            startTime.setMonth(endTime.getMonth() - 3);
            break;
          case '1y':
            startTime.setFullYear(endTime.getFullYear() - 1);
            break;
          default:
            startTime.setHours(endTime.getHours() - 24);
        }
        
        const response = await axios.post(
          `http://localhost:8080/api/stock-prices/${symbol}/history`,
          {
            from: startTime.toISOString(),
            to: endTime.toISOString(),
            interval: getIntervalFromTimeRange(timeRange),
            limit: 500
          }
        );
        
        setHistoricalData(response.data);
        
        // If no real-time data yet, use the latest historical point
        if (!stockData && response.data.length > 0) {
          setStockData(response.data[response.data.length - 1]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching historical data:', error);
        setIsLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [symbol, timeRange, stockData]);
  
  // Helper to get interval string for API request
  const getIntervalFromTimeRange = (range) => {
    switch(range) {
      case '1d': return '5m';
      case '1w': return '1h';
      case '1m': return '4h';
      case '3m': return '1d';
      case '1y': return '1w';
      default: return '5m';
    }
  };
  
  // Format price with fixed decimals
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };
  
  // Format percentage change with color
  const getChangeColor = (change) => {
    if (!change) return 'text.secondary';
    return parseFloat(change) >= 0 ? 'success.main' : 'error.main';
  };
  
  // Format change with + sign for positive values
  const formatChange = (change) => {
    if (!change) return '0.00';
    const changeVal = parseFloat(change);
    return `${changeVal >= 0 ? '+' : ''}${changeVal.toFixed(2)}`;
  };
  
  if (isLoading && !stockData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          {symbol}
        </Typography>
        {stockData && (
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ mr: 1 }}>
              ${formatPrice(stockData.price)}
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ color: getChangeColor(stockData.changePercent) }}
            >
              {formatChange(stockData.changePercent)}%
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Price Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Price Chart
          </Typography>
          <Box>
            <Button 
              size="small" 
              variant={timeRange === '1d' ? 'contained' : 'text'} 
              onClick={() => setTimeRange('1d')}
            >
              1D
            </Button>
            <Button 
              size="small" 
              variant={timeRange === '1w' ? 'contained' : 'text'} 
              onClick={() => setTimeRange('1w')}
            >
              1W
            </Button>
            <Button 
              size="small" 
              variant={timeRange === '1m' ? 'contained' : 'text'} 
              onClick={() => setTimeRange('1m')}
            >
              1M
            </Button>
            <Button 
              size="small" 
              variant={timeRange === '3m' ? 'contained' : 'text'} 
              onClick={() => setTimeRange('3m')}
            >
              3M
            </Button>
            <Button 
              size="small" 
              variant={timeRange === '1y' ? 'contained' : 'text'} 
              onClick={() => setTimeRange('1y')}
            >
              1Y
            </Button>
          </Box>
        </Box>
        <Box sx={{ height: 400 }}>
          <StockPriceChart symbol={symbol} height={400} />
        </Box>
      </Paper>
      
      {/* Stats Cards */}
      {stockData && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Open
                </Typography>
                <Typography variant="h5">
                  ${formatPrice(stockData.open)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  High
                </Typography>
                <Typography variant="h5">
                  ${formatPrice(stockData.high)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Low
                </Typography>
                <Typography variant="h5">
                  ${formatPrice(stockData.low)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Volume
                </Typography>
                <Typography variant="h5">
                  {stockData.volume.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Latest Updates */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Latest Updates
        </Typography>
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {historicalData.slice(-10).reverse().map((dataPoint, index) => (
            <Box 
              key={index} 
              sx={{ 
                py: 1, 
                borderBottom: index < 9 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <Typography variant="body2" color="textSecondary">
                    {format(new Date(dataPoint.timestamp), 'MMM dd, HH:mm:ss')}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body1">
                    ${formatPrice(dataPoint.price)}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography 
                    variant="body2" 
                    sx={{ color: getChangeColor(dataPoint.changePercent), display: 'flex', alignItems: 'center' }}
                  >
                    {parseFloat(dataPoint.changePercent) >= 0 ? (
                      <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                    ) : (
                      <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />
                    )}
                    {formatChange(dataPoint.changePercent)}%
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">
                    {dataPoint.volume.toLocaleString()} shares
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default StockDetail;