import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from 'stompjs';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stockPrices, setStockPrices] = useState({});
  const [subscriptions, setSubscriptions] = useState([]);
  const [latency, setLatency] = useState(null);
  
  // Connect to WebSocket
  useEffect(() => {
    const connect = () => {
      const socket = new SockJS('http://localhost:8080/ws');
      const stompClient = new Client({
        webSocketFactory: () => socket,
        debug: false,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });
      
      stompClient.onConnect = () => {
        setIsConnected(true);
        console.log('Connected to WebSocket');
      };
      
      stompClient.onStompError = (frame) => {
        console.error('STOMP Error:', frame.headers.message);
        setIsConnected(false);
      };
      
      stompClient.onWebSocketClose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        // Reconnect after a delay
        setTimeout(connect, 5000);
      };
      
      stompClient.activate();
      setClient(stompClient);
    };
    
    connect();
    
    return () => {
      if (client && client.connected) {
        client.deactivate();
      }
    };
  }, []);
  
  // Subscribe to a stock's price updates
  const subscribeToStock = useCallback((symbol) => {
    if (!client || !client.connected) return;
    
    const subscription = client.subscribe(`/topic/stock/${symbol}`, (message) => {
      try {
        const data = JSON.parse(message.body);
        
        // Calculate client-side latency
        const receivedTime = Date.now();
        const latency = receivedTime - data.processedTimestamp;
        
        setLatency(prevLatency => {
          // Keep a running average of the last 5 latency values
          if (!prevLatency) return latency;
          return (prevLatency * 4 + latency) / 5;
        });
        
        setStockPrices(prev => ({
          ...prev,
          [symbol]: data
        }));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    setSubscriptions(prev => [...prev, { symbol, subscription }]);
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      setSubscriptions(prev => prev.filter(sub => sub.symbol !== symbol));
    };
  }, [client]);
  
  // Unsubscribe from a stock's price updates
  const unsubscribeFromStock = useCallback((symbol) => {
    const subscription = subscriptions.find(sub => sub.symbol === symbol);
    if (subscription) {
      subscription.subscription.unsubscribe();
      setSubscriptions(prev => prev.filter(sub => sub.symbol !== symbol));
    }
  }, [subscriptions]);
  
  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        stockPrices,
        subscribeToStock,
        unsubscribeFromStock,
        latency
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};