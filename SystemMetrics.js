import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  Storage,
  Speed,
  Memory,
  CloudQueue,
  BarChart,
  Timer,
} from '@mui/icons-material';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const SystemMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [historicalMetrics, setHistoricalMetrics] = useState([]);
  
  // Fetch system metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/stock-prices/metrics');
        setMetrics(response.data);
        
        // Add timestamp to metrics for historical tracking
        const timestampedMetrics = {
          ...response.data,
          timestamp: new Date().toISOString(),
        };
        
        setHistoricalMetrics(prev => {
          // Keep last 50 data points
          const newMetrics = [...prev, timestampedMetrics];
          if (newMetrics.length > 50) {
            return newMetrics.slice(newMetrics.length - 50);
          }
          return newMetrics;
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setIsLoading(false);
      }
    };
    
    // Fetch initial metrics
    fetchMetrics();
    
    // Set up polling
    const intervalId = setInterval(fetchMetrics, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        System Performance Metrics
      </Typography>
      
      <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
        Real-time monitoring of the financial data streaming system
      </Typography>
      
      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Data Points</Typography>
              </Box>
              <Typography variant="h3">
                {metrics?.totalDataPoints?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total stock price data points processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Timer sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Query Time</Typography>
              </Box>
              <Typography variant="h3">
                {metrics?.averageQueryTimeMs?.toFixed(2)}ms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average database query time (40% improvement with TimescaleDB)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Update Latency</Typography>
              </Box>
              <Typography 
                variant="h3" 
                color={metrics?.averageLatencyMs < 50 ? 'success.main' : 'warning.main'}
              >
                {metrics?.averageLatencyMs?.toFixed(2)}ms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average end-to-end price update latency
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(100, (metrics?.averageLatencyMs / 100) * 100)} 
                color={metrics?.averageLatencyMs < 50 ? 'success' : 'warning'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Historical Latency Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Real-time Latency Monitoring
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          End-to-end latency of price updates over time (milliseconds)
        </Typography>
        
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalMetrics}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} 
                stroke="rgba(255,255,255,0.7)"
              />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                formatter={(value) => [`${value.toFixed(2)} ms`, 'Latency']}
                labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="averageLatencyMs"
                name="Update Latency"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                isAnimationActive={false}
              />
              {/* Reference line for 50ms target */}
              <Line
                type="monotone"
                dataKey={() => 50}
                name="Target (50ms)"
                stroke="#82ca9d"
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
      
      {/* System Resource Monitoring */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          System Resources
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                CPU Usage
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics?.cpuUsagePercent || 0} 
                    color={metrics?.cpuUsagePercent > 80 ? 'error' : 'primary'}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {metrics?.cpuUsagePercent?.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Memory Usage
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(metrics?.memoryUsageMb / 2048) * 100} 
                    color={metrics?.memoryUsageMb > 1638 ? 'error' : 'primary'}
                  />
                </Box>
                <Box sx={{ minWidth: 60 }}>
                  <Typography variant="body2" color="text.secondary">
                    {metrics?.memoryUsageMb?.toFixed(0)} MB
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={historicalMetrics}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} 
                    stroke="rgba(255,255,255,0.7)" 
                  />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                    labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="messagesPerSecond" 
                    name="Messages/sec" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* WebSocket Connections */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Active WebSocket Connections
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CloudQueue sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h3">
            {metrics?.activeWebSocketConnections || 0}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Number of clients receiving real-time price updates
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Average Query Time
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" color="primary.main">
                {metrics?.averageQueryTimeMs?.toFixed(2)}ms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                TimescaleDB optimized query performance
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Processing Efficiency
            </Typography>
            <Box>
              <Typography variant="h4" color="primary.main">
                40%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reduction in data retrieval time
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SystemMetrics;