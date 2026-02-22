export interface User {
    userId: number; // API returns userId, not user_id
    username: string;
    role: 'admin' | 'staff_gudang';
    is_active?: boolean; // make optional since it's not in the login response
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface UserProfileResponse {
    user_id: number;
    username: string;
    role: 'admin' | 'staff_gudang';
    warehouse_id: number | null;
    warehouse: {
        name: string;
        location?: string;
    } | null;
}
