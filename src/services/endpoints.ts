export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/me'
    },
    USERS: {
        BASE: '/users',
        BY_ID: (id: number | string) => `/users/${id}`
    },
    PRODUCTS: {
        BASE: '/products',
        BY_ID: (id: number | string) => `/products/${id}`
    },
    CATEGORIES: {
        BASE: '/categories',
        BY_ID: (id: number | string) => `/categories/${id}`
    },
    SUPPLIERS: {
        BASE: '/suppliers',
        BY_ID: (id: number | string) => `/suppliers/${id}`
    },
    WAREHOUSES: {
        BASE: '/warehouses',
        BY_ID: (id: number | string) => `/warehouses/${id}`
    },
    STOCKS: {
        BASE: '/stocks',
        BY_ID: (id: number | string) => `/stocks/${id}`
    },
    PURCHASE_ORDERS: {
        BASE: '/purchase-orders',
        BY_ID: (id: number | string) => `/purchase-orders/${id}`
    },
    SALES_ORDERS: {
        BASE: '/sales-orders',
        BY_ID: (id: number | string) => `/sales-orders/${id}`
    },
    STOCK_ADJUSTMENTS: {
        BASE: '/stock-adjustments',
        BY_ID: (id: number | string) => `/stock-adjustments/${id}`
    },
    STOCK_MOVEMENTS: {
        BASE: '/stock-movements',
        BY_ID: (id: number | string) => `/stock-movements/${id}`
    }
} as const;
