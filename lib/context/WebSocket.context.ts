import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

const WebSocketContext = createContext<ReturnType<typeof useWebSocket> | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const ws = useWebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/ws');

  return (
    <WebSocketContext.Provider value= { ws } >
    { children }
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
