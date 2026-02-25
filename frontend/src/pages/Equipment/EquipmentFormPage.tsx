import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, ClipboardList } from 'lucide-react';
import { equipmentApi } from '../../api/equipment.api';
import { locationsApi } from '../../api/locations.api';
import { equipmentModelsApi } from '../../api/equipment-models.api';
import { categoriesApi } from '../../api/categories.api';
import type { EquipmentModel } from '../../api/equipment-models.api';

export const EquipmentFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: '', categoryId: '' as string | number, brand: '', model: '', serial: '', status: 'ACTIVE', notes: '',
    cityId: '', sectionId: '', officeId: '',
    modelId: '' as string | number,
    specs: [] as { key: string; value: string }[],
  });

  const [cities, setCities] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [models, setModels] = useState<EquipmentModel[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    locationsApi.getCities().then(setCities);
    equipmentModelsApi.getAll().then(setModels);
    categoriesApi.getAll().then(setCategories);

    if (isEditing) {
      equipmentApi.getOne(Number(id)).then(async (eq: any) => {
        const specs = Object.entries(eq.specs || {}).map(([key, value]) => ({ key, value: String(value) }));
        const cityId = eq.office?.section?.city?.id || '';
        const sectionId = eq.office?.section?.id || '';
        const officeId = eq.office?.id || '';

        if (cityId) {
          const s = await locationsApi.getSections(Number(cityId));
          setSections(s);
        }
        if (sectionId) {
          const o = await locationsApi.getOffices(Number(sectionId));
          setOffices(o);
        }

        setFormData({
          id: String(eq.id), categoryId: eq.categoryId || '', brand: eq.brand || '', model: eq.model || '',
          serial: eq.serial || '', status: eq.status, notes: eq.notes || '',
          cityId: String(cityId), sectionId: String(sectionId), officeId: String(officeId),
          modelId: eq.equipmentModel?.id || '',
          specs,
        });
      });
    } else {
      equipmentApi.getNextId().then((res: any) => setFormData(f => ({ ...f, id: String(res.nextId) })));
    }
  }, [id, isEditing]);

  const handleCityChange = async (cityId: string) => {
    setFormData({ ...formData, cityId, sectionId: '', officeId: '' });
    setSections([]);
    setOffices([]);
    if (cityId) {
      const s = await locationsApi.getSections(Number(cityId));
      setSections(s);
    }
  };

  const handleSectionChange = async (sectionId: string) => {
    setFormData({ ...formData, sectionId, officeId: '' });
    setOffices([]);
    if (sectionId) {
      const o = await locationsApi.getOffices(Number(sectionId));
      setOffices(o);
    }
  };

  const handleModelChange = (modelId: string) => {
    if (!modelId) {
      setFormData({ ...formData, modelId: '' });
      return;
    }
    const model = models.find(m => m.id === Number(modelId));
    if (model) {
      const specs = Object.entries(model.specs || {}).map(([key, value]) => ({ key, value: String(value) }));
      setFormData({
        ...formData,
        modelId: model.id,
        brand: model.brand,
        model: model.modelName,
        categoryId: model.categoryId,
        specs,
      });
    }
  };

  const addSpec = () => setFormData({ ...formData, specs: [...formData.specs, { key: '', value: '' }] });
  const removeSpec = (index: number) => setFormData({ ...formData, specs: formData.specs.filter((_, i) => i !== index) });
  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...formData.specs];
    newSpecs[index][field] = val;
    setFormData({ ...formData, specs: newSpecs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const specsObj = formData.specs.reduce((acc, curr) => {
        if (curr.key.trim()) acc[curr.key.trim()] = curr.value;
        return acc;
      }, {} as any);

      const payload: any = {
        ...formData,
        id: Number(formData.id),
        officeId: formData.officeId ? Number(formData.officeId) : null,
        modelId: formData.modelId ? Number(formData.modelId) : null,
        specs: specsObj,
      };

      // Remove UI-only fields
      delete payload.cityId;
      delete payload.sectionId;

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
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button className="btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h2 style={{ margin: 0 }}>{isEditing ? 'Editar Equipo' : 'Nuevo Equipo'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left Column - Main Data */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">ID de Inventario</label>
                <input className="form-control" type="number" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} required disabled={isEditing} />
              </div>
              <div className="form-group">
                <label className="form-label">Plantilla de Modelo (Opcional)</label>
                <select className="form-control" value={formData.modelId} onChange={e => handleModelChange(e.target.value)}>
                  <option value="">Seleccionar plantilla...</option>
                  {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select className="form-control" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} required>
                  <option value="">Seleccionar categoría...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Marca</label>
                <input className="form-control" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Modelo</label>
              <input className="form-control" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Número de Serie</label>
                <input className="form-control" value={formData.serial} onChange={e => setFormData({ ...formData, serial: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="ACTIVE">Activo</option>
                  <option value="REPAIR">En Reparación</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="RETIRED">Baja</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notas</label>
              <textarea className="form-control" style={{ height: '80px', resize: 'none' }} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
            </div>
          </div>

          {/* Right Column - Location and Specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Ubicación</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Ciudad</label>
                <select className="form-control" value={formData.cityId} onChange={e => handleCityChange(e.target.value)}>
                  <option value="">Seleccionar ciudad...</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sección</label>
                <select className="form-control" value={formData.sectionId} onChange={e => handleSectionChange(e.target.value)} disabled={!formData.cityId}>
                  <option value="">Seleccionar sección...</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Oficina</label>
                <select className="form-control" value={formData.officeId} onChange={e => setFormData({ ...formData, officeId: e.target.value })} disabled={!formData.sectionId}>
                  <option value="">Seleccionar oficina...</option>
                  {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}><ClipboardList size={16} /> Especificaciones Técnicas</label>
                <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={addSpec}>
                  <Plus size={14} /> Agregar
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--color-border)', padding: '8px', borderRadius: '4px' }}>
                {formData.specs.length === 0 && <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', padding: '12px' }}>Sin especificaciones</div>}
                {formData.specs.map((spec, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px' }}>
                    <input placeholder="Clave" className="form-control" style={{ flex: 1 }} value={spec.key} onChange={e => updateSpec(index, 'key', e.target.value)} />
                    <input placeholder="Valor" className="form-control" style={{ flex: 1 }} value={spec.value} onChange={e => updateSpec(index, 'value', e.target.value)} />
                    <button type="button" className="btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => removeSpec(index)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={20} />
            {loading ? 'Guardando...' : 'Guardar Equipo'}
          </button>
        </div>
      </form>
    </div>
  );
};
