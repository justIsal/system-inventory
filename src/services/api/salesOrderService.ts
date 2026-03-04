import { apiClient } from '@/services/apiClient';
import { API_ROUTES } from '@/services/endpoints';
import type {
  SalesOrder,
  CreateSalesOrderPayload,
  UpdateSalesOrderStatusPayload,
} from '@/types/sales-order.types';

export const salesOrderService = {
  createSalesOrder: async (data: CreateSalesOrderPayload): Promise<SalesOrder> => {
    const response = await apiClient.post<{ data: SalesOrder }>(API_ROUTES.SALES_ORDERS.BASE, data);
    return response.data.data;
  },

  getSalesOrders: async (): Promise<SalesOrder[]> => {
    const response = await apiClient.get<{ data: SalesOrder[] }>(API_ROUTES.SALES_ORDERS.BASE);
    return response.data.data;
  },

  getSalesOrderById: async (id: number | string): Promise<SalesOrder> => {
    const response = await apiClient.get<{ data: SalesOrder }>(API_ROUTES.SALES_ORDERS.BY_ID(id));
    return response.data.data;
  },

  updateOrderStatus: async (
    id: number | string,
    data: UpdateSalesOrderStatusPayload,
  ): Promise<SalesOrder> => {
    const response = await apiClient.put<{ data: SalesOrder }>(
      `${API_ROUTES.SALES_ORDERS.BY_ID(id)}/status`,
      data,
    );
    return response.data.data;
  },

  updateSalesOrder: async (
    id: number | string,
    data: Omit<CreateSalesOrderPayload, 'admin_id'>,
  ): Promise<SalesOrder> => {
    const response = await apiClient.put<{ data: SalesOrder }>(
      API_ROUTES.SALES_ORDERS.BY_ID(id),
      data,
    );
    return response.data.data;
  },

  deleteSalesOrder: async (id: number | string): Promise<void> => {
    await apiClient.delete(API_ROUTES.SALES_ORDERS.BY_ID(id));
  },
};
