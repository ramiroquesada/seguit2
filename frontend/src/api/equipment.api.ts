import api from './client';

export const equipmentApi = {
  getStats: async (limit: number = 25) => {
    const response = await api.get('/equipment/stats', { params: { limit } });
    return response.data as {
      total: number;
      byStatus: Record<string, number>;
      byType: Record<string, number>;
      newest: any[];
    };
  },

  getAll: async (params: any) => {
    // Filter out empty values to avoid backend validation errors (e.g. empty strings for enums)
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    const response = await api.get('/equipment', { params: cleanedParams });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/equipment', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/equipment/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/equipment/${id}`);
    return response.data;
  },

  getNextId: async () => {
    const response = await api.get('/equipment/next-id');
    return response.data;
  },
};
