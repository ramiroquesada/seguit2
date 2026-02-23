import api from './client';

export const locationsApi = {
  getCities: async () => {
    const response = await api.get('/config/cities');
    return response.data as { id: number; name: string }[];
  },

  getSections: async (cityId?: number) => {
    const response = await api.get('/config/sections', { params: { cityId } });
    return response.data as { id: number; name: string; cityId: number }[];
  },

  getOffices: async (sectionId?: number) => {
    const response = await api.get('/config/offices', { params: { sectionId } });
    return response.data as { id: number; name: string; sectionId: number }[];
  },
};
