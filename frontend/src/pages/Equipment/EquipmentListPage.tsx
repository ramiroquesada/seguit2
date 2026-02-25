import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { useEquipment } from './hooks/useEquipment';
import { DataTable, type Column } from '../../components/DataTable/DataTable';
import { Badge } from '../../components/Badge/Badge';
import { FilterDrawer } from './components/FilterDrawer';

export const EquipmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialOfficeId = searchParams.get('officeId') || '';
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [params, setParams] = useState({
    page: 1, limit: 50, search: '', sortBy: 'id', order: 'desc',
    type: '', status: '', cityId: '', sectionId: '', officeId: initialOfficeId
  });

  const { data, isLoading } = useEquipment(params);

  const handleSort = (key: string) => {
    setParams(prev => ({
      ...prev,
      sortBy: key,
      order: prev.sortBy === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const columns: Column<any>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'type', label: 'Tipo', sortable: true, render: (eq) => <Badge type="category" variant={eq.type} /> },
    { key: 'brandModel', label: 'Marca / Modelo', render: (eq) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 500 }}>{eq.brand || '-'}</span>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{eq.model || '-'}</span>
      </div>
    )},
    { key: 'serial', label: 'Serie' },
    { key: 'status', label: 'Estado', sortable: true, render: (eq) => <Badge type="status" variant={eq.status} /> },
    { key: 'office', label: 'Ubicación', render: (eq) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>{eq.office?.name || 'Sin oficina'}</span>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {eq.office?.section?.city?.name} - {eq.office?.section?.name}
        </span>
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
            <Search size={18} />
          </div>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Buscar ID, marca, modelo, serie..." 
            style={{ paddingLeft: '40px' }}
            value={params.search}
            onChange={handleSearch}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setIsFilterOpen(true)}>
            <Filter size={18} /> Filtros
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/equipment/new')}>
            <Plus size={18} /> Nuevo Equipo
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <DataTable
          columns={columns}
          data={data?.data || []}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          sortKey={params.sortBy}
          sortOrder={params.order as 'asc' | 'desc'}
          onSort={handleSort}
          onRowClick={(item) => navigate(`/equipment/${item.id}`)}
        />

        {data?.meta && data.data.length < data.meta.total && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setParams(prev => ({ ...prev, limit: prev.limit + 50 }))}
              disabled={isLoading}
              style={{ minWidth: '200px' }}
            >
              {isLoading ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : 'Ver más resultados'}
            </button>
          </div>
        )}
      </div>

      <FilterDrawer 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        params={params} 
        setParams={setParams} 
      />
    </div>
  );
};
