import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { isAuthenticated, getUserRole, clearAuth } from '@/utils/auth';
import { RegisterForm } from '@/components/organisms/RegisterForm';

export const Route = createFileRoute('/staff/register')({
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
  component: StaffRegister,
});

function StaffRegister() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-lg border-t-4 border-green-500">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
            Staff Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a new warehouse staff account
          </p>
        </div>
        
        <RegisterForm />
        
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/staff/login" className="font-semibold text-green-600 hover:text-green-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
