import React, { useState } from 'react';
import { X, Combine } from 'lucide-react';

interface MergeOfficesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMerge: (targetId: number, sourceIds: number[]) => Promise<void>;
    offices: { id: number; name: string }[];
}

export const MergeOfficesModal: React.FC<MergeOfficesModalProps> = ({ isOpen, onClose, onMerge, offices }) => {
    const [targetId, setTargetId] = useState<number | null>(null);
    const [sourceIds, setSourceIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetId || sourceIds.length === 0) return;

        if (!window.confirm(`¿Estás seguro de que deseas fusionar ${sourceIds.length} oficinas en "${offices.find(o => o.id === targetId)?.name}"? Todos los equipos e historial se moverán y las oficinas origen se eliminarán.`)) {
            return;
        }

        setLoading(true);
        try {
            await onMerge(targetId, sourceIds);
            setTargetId(null);
            setSourceIds([]);
            onClose();
        } catch (err: any) {
            console.error(err);
            alert('Error al fusionar: ' + (err.response?.data?.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const toggleSource = (id: number) => {
        if (sourceIds.includes(id)) {
            setSourceIds(sourceIds.filter(sid => sid !== id));
        } else {
            setSourceIds([...sourceIds, id]);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Combine size={20} className="text-primary" />
                        <h3>Fusionar Oficinas</h3>
                    </div>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                        Selecciona la oficina de <strong>destino</strong> (la que quedará) y las oficinas de <strong>origen</strong> que se fusionarán en ella.
                    </p>

                    <div className="form-group">
                        <label className="form-label">Oficina de Destino (Principal)</label>
                        <select
                            className="form-control"
                            value={targetId || ''}
                            onChange={e => {
                                const id = Number(e.target.value);
                                setTargetId(id);
                                setSourceIds(sourceIds.filter(sid => sid !== id));
                            }}
                            required
                        >
                            <option value="" disabled>Selecciona la oficina que quedará</option>
                            {offices.map(o => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Oficinas a Fusionar (Se eliminarán)</label>
                        <div style={{ border: '1px solid var(--color-border)', borderRadius: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                            {offices.filter(o => o.id !== targetId).length === 0 ? (
                                <div style={{ padding: '12px', fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                                    No hay otras oficinas para fusionar.
                                </div>
                            ) : offices.filter(o => o.id !== targetId).map(o => (
                                <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}>
                                    <input
                                        type="checkbox"
                                        checked={sourceIds.includes(o.id)}
                                        onChange={() => toggleSource(o.id)}
                                    />
                                    <span style={{ fontSize: '14px' }}>{o.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !targetId || sourceIds.length === 0}
                        >
                            {loading ? 'Fusionando...' : 'Fusionar Oficinas'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
