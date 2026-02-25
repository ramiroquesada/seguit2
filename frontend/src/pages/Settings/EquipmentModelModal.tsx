import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Plus, Trash2 } from 'lucide-react';
import { categoriesApi } from '../../api/categories.api';
import type { EquipmentModel } from '../../api/equipment-models.api';

interface Props {
    isOpen: boolean;
    model?: EquipmentModel | null;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export const EquipmentModelModal: React.FC<Props> = ({ isOpen, model, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [brand, setBrand] = useState('');
    const [modelName, setModelName] = useState('');
    const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
        enabled: isOpen,
    });

    useEffect(() => {
        if (model) {
            setName(model.name);
            setCategoryId(model.categoryId);
            setBrand(model.brand);
            setModelName(model.modelName);
            setSpecs(Object.entries(model.specs || {}).map(([key, value]) => ({ key, value: String(value) })));
        } else {
            setName('');
            setCategoryId('');
            setBrand('');
            setModelName('');
            setSpecs([]);
        }
    }, [model, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !categoryId || !brand || !modelName) return;

        setLoading(true);
        try {
            const specsObj = Object.fromEntries(
                specs.filter(s => s.key.trim()).map(s => [s.key.trim(), s.value])
            );

            await onSave({
                name,
                categoryId: +categoryId,
                brand,
                modelName,
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

    const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
    const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
    const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = val;
        setSpecs(newSpecs);
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
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Categoría</label>
                            <select
                                className="form-control"
                                value={categoryId}
                                onChange={e => setCategoryId(+e.target.value)}
                                required
                            >
                                <option value="">Seleccionar categoría...</option>
                                {categories.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Marca</label>
                            <input
                                className="form-control"
                                value={brand}
                                onChange={e => setBrand(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Modelo del Fabricante</label>
                        <input
                            className="form-control"
                            value={modelName}
                            onChange={e => setModelName(e.target.value)}
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
                            {specs.map((spec, index) => (
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
