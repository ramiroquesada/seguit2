import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '../../api/locations.api';

interface LocationModalProps {
    title: string;
    type: 'city' | 'section' | 'office';
    mode: 'create' | 'edit';
    initialName?: string;
    initialParentId?: number; // cityId for section, sectionId for office
    initialCityId?: number;    // cityId for office (computed in SettingsPage)
    cityList?: { id: number; name: string }[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, parentId?: number) => Promise<void>;
}

export const LocationModal: React.FC<LocationModalProps> = ({
    title, type, mode: _, initialName = '', initialParentId, initialCityId, cityList = [], isOpen, onClose, onSave
}) => {
    const [name, setName] = useState(initialName);
    const [tempCityId, setTempCityId] = useState<number | undefined>(type === 'section' ? initialParentId : initialCityId);
    const [parentId, setParentId] = useState<number | undefined>(initialParentId);
    const [loading, setLoading] = useState(false);

    // For offices, fetch sections of the selected city
    const { data: sectionList = [], isLoading: loadingSections } = useQuery({
        queryKey: ['sections', tempCityId],
        queryFn: () => locationsApi.getSections(tempCityId!),
        enabled: isOpen && type === 'office' && !!tempCityId
    });

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            const cid = type === 'section' ? initialParentId : initialCityId;
            setTempCityId(cid);
            setParentId(initialParentId);
        }
    }, [isOpen, initialName, initialParentId, initialCityId, type]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        // Final parentId depends on type
        const finalParentId = type === 'section' ? tempCityId : parentId;
        if (type !== 'city' && !finalParentId) return;

        setLoading(true);
        try {
            await onSave(name.trim(), finalParentId);
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

                    {(type === 'section' || type === 'office') && (
                        <div className="form-group">
                            <label className="form-label">Ciudad</label>
                            <select
                                className="form-control"
                                value={tempCityId || ''}
                                onChange={e => {
                                    setTempCityId(Number(e.target.value));
                                    setParentId(undefined); // Reset section when city changes
                                }}
                                required
                            >
                                <option value="" disabled>Seleccionar ciudad</option>
                                {cityList.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {type === 'office' && (
                        <div className="form-group">
                            <label className="form-label">Sección</label>
                            <select
                                className="form-control"
                                value={parentId || ''}
                                onChange={e => setParentId(Number(e.target.value))}
                                disabled={!tempCityId || loadingSections}
                                required
                            >
                                <option value="" disabled>
                                    {loadingSections ? 'Cargando...' : 'Seleccionar sección'}
                                </option>
                                {sectionList.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={loading || !name.trim() || (type !== 'city' && (type === 'section' ? !tempCityId : !parentId))}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
