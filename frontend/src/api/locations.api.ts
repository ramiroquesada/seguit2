import api from './client';

export const locationsApi = {
  // Cities
  getCities: async () => {
    const response = await api.get('/config/cities');
    return response.data as { id: number; name: string }[];
  },
  createCity: async (name: string) => {
    const response = await api.post('/config/cities', { name });
    return response.data;
  },
  updateCity: async (id: number, name: string) => {
    const response = await api.patch(`/config/cities/${id}`, { name });
    return response.data;
  },
  deleteCity: async (id: number) => {
    const response = await api.delete(`/config/cities/${id}`);
    return response.data;
  },

  // Sections
  getSections: async (cityId?: number) => {
    const response = await api.get('/config/sections', { params: { cityId } });
    return response.data as { id: number; name: string; cityId: number }[];
  },
  createSection: async (cityId: number, name: string) => {
    const response = await api.post('/config/sections', { cityId, name });
    return response.data;
  },
  updateSection: async (id: number, name?: string, cityId?: number) => {
    const response = await api.patch(`/config/sections/${id}`, { name, cityId });
    return response.data;
  },
  deleteSection: async (id: number) => {
    const response = await api.delete(`/config/sections/${id}`);
    return response.data;
  },

  // Offices
  getOffices: async (sectionId?: number) => {
    const response = await api.get('/config/offices', { params: { sectionId } });
    return response.data as { id: number; name: string; sectionId: number }[];
  },
  createOffice: async (sectionId: number, name: string) => {
    const response = await api.post('/config/offices', { sectionId, name });
    return response.data;
  },
  updateOffice: async (id: number, name?: string, sectionId?: number) => {
    const response = await api.patch(`/config/offices/${id}`, { name, sectionId });
    return response.data;
  },
  deleteOffice: async (id: number) => {
    const response = await api.delete(`/config/offices/${id}`);
    return response.data;
  },
  mergeOffices: async (targetId: number, sourceIds: number[]) => {
    const response = await api.post('/config/offices/merge', { targetId, sourceIds });
    return response.data;
  },
};
