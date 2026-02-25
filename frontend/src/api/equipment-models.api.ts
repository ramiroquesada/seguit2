import api from './client';

export interface EquipmentModel {
    id: number;
    name: string;
    categoryId: number;
    category?: { id: number; name: string };
    brand: string;
    modelName: string;
    specs: Record<string, any>;
}

export const equipmentModelsApi = {
    getAll: async () => {
        const response = await api.get('/equipment-models');
        return response.data as EquipmentModel[];
    },
    getOne: async (id: number) => {
        const response = await api.get(`/equipment-models/${id}`);
        return response.data as EquipmentModel;
    },
    create: async (data: any) => {
        const response = await api.post('/equipment-models', data);
        return response.data as EquipmentModel;
    },
    update: async (id: number, data: any) => {
        const response = await api.patch(`/equipment-models/${id}`, data);
        return response.data as EquipmentModel;
    },
    remove: async (id: number) => {
        const response = await api.delete(`/equipment-models/${id}`);
        return response.data;
    },
};
