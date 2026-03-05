import axios from 'axios';
import { API_ROUTES } from './endpoints';

// Fallback to local API if VITE_API_URL is not provided
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
});

// Request interceptor to append Access Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle 401 Unauthorized (Token Expiry)
apiClient.interceptors.response.use(
  (response) => response,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (error: any) => {
    const originalRequest = error.config;

    // Catch 401s
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes(API_ROUTES.AUTH.LOGIN) ||
        originalRequest.url?.includes(API_ROUTES.AUTH.REGISTER)
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue parallel requests that hit 401 while a refresh is already in-flight
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        // Directly call axios (not apiClient) to avoid interceptor loops
        const res = await axios.post(`${API_URL}${API_ROUTES.AUTH.REFRESH}`, {
          refreshToken: refreshToken, // FIXED payload mismatch (was 'token')
        });

        const { accessToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);

        processQueue(null, accessToken);

        // Update specific failed request header
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        // Retry the original request
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // Refresh token invalid or expired, enforce full logout
        const userStr = localStorage.getItem('user');
        let loginPath = '/';
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            loginPath = user.role === 'admin' ? '/admin/login' : '/staff/login';
          } catch (e) {
            console.error(e);
          }
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        window.location.href = loginPath; // Redirect to specific portal
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
