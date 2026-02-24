import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { EquipmentModel } from '../../api/equipment-models.api';

interface EquipmentModelModalProps {
    model?: EquipmentModel | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export const EquipmentModelModal: React.FC<EquipmentModelModalProps> = ({ model, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'PC',
        brand: '',
        modelName: '',
        specs: [] as { key: string; value: string }[],
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (model) {
            const specs = Object.entries(model.specs || {}).map(([key, value]) => ({ key, value: String(value) }));
            setFormData({
                name: model.name,
                type: model.type,
                brand: model.brand,
                modelName: model.modelName,
                specs,
            });
        } else {
            setFormData({
                name: '',
                type: 'PC',
                brand: '',
                modelName: '',
                specs: [],
            });
        }
    }, [model, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const specsObj = formData.specs.reduce((acc, curr) => {
                if (curr.key.trim()) acc[curr.key.trim()] = curr.value;
                return acc;
            }, {} as any);

            await onSave({
                ...formData,
                specs: specsObj,
            });
            onClose();
        } catch (err: any) {
            console.error(err);
            alert('Error al guardar modelo: ' + (err.response?.data?.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const addSpec = () => setFormData({ ...formData, specs: [...formData.specs, { key: '', value: '' }] });
    const removeSpec = (index: number) => setFormData({ ...formData, specs: formData.specs.filter((_, i) => i !== index) });
    const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
        const newSpecs = [...formData.specs];
        newSpecs[index][field] = val;
        setFormData({ ...formData, specs: newSpecs });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3>{model ? 'Editar Modelo' : 'Nuevo Modelo'}</h3>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">Nombre de la Plantilla (Ej: Impresora Administrativa)</label>
                        <input
                            className="form-control"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Tipo</label>
                            <select
                                className="form-control"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="PC">PC</option>
                                <option value="LAPTOP">Laptop</option>
                                <option value="PRINTER">Impresora</option>
                                <option value="MONITOR">Monitor</option>
                                <option value="MODEM">Modem</option>
                                <option value="ROUTER">Router</option>
                                <option value="ANTENNA">Antena</option>
                                <option value="OTHERS">Otros</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Marca</label>
                            <input
                                className="form-control"
                                value={formData.brand}
                                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Modelo del Fabricante</label>
                        <input
                            className="form-control"
                            value={formData.modelName}
                            onChange={e => setFormData({ ...formData, modelName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Especificaciones Técnicas</label>
                            <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={addSpec}>
                                <Plus size={14} /> Agregar
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {formData.specs.map((spec, index) => (
                                <div key={index} style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        placeholder="Clave (ej: RAM)"
                                        className="form-control"
                                        value={spec.key}
                                        onChange={e => updateSpec(index, 'key', e.target.value)}
                                    />
                                    <input
                                        placeholder="Valor (ej: 16GB)"
                                        className="form-control"
                                        value={spec.value}
                                        onChange={e => updateSpec(index, 'value', e.target.value)}
                                    />
                                    <button type="button" className="btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => removeSpec(index)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Modelo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
