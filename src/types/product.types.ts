import type { Supplier } from '../services/api/supplierService';

export interface Product {
  product_id: number;
  sku: string;
  name: string;
  unit: string | null;
  min_stock: number;
  price_buy: number;
  supplier_id: number;
  supplier?: Supplier;
  stock?: number;
  created_at?: string;
  updated_at?: string;
  category?: string; // Not in backend schema yet, added for UI consistency
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
