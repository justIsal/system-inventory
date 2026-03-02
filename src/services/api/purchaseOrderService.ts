import { apiClient } from '@/services/apiClient';
import { API_ROUTES } from '@/services/endpoints';
import type {
    PurchaseOrder,
    CreatePurchaseOrderPayload,
    UpdatePurchaseOrderStatusPayload,
} from '@/types/purchase-order.types';

export const purchaseOrderService = {
  createPurchaseOrder: async (data: CreatePurchaseOrderPayload): Promise<PurchaseOrder> => {
    const response = await apiClient.post<{ data: PurchaseOrder }>(
      API_ROUTES.PURCHASE_ORDERS.BASE,
      data
    );
    return response.data.data;
  },

  getPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get<{ data: PurchaseOrder[] }>(
      API_ROUTES.PURCHASE_ORDERS.BASE
    );
    return response.data.data;
  },

  getPurchaseOrderById: async (id: number | string): Promise<PurchaseOrder> => {
    const response = await apiClient.get<{ data: PurchaseOrder }>(
      API_ROUTES.PURCHASE_ORDERS.BY_ID(id)
    );
    return response.data.data;
  },

  updateOrderStatus: async (id: number | string, data: UpdatePurchaseOrderStatusPayload): Promise<PurchaseOrder> => {
    const response = await apiClient.put<{ data: PurchaseOrder }>(
      `${API_ROUTES.PURCHASE_ORDERS.BY_ID(id)}/status`,
      data
    );
    return response.data.data;
  },

  deletePurchaseOrder: async (id: number | string): Promise<void> => {
    await apiClient.delete(API_ROUTES.PURCHASE_ORDERS.BY_ID(id));
  },
};
