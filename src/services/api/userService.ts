import { apiClient } from '../apiClient';
import { API_ROUTES } from '../endpoints';
import type { ApiResponse } from '@/types/apiTypes';
import type { UserProfileResponse } from '@/types/user.types';

export const getMe = async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<ApiResponse<UserProfileResponse>>(API_ROUTES.AUTH.PROFILE);
    return response.data.data;
};

export const updateMe = async (password?: string): Promise<string> => {
    const response = await apiClient.put<ApiResponse<null>>(API_ROUTES.AUTH.PROFILE, { password });
    return response.data.message;
};
