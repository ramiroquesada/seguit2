import React from 'react';
import { useStats } from './hooks/useStats';
import { StatsCard } from '../../components/StatsCard/StatsCard';
import { DataTable, type Column } from '../../components/DataTable/DataTable';
import { Badge } from '../../components/Badge/Badge';
import { MonitorIcon, Activity, AlertTriangle, MonitorOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const DashboardPage: React.FC = () => {
  const [limit, setLimit] = React.useState(25);
  const { data: stats, isLoading } = useStats(limit);
  const navigate = useNavigate();

  if (isLoading && !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!stats) return <div>Error al cargar estadísticas</div>;

  const cards = [
    {
      title: 'Total de Equipos',
      value: stats.total,
      icon: <MonitorIcon size={24} />,
      color: 'var(--color-primary)'
    },
    {
      title: 'Equipos Activos',
      value: stats.byStatus['ACTIVE'] || 0,
      icon: <Activity size={24} />,
      color: 'var(--color-success)'
    },
    {
      title: 'En Reparación',
      value: stats.byStatus['REPAIR'] || 0,
      icon: <AlertTriangle size={24} />,
      color: 'var(--color-warning)'
    },
    {
      title: 'Equipos de Baja',
      value: stats.byStatus['RETIRED'] || 0,
      icon: <MonitorOff size={24} />,
      color: 'var(--color-text-muted)'
    }
  ];

  const columns: Column<any>[] = [
    { key: 'id', label: 'ID' },
    { key: 'category', label: 'Tipo', render: (eq) => <Badge type="category" variant={eq.category?.name || 'Otro'} /> },
    { key: 'brandModel', label: 'Marca / Modelo', render: (eq) => `${eq.brand || '-'} / ${eq.model || '-'}` },
    { key: 'status', label: 'Estado', render: (eq) => <Badge type="status" variant={eq.status} /> },
    { key: 'createdAt', label: 'Agregado', render: (eq) => format(new Date(eq.createdAt), "dd/MM/yyyy", { locale: es }) }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: 'var(--color-text)' }}>Resumen General</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {cards.map((card, i) => (
            <StatsCard key={i} {...card} />
          ))}
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Últimos Ingresos</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/equipment')}>Ver todos</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <DataTable
            columns={columns}
            data={stats.newest || []}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => navigate(`/equipment/${item.id}`)}
            isLoading={isLoading}
          />

          {stats.newest.length < stats.total && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setLimit(prev => prev + 25)}
                disabled={isLoading}
              >
                {isLoading ? 'Cargando...' : 'Ver más resultados'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
