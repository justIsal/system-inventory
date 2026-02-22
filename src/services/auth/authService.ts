import { apiClient } from '../apiClient';
import { API_ROUTES } from '../endpoints';
import type { LoginResponse } from '@/types/user.types';
import type { ApiResponse } from '@/types/apiTypes';

export const login = async (username: string, passwordRaw: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(API_ROUTES.AUTH.LOGIN, {
        username,
        password: passwordRaw // Sending 'password' as dictated by your tested API schema
    });
    return response.data.data;
};

export const register = async (username: string, passwordRaw: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(API_ROUTES.AUTH.REGISTER, {
        username,
        password: passwordRaw,
        role: 'staff_gudang'
    });
    return response.data.data;
};

export const logoutApi = async (): Promise<void> => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        await apiClient.post(API_ROUTES.AUTH.LOGOUT, { refreshToken });
    } catch (e) {
        console.error("Failed to call logout API", e);
    }
};
