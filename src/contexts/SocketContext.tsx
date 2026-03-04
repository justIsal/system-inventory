import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the shape of our context
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  unreadNotifications: number;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  unreadNotifications: 0,
  incrementUnreadCount: () => {},
  resetUnreadCount: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // Determine connection based on local token
    const token = localStorage.getItem('accessToken');

    // Only connect if user is authenticated
    if (!token) return;

    // TODO: Ideally use env variables for URL
    let backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    if (backendUrl.endsWith('/api')) {
      backendUrl = backendUrl.slice(0, -4);
    }

    // Initialize standard socket connection with JWT
    const newSocket = io(backendUrl, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      transports: ['websocket'],
    });

    // eslint-disable-next-line
    setSocket(newSocket);

    // Bind basic connection events
    newSocket.on('connect', () => {
      console.log('Socket.IO Connected', newSocket.id);
      setIsConnected(true);

      try {
        // Parse token to get user_id and register for personal notifications room
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split('')
            .map((c) => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(''),
        );
        const decoded = JSON.parse(jsonPayload);

        if (decoded.userId) {
          newSocket.emit('register', decoded.userId);
        }
      } catch (err) {
        console.error('Failed to decode token for socket registration', err);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO Disconnected');
      setIsConnected(false);
    });

    // Cleanup socket on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []); // Reconnect ideally fires on token change, but App Layout re-renders

  const incrementUnreadCount = () => {
    setUnreadNotifications((prev) => prev + 1);
  };

  const resetUnreadCount = () => {
    setUnreadNotifications(0);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        unreadNotifications,
        incrementUnreadCount,
        resetUnreadCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
