import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { equipmentApi } from '../../api/equipment.api';

export const EquipmentFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: '', type: 'PC', brand: '', model: '', serial: '', status: 'ACTIVE', notes: ''
  });

  useEffect(() => {
    if (isEditing) {
      // Load current eq
      equipmentApi.getOne(Number(id)).then((eq: any) => {
        setFormData({
          code: eq.code, type: eq.type, brand: eq.brand || '', model: eq.model || '',
          serial: eq.serial || '', status: eq.status, notes: eq.notes || ''
        });
      });
    } else {
      equipmentApi.getNextCode().then((res: any) => setFormData(f => ({ ...f, code: res.nextCode })));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, code: Number(formData.code) };
      if (isEditing) {
        await equipmentApi.update(Number(id), payload);
      } else {
        const eq = await equipmentApi.create(payload);
        navigate(`/equipment/${eq.id}`);
        return;
      }
      navigate('/equipment');
    } catch (e) {
      console.error(e);
      alert('Error guardando equipo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>{isEditing ? 'Editar Equipo' : 'Nuevo Equipo'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Código</label>
          <input className="form-control" type="number" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required disabled={isEditing} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="PC">PC</option>
              <option value="LAPTOP">Laptop</option>
              <option value="PRINTER">Impresora</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="ACTIVE">Activo</option>
              <option value="REPAIR">En Reparación</option>
              <option value="INACTIVE">Inactivo</option>
              <option value="RETIRED">Baja</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Marca</label>
            <input className="form-control" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Modelo</label>
            <input className="form-control" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notas</label>
          <textarea className="form-control" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3}></textarea>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
};
