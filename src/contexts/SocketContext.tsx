import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Define the shape of our context
interface SocketContextType {
  isConnected: boolean;
  unreadNotifications: number;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  unreadNotifications: 0,
  incrementUnreadCount: () => {},
  resetUnreadCount: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // Determine connection based on local token
    const token = localStorage.getItem('accessToken');

    // Only connect if user is authenticated
    if (!token) return;

    let userId: number | null = null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      const decoded = JSON.parse(jsonPayload);
      if (decoded.userId) {
        userId = decoded.userId;
      }
    } catch (err) {
      console.error('Failed to decode token for Supabase RLS Registration', err);
      return;
    }

    if (!userId) return;

    // Inject Express Custom JWT into Supabase Session so we can bypass Anon constraints
    supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    });

    const newChannel = supabase
      .channel(`user-${userId}-notifications`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('Realtime Notification Received via Supabase RLS:', payload);
          // 1. Convert PostgreSQL Payload to match expected app model
          const notif = payload.new;
          // 2. Dispatch a Custom DOM Event to cross-communicate with Toast Notification UI
          const event = new CustomEvent('supabase-notification', { detail: notif });
          window.dispatchEvent(event);
          // 3. Increment our simple Context Bell visually
          setUnreadNotifications((prev) => prev + 1);
        },
      )
      .on('broadcast', { event: 'supabase-notification' }, (payload) => {
        console.log('📡 RAW BROADCAST RECEIVED:', payload);
        const notif = payload.payload;
        const event = new CustomEvent('supabase-notification', { detail: notif });
        window.dispatchEvent(event);
        setUnreadNotifications((prev) => prev + 1);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('Supabase Realtime Channel Connected for User:', userId);
        }
      });

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
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
