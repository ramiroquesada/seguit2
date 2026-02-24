import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Edit2, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { usersApi } from '../../api/users.api';
import type { User } from '../../api/users.api';
import { DataTable } from '../../components/DataTable/DataTable';
import type { Column } from '../../components/DataTable/DataTable';
import { UserModal } from './UserModal';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (selectedUser) return usersApi.update(selectedUser.id, data);
      return usersApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'fullName',
      label: 'Nombre completo',
      sortable: true,
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light)', color: 'white',
            display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 600
          }}>
            {u.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{u.fullName}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{u.username}</div>
          </div>
        </div>
      )
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Rol',
      render: (u) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {u.role === 'ROOT' ? <Shield size={14} color="var(--color-primary)" /> : <UserIcon size={14} />}
          {u.role === 'ROOT' ? 'Administrador' : 'Técnico'}
        </span>
      )
    },
    {
      key: 'active',
      label: 'Estado',
      render: (u) => (
        <span className="badge" style={{
          backgroundColor: u.active ? 'var(--status-active-bg)' : 'var(--status-inactive-bg)',
          color: u.active ? 'var(--status-active-text)' : 'var(--status-inactive-text)'
        }}>
          {u.active ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (u) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          <button className="btn-icon" title="Editar" onClick={() => handleEdit(u)}><Edit2 size={16} /></button>
          <button className="btn-icon" title="Eliminar" onClick={() => handleDelete(u.id)}><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Usuarios y Técnicos</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Administración de personal con acceso al sistema.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <UserPlus size={18} />
          <span>Nuevo Técnico</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        keyExtractor={(u) => u.id}
      />

      <UserModal
        isOpen={isModalOpen}
        user={selectedUser}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => { await saveMutation.mutateAsync(data); }}
      />
    </div>
  );
};
