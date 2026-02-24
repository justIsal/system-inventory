import { apiClient } from '../apiClient';

export interface Supplier {
  supplier_id: number;
  name: string;
  contact_person?: string | null;
  phone?: string | null;
  address?: string | null;
  email: string;
  npwp?: string | null;
  nok_rek?: string | null;
}

export interface SupplierResponse {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const supplierService = {
  getSuppliers: async (page = 1, limit = 10, search = ''): Promise<SupplierResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    const response = await apiClient.get<SupplierResponse>(`/suppliers?${params}`);
    return response.data;
  },

  getSupplierById: async (id: number): Promise<Supplier> => {
    const response = await apiClient.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (data: Omit<Supplier, 'supplier_id'>): Promise<Supplier> => {
    const response = await apiClient.post<{ message: string; data: Supplier }>('/suppliers', data);
    return response.data.data;
  },

  updateSupplier: async (id: number, data: Partial<Supplier>): Promise<Supplier> => {
    const response = await apiClient.put<{ message: string; data: Supplier }>(`/suppliers/${id}`, data);
    return response.data.data;
  },

  deleteSupplier: async (id: number): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  }
};
