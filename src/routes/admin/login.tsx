import { createFileRoute, redirect } from '@tanstack/react-router';
import { isAuthenticated, getUserRole, clearAuth } from '@/utils/auth';
import { LoginForm } from '@/components/organisms/LoginForm';

export const Route = createFileRoute('/admin/login')({
  beforeLoad: async () => {
    if (isAuthenticated()) {
      const role = getUserRole();
      if (role === 'admin') throw redirect({ to: '/admin' as any });
      if (role === 'staff_gudang') throw redirect({ to: '/staff' as any });
      clearAuth();
    } else {
      clearAuth();
    }
  },
  component: AdminLogin,
});

function AdminLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-xl border-t-4 border-slate-900">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Sign in to access the management dashboard
          </p>
        </div>
        <LoginForm redirectPath="/admin" expectedRole="admin" />
      </div>
    </div>
  );
}
