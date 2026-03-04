import type { ProductVariant } from '@/types/product.types';

export interface SOItem {
  so_item_id: number;
  so_id: number;
  variant_id: number;
  qty_requested: number;
  qty_shipped: number;
  variant?: ProductVariant;
}

export interface SalesOrder {
  so_id: number;
  customer_name: string | null;
  customer_contact: string | null;
  shipping_address: string | null;
  admin_id: number;
  status: 'DRAFT' | 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  notes: string | null;
  created_at: string;
  warehouse_id?: number | null;
  warehouse?: { name: string };
  admin?: { username: string; role?: string };
  items: SOItem[];
}

export interface CreateSalesOrderPayload {
  customer_name?: string;
  customer_contact?: string;
  shipping_address?: string;
  admin_id: number;
  warehouse_id?: number | null;
  status?: string;
  notes?: string;
  items: {
    variant_id: number;
    qty_requested: number;
  }[];
}

export interface UpdateSalesOrderStatusPayload {
  status: 'DRAFT' | 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}
