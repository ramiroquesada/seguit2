import React from 'react';
import { X } from 'lucide-react';
import { useCities, useSections, useOffices } from '../../../hooks/useLocations';

// Using objects instead of enums for compatibility with erasableSyntaxOnly
const EquipmentType = {
  PC: 'PC',
  LAPTOP: 'LAPTOP',
  MODEM: 'MODEM',
  ROUTER: 'ROUTER',
  PRINTER: 'PRINTER',
  ANTENNA: 'ANTENNA',
  OTHER: 'OTHER'
} as const;

const EquipmentStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  REPAIR: 'REPAIR',
  RETIRED: 'RETIRED'
} as const;

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  params: any;
  setParams: React.Dispatch<React.SetStateAction<any>>;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose, params, setParams }) => {
  const { data: cities } = useCities();
  const { data: sections } = useSections(params.cityId ? +params.cityId : undefined);
  const { data: offices } = useOffices(params.sectionId ? +params.sectionId : undefined);

  const handleChange = (name: string, value: string) => {
    setParams((prev: any) => {
      const newParams = { ...prev, [name]: value, page: 1 };
      
      // Reset dependent fields
      if (name === 'cityId') {
        newParams.sectionId = '';
        newParams.officeId = '';
      } else if (name === 'sectionId') {
        newParams.officeId = '';
      }
      
      return newParams;
    });
  };

  const clearFilters = () => {
    setParams((prev: any) => ({
      ...prev,
      type: '',
      status: '',
      cityId: '',
      sectionId: '',
      officeId: '',
      page: 1,
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000,
          backdropFilter: 'blur(2px)'
        }} 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div style={{ 
        position: 'fixed', top: 0, right: 0, bottom: 0, 
        width: '100%', maxWidth: '360px', 
        backgroundColor: 'var(--color-card)', 
        boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
        zIndex: 1001,
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Filtros</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', 
              color: 'var(--color-text-muted)', display: 'flex' 
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="label">Tipo de Equipo</label>
            <select 
              className="form-control" 
              value={params.type} 
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {Object.values(EquipmentType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Estado</label>
            <select 
              className="form-control" 
              value={params.status} 
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="">Todos los estados</option>
              {Object.values(EquipmentStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '10px 0' }} />

          <div>
            <label className="label">Ciudad</label>
            <select 
              className="form-control" 
              value={params.cityId} 
              onChange={(e) => handleChange('cityId', e.target.value)}
            >
              <option value="">Todas las ciudades</option>
              {cities?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Sección</label>
            <select 
              className="form-control" 
              value={params.sectionId} 
              onChange={(e) => handleChange('sectionId', e.target.value)}
              disabled={!params.cityId}
            >
              <option value="">Todas las secciones</option>
              {sections?.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Oficina</label>
            <select 
              className="form-control" 
              value={params.officeId} 
              onChange={(e) => handleChange('officeId', e.target.value)}
              disabled={!params.sectionId}
            >
              <option value="">Todas las oficinas</option>
              {offices?.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={clearFilters}>
            Limpiar
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>
            Aplicar
          </button>
        </div>
      </div>
    </>
  );
};
