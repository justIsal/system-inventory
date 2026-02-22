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
