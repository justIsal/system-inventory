import { createFileRoute, redirect, Outlet, Link, useNavigate } from '@tanstack/react-router';
import { isAuthenticated, logout, getUserRole, clearAuth } from '@/utils/auth';
import { toast } from 'sonner';

export const Route = createFileRoute('/staff/_layout')({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      clearAuth();
      throw redirect({ to: '/staff/login' as any });
    }
    const role = getUserRole();
    if (role === 'admin') {
      throw redirect({ to: '/admin' as any });
    } else if (role !== 'staff_gudang') {
      clearAuth();
      throw redirect({ to: '/staff/login' as any });
    }
  },
  component: StaffLayout,
});

function StaffLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Berhasil logout dari Staff Portal');
    navigate({ to: '/staff/login' as any });
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <aside className="w-64 bg-green-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-green-800">
          <h2 className="text-xl font-bold tracking-wider text-green-300">WAREHOUSE</h2>
          <p className="text-xs text-green-200 mt-1 uppercase">Operations</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/staff" activeProps={{ className: 'active bg-green-700 font-semibold' }} activeOptions={{ exact: true }} className="block px-4 py-2 rounded-md hover:bg-green-800 transition-colors">
            My Dashboard
          </Link>
          <Link to="/staff/stock" activeProps={{ className: 'active bg-green-700 font-semibold' }} className="block px-4 py-2 rounded-md hover:bg-green-800 transition-colors">
            Stock Operations
          </Link>
        </nav>
        <div className="p-4 border-t border-green-800">
          <button 
            onClick={handleLogout}
            className="w-full bg-green-800 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Staff Dashboard</h1>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold">
               S
            </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
