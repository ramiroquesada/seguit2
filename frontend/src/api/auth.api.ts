import api from './client';

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data as { access_token: string; user: any };
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
