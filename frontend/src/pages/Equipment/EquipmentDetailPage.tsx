import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { equipmentApi } from '../../api/equipment.api';
import { Badge } from '../../components/Badge/Badge';
import { HistoryTimeline } from '../../components/HistoryTimeline/HistoryTimeline';

export const EquipmentDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: eq, isLoading } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentApi.getOne(Number(id)),
  });

  if (isLoading) return <div className="spinner" style={{ margin: 'auto', marginTop: '50px' }}></div>;
  if (!eq) return <div>Equipo no encontrado</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: 'var(--color-text)' }}>Equipo #{eq.code}</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Badge type="category" variant={eq.type} />
            <Badge type="status" variant={eq.status} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`/equipment/${id}/edit`)}>
          Editar Equipo
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Información General</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><strong style={{ color: 'var(--color-text-muted)' }}>Marca:</strong> {eq.brand || '-'}</div>
            <div><strong style={{ color: 'var(--color-text-muted)' }}>Modelo:</strong> {eq.model || '-'}</div>
            <div><strong style={{ color: 'var(--color-text-muted)' }}>Serie:</strong> {eq.serial || '-'}</div>
            <div><strong style={{ color: 'var(--color-text-muted)' }}>Ubicación:</strong> {eq.office ? `${eq.office.name} (${eq.office.section?.name})` : '-'}</div>
            <div><strong style={{ color: 'var(--color-text-muted)' }}>Adquirido:</strong> {eq.acquiredAt ? new Date(eq.acquiredAt).toLocaleDateString() : '-'}</div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Especificaciones</h2>
          <pre style={{ margin: 0, padding: '12px', backgroundColor: 'var(--color-background)', borderRadius: 'var(--border-radius)', fontSize: '14px', overflowX: 'auto' }}>
            {JSON.stringify(eq.specs, null, 2)}
          </pre>
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Notas</h3>
            <p style={{ margin: 0 }}>{eq.notes || 'Sin notas'}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Historial</h2>
        <HistoryTimeline events={eq.history || []} />
      </div>
    </div>
  );
};
