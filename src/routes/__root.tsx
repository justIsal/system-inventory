import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';

export const Route = createRootRoute({
  component: () => (
    <>
      {/* Root Layout - Wraps every page */}
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Outlet />
      </div>
      <Toaster position="top-center" richColors />
    </>
  ),
});
