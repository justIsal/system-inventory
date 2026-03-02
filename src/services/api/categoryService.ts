import { apiClient } from '../apiClient';

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export const categoryService = {
    getAllCategories: async (): Promise<Category[]> => {
        const response = await apiClient.get('/categories');
        return response.data.data;
    }
};
