import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { SocketProvider } from '../contexts/SocketContext';

export const Route = createRootRoute({
  component: () => (
    <>
      {/* Root Layout - Wraps every page */}
      <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
        <SocketProvider>
          <Outlet />
        </SocketProvider>
      </div>
      <Toaster position="top-center" richColors />
    </>
  ),
});
