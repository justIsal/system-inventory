import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { login } from '@/services/auth/authService';
import { clearAuth } from '@/utils/auth';
import type { ApiError } from '@/types/apiTypes';
import { toast } from 'sonner';

export const useLogin = (redirectPath: string = '/', expectedRole?: 'admin' | 'staff_gudang') => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (username: string, passwordRaw: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await login(username, passwordRaw);
            
            if (expectedRole && data.user.role !== expectedRole) {
                clearAuth();
                const msg = `Peringatan: Akun ${data.user.role === 'admin' ? 'Admin' : 'Staff'} tidak dapat masuk lewat portal ini!`;
                setError(msg);
                toast.error(msg);
                setIsLoading(false);
                return;
            }

            // Persist tokens across the session
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            toast.success('Login berhasil!');

            // Redirect user dynamically based on authentication
            navigate({ to: redirectPath as any });
            
        } catch (err: any) {
            console.error("Login error details:", err);
            
            // Handle Axios errors safely
            if (err.response) {
                const apiErr = err.response.data as ApiError;
                const msg = apiErr?.message || 'Login gagal, periksa kredensial Anda';
                setError(msg);
                toast.error(msg);
            } else if (err.request) {
                const msg = 'Tidak ada respons dari server (mungkin masalah CORS atau server down)';
                setError(msg);
                toast.error(msg);
            } else {
                const msg = err.message || 'Gagal terhubung ke server';
                setError(msg);
                toast.error(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { handleLogin, isLoading, error };
};
