import type { PurchaseOrder } from '@/types/purchase-order.types';
import { apiClient } from '../apiClient';

export interface ReceivePOPayload {
  warehouse_id: number;
  items: { po_item_id: number; qty_received: number }[];
}

export interface ResolvePOPayload {
  resolution: 'ACCEPT_DISCREPANCY';
  warehouse_id?: number;
}

export interface CreatePOPayload {
  supplier_id: number;
  admin_id: number;
  warehouse_id?: number;
  status: string;
  notes?: string;
  items: {
    variant_id: number;
    qty_ordered: number;
    notes?: string;
  }[];
}

export const purchaseOrderService = {
  createPurchaseOrder: async (data: CreatePOPayload): Promise<PurchaseOrder> => {
    const response = await apiClient.post('/purchase-orders', data);
    return response.data.data;
  },

  getAllPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get('/purchase-orders');
    return response.data.data;
  },

  getPurchaseOrdersByWarehouse: async (warehouseId: number): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get(`/purchase-orders/warehouse/${warehouseId}`);
    return response.data.data;
  },

  getPurchaseOrderById: async (id: number): Promise<PurchaseOrder> => {
    const response = await apiClient.get(`/purchase-orders/${id}`);
    return response.data.data;
  },

  updatePurchaseOrderStatus: async (id: number, status: string): Promise<PurchaseOrder> => {
    const response = await apiClient.put(`/purchase-orders/${id}/status`, { status });
    return response.data.data;
  },

  updatePurchaseOrder: async (
    id: number,
    data: Partial<CreatePOPayload>,
  ): Promise<PurchaseOrder> => {
    const response = await apiClient.put(`/purchase-orders/${id}`, data);
    return response.data.data;
  },

  deletePurchaseOrder: async (id: number): Promise<void> => {
    await apiClient.delete(`/purchase-orders/${id}`);
  },

  // NEW WORKFLOWS
  receivePurchaseOrder: async (id: number, data: ReceivePOPayload): Promise<PurchaseOrder> => {
    const response = await apiClient.post(`/purchase-orders/${id}/receive`, data);
    return response.data;
  },

  resolvePurchaseOrderDiscrepancy: async (
    id: number,
    data: ResolvePOPayload,
  ): Promise<PurchaseOrder> => {
    const response = await apiClient.post(`/purchase-orders/${id}/resolve`, data);
    return response.data;
  },
};
