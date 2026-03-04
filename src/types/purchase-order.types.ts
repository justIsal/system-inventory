import type { User } from './user.types';
import type { Supplier } from '../services/api/supplierService';
import type { ProductVariant } from './product.types';

export type POStatus = 'DRAFT' | 'OPEN' | 'PARTIAL' | 'RECEIVED' | 'NEEDS_APPROVAL' | 'CANCELLED';

export interface POItem {
  po_item_id: number;
  po_id: number;
  variant_id: number;
  qty_ordered: number;
  qty_received: number;
  notes?: string;
  variant?: ProductVariant;
}

export interface PurchaseOrder {
  po_id: number;
  supplier_id: number;
  admin_id: number;
  status: POStatus;
  created_at: string;
  warehouse_id?: number;
  supplier?: Supplier;
  admin?: Partial<User>;
  warehouse?: { name: string; location?: string };
  items?: POItem[];
  notes?: string;
}

export interface CreatePurchaseOrderPayload {
  supplier_id: number;
  admin_id: number;
  warehouse_id?: number;
  status: POStatus;
  notes?: string;
  items: {
    variant_id: number;
    qty_ordered: number;
    notes?: string;
  }[];
}

export interface UpdatePurchaseOrderStatusPayload {
  status: POStatus;
}
