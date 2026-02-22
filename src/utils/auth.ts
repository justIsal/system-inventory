import { jwtDecode } from 'jwt-decode';
import { logoutApi } from '@/services/auth/authService';

export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    try {
        jwtDecode(token);
        return true;
    } catch {
        return false;
    }
};

export const getUserRole = (): 'admin' | 'staff_gudang' | null => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
        const decoded: any = jwtDecode(token);
        return decoded.role || null;
    } catch {
        return null;
    }
};

export const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};

export const logout = async () => {
    await logoutApi();
    clearAuth();
};
