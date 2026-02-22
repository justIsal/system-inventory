import { apiClient } from '../apiClient';
import type { ApiResponse } from '@/types/apiTypes';
import type { WarehousePublicResponse } from '@/types/warehouse.types';

export const getPublicWarehouses = async (): Promise<WarehousePublicResponse[]> => {
    // Calling the newly created public backend warehouse list
    const response = await apiClient.get<ApiResponse<WarehousePublicResponse[]>>('/warehouses/list');
    return response.data.data;
};
