import { useState } from 'react';
import { createFileRoute, redirect, Outlet, Link, useNavigate } from '@tanstack/react-router';
import { isAuthenticated, logout, getUserRole, clearAuth } from '@/utils/auth';
import { toast } from 'sonner';
import { User, Settings, LogOut, ChevronDown, LayoutDashboard, Users, ShieldAlert } from 'lucide-react';
import { Modal } from '@/components/molecules/Modal';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const SIDEBAR_MENU = [
    { name: 'Dashboard Overview', path: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: 'User Management', path: '/admin/users', icon: <Users className="h-4 w-4" /> },
  ];

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
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
          {SIDEBAR_MENU.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              activeProps={{ className: 'active bg-blue-600 font-semibold text-white' }} 
              activeOptions={{ exact: item.path === '/admin' }} 
              className="flex items-center gap-3 px-4 py-2.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center relative z-20">
            <h1 className="text-xl font-semibold text-gray-800">Administrator Console</h1>
            
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none hover:bg-gray-50 p-1 pr-2 rounded-full transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold border border-blue-200 shadow-sm">
                   A
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <div 
                className={`fixed inset-0 z-10 ${isDropdownOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} 
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              <div className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 overflow-hidden transition-all duration-300 origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">Admin User</p>
                      <p className="text-xs text-gray-500 truncate">System Manager</p>
                    </div>
                    
                    <Link 
                      to="/admin/profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    
                    <Link 
                      to="/admin/settings" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </div>
            </div>
        </header>

        <Modal 
          isOpen={isLogoutModalOpen} 
          onClose={() => setIsLogoutModalOpen(false)}
          title="Confirm Logout"
          description="Are you sure you want to end your admin session?"
        >
          <div className="mt-4 flex flex-col items-center justify-center p-4">
             <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
             <p className="text-gray-600 text-center mb-6 text-sm">You will be required to sign in again to access the administrator console.</p>
             <div className="flex gap-3 w-full">
                <button 
                   onClick={() => setIsLogoutModalOpen(false)}
                   className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                   Cancel
                </button>
                <button 
                   onClick={handleLogout}
                   className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                >
                   Yes, Logout
                </button>
             </div>
          </div>
        </Modal>
        
        <div className="flex-1 overflow-y-auto p-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
