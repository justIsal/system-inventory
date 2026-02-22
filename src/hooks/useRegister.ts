import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { register } from '@/services/auth/authService';
import type { ApiError } from '@/types/apiTypes';
import { toast } from 'sonner';

export const useRegister = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRegister = async (username: string, passwordRaw: string, warehouse_id: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await register(username, passwordRaw, warehouse_id);
            
            toast.success('Registrasi berhasil! Silakan login.');
            
            // Show success logic or direct to login immediately
            navigate({ to: '/staff/login' as any });
        } catch (err: any) {
             console.error("Register error details:", err);
            
             // Handle Axios errors safely
             if (err.response) {
                 const apiErr = err.response.data as ApiError;
                 const msg = apiErr?.message || 'Registrasi gagal';
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

    return { handleRegister, isLoading, error };
};
