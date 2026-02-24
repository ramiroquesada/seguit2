import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface LocationModalProps {
    title: string;
    initialName?: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
}

export const LocationModal: React.FC<LocationModalProps> = ({ title, initialName = '', isOpen, onClose, onSave }) => {
    const [name, setName] = useState(initialName);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) setName(initialName);
    }, [isOpen, initialName]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        try {
            await onSave(name.trim());
            onClose();
        } catch (err: any) {
            console.error(err);
            alert('Error: ' + (err.response?.data?.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">Nombre</label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
