import { createFileRoute, redirect, Outlet, Link, useNavigate } from '@tanstack/react-router';
import { isAuthenticated, logout, getUserRole, clearAuth } from '@/utils/auth';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/_layout')({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      clearAuth();
      throw redirect({ to: '/admin/login' });
    }
    const role = getUserRole();
    if (role === 'staff_gudang') {
      throw redirect({ to: '/staff' as any });
    } else if (role !== 'admin') {
      clearAuth();
      throw redirect({ to: '/admin/login' });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Berhasil logout dari Admin Portal');
    navigate({ to: '/admin/login' as any });
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold tracking-wider text-blue-400">ADMIN</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase">Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" activeProps={{ className: 'active bg-blue-600 font-semibold' }} activeOptions={{ exact: true }} className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
            Dashboard Overview
          </Link>
          <Link to="/admin/users" activeProps={{ className: 'active bg-blue-600 font-semibold' }} className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
            User Management
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Administrator Console</h1>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
               A
            </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
