import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Box, CircularProgress, Paper } from '@mui/material';
import axios from 'axios';
import { useWebSocket } from '../contexts/WebSocketContext';

const StockPriceChart = ({ symbol, height = 300 }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const { subscribeToStock, stockPrices } = useWebSocket();
  
  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const chartOptions = {
      layout: {
        background: { color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.1)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.1)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(197, 203, 206, 0.3)',
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.3)',
      },
      crosshair: {
        mode: 0,
        vertLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.1)',
          style: 0,
        },
        horzLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.1)',
          style: 0,
        },
      },
    };
    
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      ...chartOptions,
    });
    
    seriesRef.current = chartRef.current.addAreaSeries({
      topColor: 'rgba(33, 150, 243, 0.56)',
      bottomColor: 'rgba(33, 150, 243, 0.04)',
      lineColor: 'rgba(33, 150, 243, 1)',
      lineWidth: 2,
    });
    
    // Handle resize
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Fetch historical data
    fetchHistoricalData();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbol]);
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (symbol) {
      subscribeToStock(symbol);
    }
  }, [symbol, subscribeToStock]);
  
  // Update chart with real-time data
  useEffect(() => {
    if (!seriesRef.current || !stockPrices[symbol]) return;
    
    const priceData = stockPrices[symbol];
    
    // Add real-time data point
    seriesRef.current.update({
      time: priceData.timestamp / 1000, // Convert to seconds for lightweight-charts
      value: parseFloat(priceData.price)
    });
  }, [stockPrices, symbol]);
  
  // Fetch historical data for the chart
  const fetchHistoricalData = async () => {
    try {
      setIsLoading(true);
      
      // Get price history for the last 24 hours
      const endTime = new Date();
      const startTime = new Date(endTime);
      startTime.setHours(endTime.getHours() - 24);
      
      const response = await axios.get(
        `http://localhost:8080/api/stock-prices/${symbol}/history`,
        {
          params: {
            from: startTime.toISOString(),
            to: endTime.toISOString(),
            limit: 500
          }
        }
      );
      
      if (response.data && response.data.length > 0 && seriesRef.current) {
        // Format data for the chart
        const chartData = response.data.map(dataPoint => ({
          time: new Date(dataPoint.timestamp).getTime() / 1000, // Convert to seconds
          value: parseFloat(dataPoint.price)
        }));
        
        // Set the chart data
        seriesRef.current.setData(chartData);
        
        // Fit the visible range to show all data
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setIsLoading(false);
    }
  };
  
  return (
    <Box sx={{ position: 'relative', width: '100%', height }}>
      {isLoading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};

export default StockPriceChart;