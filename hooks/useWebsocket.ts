import { useEffect, useRef, useState } from 'react';

type MessageHandler = (data: any) => void;

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Record<string, MessageHandler[]>>({});

  const connect = () => {
    if (wsRef.current) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setReconnectAttempts(0);
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');

      // Attempt reconnect with exponential backoff
      const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        connect();
      }, timeout);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const handlers = messageHandlersRef.current[message.type] || [];
        handlers.forEach(handler => handler(message.data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const sendMessage = (type: string, data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected, message not sent:', type);
    }
  };

  const addMessageHandler = (type: string, handler: MessageHandler) => {
    if (!messageHandlersRef.current[type]) {
      messageHandlersRef.current[type] = [];
    }
    messageHandlersRef.current[type].push(handler);

    // Return cleanup function
    return () => {
      messageHandlersRef.current[type] = messageHandlersRef.current[type].filter(
        h => h !== handler
      );
    };
  };

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [url]);

  return {
    isConnected,
    sendMessage,
    addMessageHandler,
  };
};
