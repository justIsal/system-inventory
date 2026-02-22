import { Link } from '@tanstack/react-router';
import { AlertCircle } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 text-center font-sans">
      <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-gray-100 bg-white p-12 shadow-xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">404</h1>
        <h2 className="text-xl font-semibold text-gray-700">Page Not Found</h2>
        <p className="max-w-xs text-sm text-gray-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="pt-6">
          <Link 
            to="/" 
            className="rounded-md bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            Go back safely
          </Link>
        </div>
      </div>
    </div>
  );
}
