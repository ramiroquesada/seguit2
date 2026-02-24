import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { User } from '../../api/users.api';

interface UserModalProps {
    user?: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export const UserModal: React.FC<UserModalProps> = ({ user, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: 'TECHNICIAN',
        active: true,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                fullName: user.fullName,
                email: user.email || '',
                password: '',
                role: user.role,
                active: user.active,
            });
        } else {
            setFormData({
                username: '',
                fullName: '',
                email: '',
                password: '',
                role: 'TECHNICIAN',
                active: true,
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = { ...formData };

            // Clean up payload
            if (!payload.password) delete payload.password;
            if (!payload.email) delete payload.email;

            // 'active' is not in CreateUserDto, only in UpdateUserDto
            if (!user) {
                delete payload.active;
            }

            await onSave(payload);
            onClose();
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message;
            alert('Error al guardar usuario: ' + (Array.isArray(msg) ? msg.join(', ') : msg || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>{user ? 'Editar Técnico' : 'Nuevo Técnico'}</h3>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">Nombre Completo</label>
                        <input
                            className="form-control"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Usuario</label>
                        <input
                            className="form-control"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={!!user}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            className="form-control"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{user ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}</label>
                        <input
                            className="form-control"
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required={!user}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Rol</label>
                            <select
                                className="form-control"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as 'ROOT' | 'TECHNICIAN' })}
                            >
                                <option value="TECHNICIAN">Técnico</option>
                                <option value="ROOT">Administrador (ROOT)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estado</label>
                            <select
                                className="form-control"
                                value={formData.active ? 'true' : 'false'}
                                onChange={e => setFormData({ ...formData, active: e.target.value === 'true' })}
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
