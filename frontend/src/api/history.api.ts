import api from './client';

export const historyApi = {
  getByEquipment: async (equipmentId: number) => {
    const response = await api.get(`/equipment/${equipmentId}/history`);
    return response.data;
  },

  create: async (equipmentId: number, data: { action: string; description: string; fromOfficeId?: number; toOfficeId?: number; date?: string }) => {
    const response = await api.post(`/equipment/${equipmentId}/history`, data);
    return response.data;
  },
};
