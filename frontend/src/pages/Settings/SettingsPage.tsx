import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, MapPin, Building2, Landmark, Combine, X } from 'lucide-react';
import { locationsApi } from '../../api/locations.api';
import { equipmentModelsApi } from '../../api/equipment-models.api';
import { categoriesApi } from '../../api/categories.api';
import type { EquipmentModel } from '../../api/equipment-models.api';
import { LocationModal } from './LocationModal';
import { EquipmentModelModal } from './EquipmentModelModal';
import { MergeOfficesModal } from './MergeOfficesModal';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'locations' | 'models' | 'categories'>('locations');
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

  const [locationModal, setLocationModal] = useState<{
    isOpen: boolean;
    type: 'city' | 'section' | 'office';
    mode: 'create' | 'edit';
    id?: number;
    initialName?: string;
  }>({ isOpen: false, type: 'city', mode: 'create' });

  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  const [modelModal, setModelModal] = useState<{
    isOpen: boolean;
    model?: EquipmentModel | null;
  }>({ isOpen: false });

  // Queries
  const [categoryEditing, setCategoryEditing] = useState<{ id: number; name: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Queries
  const { data: cities = [], isLoading: loadingCities } = useQuery({ queryKey: ['cities'], queryFn: locationsApi.getCities, enabled: activeTab === 'locations' });
  const { data: sections = [], isLoading: loadingSections } = useQuery({ queryKey: ['sections', selectedCityId], queryFn: () => locationsApi.getSections(selectedCityId!), enabled: activeTab === 'locations' && !!selectedCityId });
  const { data: offices = [], isLoading: loadingOffices } = useQuery({ queryKey: ['offices', selectedSectionId], queryFn: () => locationsApi.getOffices(selectedSectionId!), enabled: activeTab === 'locations' && !!selectedSectionId });
  const { data: models = [], isLoading: loadingModels } = useQuery({ queryKey: ['equipment-models'], queryFn: equipmentModelsApi.getAll, enabled: activeTab === 'models' });
  const { data: categories = [], isLoading: loadingCategories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll, enabled: activeTab === 'categories' });

  // Default selections
  React.useEffect(() => {
    if (cities.length > 0 && !selectedCityId) {
      const mercedes = cities.find(c => c.name.toLowerCase() === 'mercedes');
      if (mercedes) setSelectedCityId(mercedes.id);
    }
  }, [cities, selectedCityId]);

  React.useEffect(() => {
    if (sections.length > 0 && !selectedSectionId) {
      const informatica = sections.find(s => s.name.toLowerCase() === 'informática');
      if (informatica) setSelectedSectionId(informatica.id);
    }
  }, [sections, selectedSectionId]);

  // Mutations
  const locationMutation = useMutation({
    mutationFn: async (data: { type: string, action: string, name: string, id?: number, parentId?: number }) => {
      if (data.action === 'create') {
        if (data.type === 'city') return locationsApi.createCity(data.name);
        if (data.type === 'section') return locationsApi.createSection(selectedCityId!, data.name);
        if (data.type === 'office') return locationsApi.createOffice(selectedSectionId!, data.name);
      } else {
        if (data.type === 'city') return locationsApi.updateCity(data.id!, data.name);
        if (data.type === 'section') return locationsApi.updateSection(data.id!, data.name, data.parentId);
        if (data.type === 'office') return locationsApi.updateOffice(data.id!, data.name, data.parentId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.type === 'city' ? 'cities' : variables.type === 'section' ? 'sections' : 'offices'] });
      setLocationModal({ ...locationModal, isOpen: false });
    }
  });

  const modelMutation = useMutation({
    mutationFn: async (data: any) => {
      if (modelModal.model) return equipmentModelsApi.update(modelModal.model.id, data);
      return equipmentModelsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-models'] });
      setModelModal({ isOpen: false });
    }
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (data: { type: string, id: number }) => {
      if (data.type === 'city') return locationsApi.deleteCity(data.id);
      if (data.type === 'section') return locationsApi.deleteSection(data.id);
      if (data.type === 'office') return locationsApi.deleteOffice(data.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.type === 'city' ? 'cities' : variables.type === 'section' ? 'sections' : 'offices'] });
      if (variables.type === 'city' && selectedCityId === variables.id) setSelectedCityId(null);
      if (variables.type === 'section' && selectedSectionId === variables.id) setSelectedSectionId(null);
    }
  });

  const mergeMutation = useMutation({
    mutationFn: (data: { targetId: number, sourceIds: number[] }) => locationsApi.mergeOffices(data.targetId, data.sourceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setMergeModalOpen(false);
    }
  });

  const deleteModelMutation = useMutation({
    mutationFn: (id: number) => equipmentModelsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment-models'] }),
    onError: (err: any) => alert(err.response?.data?.message || 'Error al eliminar modelo')
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    onError: (err: any) => alert(err.response?.data?.message || 'Error al eliminar categoría'),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => categoriesApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCategoryName('');
    },
    onError: (err: any) => alert(err.response?.data?.message || 'Error al crear categoría'),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => categoriesApi.update(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCategoryEditing(null);
    },
    onError: (err: any) => alert(err.response?.data?.message || 'Error al actualizar categoría'),
  });

  const renderLocationColumn = (title: string, icon: React.ReactNode, type: 'city' | 'section' | 'office', items: any[], loading: boolean, selectedId: number | null, onSelect: (id: number) => void, disabled: boolean = false) => (
    <div className="card" style={{ flex: 1, padding: 0, opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>{icon} {title}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setMergeModalOpen(true)} title="Fusionar oficinas"><Combine size={16} /></button>
          <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setLocationModal({ isOpen: true, type, mode: 'create' })}><Plus size={16} /></button>
        </div>
      </div>
      <div style={{ padding: '8px 0', minHeight: '300px', maxHeight: '500px', overflowY: 'auto' }}>
        {loading ? <div className="spinner-container"><div className="spinner"></div></div> : items.map(item => (
          <div key={item.id} onClick={() => onSelect(item.id)} style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: selectedId === item.id ? 'var(--color-primary-light)' : 'transparent', color: selectedId === item.id ? 'white' : 'inherit' }}>
            <span style={{ fontSize: '14px' }}>{item.name}</span>
            <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
              <button className="btn-icon" style={{ color: selectedId === item.id ? 'white' : 'inherit' }} onClick={() => setLocationModal({ isOpen: true, type, mode: 'edit', id: item.id, initialName: item.name })}><Edit2 size={14} /></button>
              <button className="btn-icon" style={{ color: selectedId === item.id ? 'white' : 'inherit' }} onClick={() => window.confirm(`¿Eliminar ${item.name}?`) && deleteLocationMutation.mutate({ type, id: item.id })}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2>Configuración</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Administra ubicaciones, categorías y plantillas de equipos.</p>
        </div>
        <div className="tabs" style={{ display: 'flex', gap: '8px', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('locations')}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'locations' ? 'white' : 'transparent', fontWeight: activeTab === 'locations' ? 600 : 400, boxShadow: activeTab === 'locations' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            Ubicaciones
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'categories' ? 'white' : 'transparent', fontWeight: activeTab === 'categories' ? 600 : 400, boxShadow: activeTab === 'categories' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            Categorías
          </button>
          <button
            onClick={() => setActiveTab('models')}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'models' ? 'white' : 'transparent', fontWeight: activeTab === 'models' ? 600 : 400, boxShadow: activeTab === 'models' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            Modelos de Equipos
          </button>
        </div>
      </div>

      {activeTab === 'locations' && (
        <div style={{ display: 'flex', gap: '24px' }}>
          {renderLocationColumn('Ciudades', <Landmark size={18} />, 'city', cities, loadingCities, selectedCityId, id => { setSelectedCityId(id); setSelectedSectionId(null); })}
          {renderLocationColumn('Secciones', <MapPin size={18} />, 'section', sections, loadingSections, selectedSectionId, id => setSelectedSectionId(id), !selectedCityId)}
          {renderLocationColumn('Oficinas', <Building2 size={18} />, 'office', offices, loadingOffices, null, id => navigate(`/equipment?officeId=${id}`), !selectedSectionId)}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>Gestión de Categorías</div>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nueva categoría..."
                className="input"
                style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                onKeyDown={(e) => e.key === 'Enter' && newCategoryName && createCategoryMutation.mutate(newCategoryName)}
              />
              <button
                className="btn btn-primary"
                onClick={() => createCategoryMutation.mutate(newCategoryName)}
                disabled={!newCategoryName || createCategoryMutation.isPending}
              >
                <Plus size={16} /> Agregar
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {categories.map((cat: any) => (
                <div key={cat.id} className="card" style={{ padding: '12px 16px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {categoryEditing && categoryEditing.id === cat.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                      <input
                        autoFocus
                        type="text"
                        value={categoryEditing.name}
                        onChange={(e) => setCategoryEditing(prev => prev ? { ...prev, name: e.target.value } : null)}
                        style={{ flex: 1, padding: '4px 8px', border: '1px solid var(--color-primary)', borderRadius: '4px' }}
                        onKeyDown={(e) => e.key === 'Enter' && categoryEditing && updateCategoryMutation.mutate(categoryEditing)}
                      />
                      <button className="btn-icon" style={{ color: 'var(--color-success)' }} onClick={() => categoryEditing && updateCategoryMutation.mutate(categoryEditing)}><Plus size={16} /></button>
                      <button className="btn-icon" onClick={() => setCategoryEditing(null)}><X size={16} /></button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div style={{ fontWeight: 500 }}>{cat.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {cat._count?.equipment || 0} equipos, {cat._count?.equipmentModels || 0} modelos
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-icon" onClick={() => setCategoryEditing({ id: cat.id, name: cat.name })}><Edit2 size={14} /></button>
                        <button
                          className="btn-icon"
                          onClick={() => {
                            if (cat._count && (cat._count.equipment > 0 || cat._count.equipmentModels > 0)) {
                              alert('No se puede eliminar una categoría con elementos asociados.');
                              return;
                            }
                            if (window.confirm(`¿Eliminar categoría ${cat.name}?`)) deleteCategoryMutation.mutate(cat.id);
                          }}
                        ><Trash2 size={14} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            {loadingCategories && <div className="spinner"></div>}
          </div>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>Plantillas de Dispositivos</div>
            <button className="btn btn-primary" onClick={() => setModelModal({ isOpen: true, model: null })}><Plus size={16} /> Nuevo Modelo</button>
          </div>
          <div style={{ padding: '20px' }}>
            {loadingModels ? <div className="spinner"></div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {models.map(m => (
                  <div key={m.id} className="card" style={{ padding: '16px', border: '1px solid var(--color-border)', position: 'relative' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{m.name}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{m.brand} - {m.modelName}</div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                      <span style={{ fontSize: '11px', backgroundColor: 'var(--color-primary-light)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>{m.category?.name || 'S/C'}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{Object.keys(m.specs).length} especificaciones</span>
                    </div>
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '4px' }}>
                      <button className="btn-icon" onClick={() => setModelModal({ isOpen: true, model: m })}><Edit2 size={14} /></button>
                      <button className="btn-icon" onClick={() => window.confirm(`¿Eliminar modelo ${m.name}?`) && deleteModelMutation.mutate(m.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <LocationModal
        isOpen={locationModal.isOpen}
        title={`${locationModal.mode === 'create' ? 'Agregar' : 'Editar'} ${locationModal.type === 'city' ? 'Ciudad' : locationModal.type === 'section' ? 'Sección' : 'Oficina'}`}
        type={locationModal.type}
        mode={locationModal.mode}
        initialName={locationModal.initialName}
        initialParentId={
          locationModal.type === 'section' ? selectedCityId! :
            locationModal.type === 'office' ? selectedSectionId! :
              undefined
        }
        initialCityId={
          locationModal.type === 'office' ? selectedCityId! : undefined
        }
        cityList={cities}
        onClose={() => setLocationModal({ ...locationModal, isOpen: false })}
        onSave={async (name, parentId) => {
          await locationMutation.mutateAsync({
            type: locationModal.type,
            action: locationModal.mode,
            name,
            id: locationModal.id,
            parentId: parentId
          });
        }}
      />

      <EquipmentModelModal
        isOpen={modelModal.isOpen}
        model={modelModal.model}
        onClose={() => setModelModal({ isOpen: false })}
        onSave={async data => { await modelMutation.mutateAsync(data); }}
      />
      <MergeOfficesModal
        isOpen={mergeModalOpen}
        onClose={() => setMergeModalOpen(false)}
        offices={offices}
        onMerge={async (targetId, sourceIds) => {
          await mergeMutation.mutateAsync({ targetId, sourceIds });
        }}
      />
    </div>
  );
};
