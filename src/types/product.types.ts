import type { Supplier } from '../services/api/supplierService';

export interface Category {
  category_id: number;
  name: string;
  description?: string;
}

export interface Warehouse {
  warehouse_id: number;
  name: string;
  location: string;
  is_active: boolean;
}

export interface Stock {
  stock_id: number;
  variant_id: number;
  warehouse_id: number;
  quantity: number;
  warehouse?: Warehouse;
}

export interface StockMovement {
  movement_id: number;
  variant_id: number;
  warehouse_id: number;
  type: 'IN' | 'OUT';
  quantity: number;
  reference?: string;
  created_at: string;
  warehouse?: Warehouse;
  user?: {
      user_id: number;
      username: string;
      role: string;
  };
}

export interface ProductVariant {
  variant_id: number;
  product_id: number;
  sku: string;
  barcode?: string;
  name?: string;
  unit: string;
  weight_gram: number;
  min_stock: number;
  price_buy: number;
  price_sell: number;
  specifications?: any;
  stocks?: Stock[];
  movements?: StockMovement[];
}

export interface Product {
  product_id: number;
  category_id: number;
  default_supplier_id?: number;
  name: string;
  brand?: string;
  description?: string;
  photo_url?: string;
  has_variants: boolean;
  track_expiry: boolean;
  track_sn: boolean;
  is_active: boolean;
  created_at: string;
  
  // Relations
  category?: Category;
  default_supplier?: Supplier;
  variants?: ProductVariant[];
}

export interface CreateProductPayload {
  category_id: number;
  default_supplier_id?: number;
  name: string;
  brand?: string;
  description?: string;
  photo_url?: string;
  has_variants: boolean;
  track_expiry: boolean;
  track_sn: boolean;
  variants: Omit<ProductVariant, 'variant_id' | 'product_id'>[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
