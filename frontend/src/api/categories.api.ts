import axios from './client';

export interface Category {
    id: number;
    name: string;
    createdAt: string;
    _count?: {
        equipment: number;
        equipmentModels: number;
    };
}

export const categoriesApi = {
    getAll: async () => {
        const { data } = await axios.get<Category[]>('/categories');
        return data;
    },
    create: async (name: string) => {
        const { data } = await axios.post<Category>('/categories', { name });
        return data;
    },
    update: async (id: number, name: string) => {
        const { data } = await axios.patch<Category>(`/categories/${id}`, { name });
        return data;
    },
    delete: async (id: number) => {
        await axios.delete(`/categories/${id}`);
    }
};
