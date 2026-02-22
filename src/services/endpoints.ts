export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout'
    },
    USERS: {
        BASE: '/users',
        BY_ID: (id: number | string) => `/users/${id}`
    },
    PRODUCTS: {
        BASE: '/products',
        BY_ID: (id: number | string) => `/products/${id}`
    }
    // Note: Other entities like Stock, Warehouses, PO, SO will follow the same pattern
} as const;
