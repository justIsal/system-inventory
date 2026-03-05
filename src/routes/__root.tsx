import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';

export const Route = createRootRoute({
  component: () => (
    <>
      {/* Root Layout - Wraps every page */}
      <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
        <Outlet />
      </div>
      <Toaster position="top-center" richColors />
    </>
  ),
});
