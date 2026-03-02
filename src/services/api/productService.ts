import { apiClient } from '../apiClient';
import { API_ROUTES } from '../endpoints';
import type { Product, PaginatedResponse, CreateProductPayload } from '@/types/product.types';

export const productService = {
  getProducts: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    // The backend GET /products now natively handles these params
    const response = await apiClient.get<PaginatedResponse<Product>>(
      `${API_ROUTES.PRODUCTS.BASE}?${params.toString()}`,
    );

    return response.data;
  },

  getProductById: async (id: string | number): Promise<Product> => {
    const response = await apiClient.get<{ data: Product }>(`${API_ROUTES.PRODUCTS.BASE}/${id}`);
    return response.data.data;
  },

  createProduct: async (data: CreateProductPayload | unknown): Promise<Product> => {
    const response = await apiClient.post<{ message: string; data: Product }>(
      API_ROUTES.PRODUCTS.BASE,
      data,
    );
    return response.data.data;
  },

  deleteProducts: async (ids: number[]): Promise<void> => {
    // Current backend only supports single deletion, so we run them concurrently
    await Promise.all(ids.map((id) => apiClient.delete(`${API_ROUTES.PRODUCTS.BASE}/${id}`)));
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ROUTES.PRODUCTS.BASE}/${id}`);
  },

  updateProduct: async (id: string, data: unknown): Promise<Product> => {
    const response = await apiClient.put<{ message: string; data: Product }>(
      `${API_ROUTES.PRODUCTS.BASE}/${id}`,
      data,
    );
    return response.data.data;
  },
};
