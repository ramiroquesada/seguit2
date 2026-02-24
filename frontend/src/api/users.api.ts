import api from './client';

export interface User {
    id: number;
    username: string;
    fullName: string;
    email: string | null;
    role: 'ROOT' | 'TECHNICIAN';
    active: boolean;
    createdAt: string;
}

export const usersApi = {
    getAll: async () => {
        const response = await api.get('/users');
        return response.data as User[];
    },

    getOne: async (id: number) => {
        const response = await api.get(`/users/${id}`);
        return response.data as User;
    },

    create: async (data: any) => {
        const response = await api.post('/users', data);
        return response.data as User;
    },

    update: async (id: number, data: any) => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data as User;
    },

    remove: async (id: number) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};
