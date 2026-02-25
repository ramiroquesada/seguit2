import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Wrench, ShieldCheck } from 'lucide-react';
import { equipmentApi } from '../../api/equipment.api';
import { historyApi } from '../../api/history.api';
import { Badge } from '../../components/Badge/Badge';
import { HistoryTimeline } from '../../components/HistoryTimeline/HistoryTimeline';
import { TransferModal } from './components/TransferModal';

export const EquipmentDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const { data: eq, isLoading } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentApi.getOne(Number(id)),
  });

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['equipment', id, 'history'],
    queryFn: () => historyApi.getByEquipment(Number(id)),
    enabled: !!eq,
  });

  const mutation = useMutation({
    mutationFn: (payload: any) => equipmentApi.update(Number(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', id] });
      queryClient.invalidateQueries({ queryKey: ['equipment', id, 'history'] });
    },
  });

  if (isLoading) return <div className="spinner" style={{ margin: 'auto', marginTop: '50px' }}></div>;
  if (!eq) return <div>Equipo no encontrado</div>;

  const handleTransfer = async (officeId: number, reason: string) => {
    await mutation.mutateAsync({ officeId, historyDescription: reason });
  };

  const handleStatusChange = async (status: string, defaultReason: string) => {
    const reason = window.prompt(`Motivo del cambio a ${status}:`, defaultReason);
    if (reason === null) return;
    await mutation.mutateAsync({ status, historyDescription: reason });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: 'var(--color-text)' }}>Equipo #{eq.id}</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Badge type="category" variant={eq.type} />
            <Badge type="status" variant={eq.status} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsTransferModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <MapPin size={18} /> Trasladar
          </button>
          
          {eq.status === 'REPAIR' ? (
            <button 
              className="btn btn-primary" 
              onClick={() => handleStatusChange('ACTIVE', 'Reparación finalizada con éxito.')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ShieldCheck size={18} /> Marcar como Operativo
            </button>
          ) : (
            <button 
              className="btn btn-secondary" 
              onClick={() => handleStatusChange('REPAIR', 'Falla detectada: ')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Wrench size={18} /> Enviar a Soporte
            </button>
          )}

          <button className="btn btn-primary" onClick={() => navigate(`/equipment/${eq.id}/edit`)}>
            Editar Ficha
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Información General</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div><strong style={{ color: 'var(--color-text-muted)' }}>Marca:</strong> {eq.brand || '-'}</div>
            <div><strong style={{ color: 'var(--color-text-muted)' }}>Modelo:</strong> {eq.model || '-'}</div>
            <div><strong style={{ color: 'var(--color-text-muted)' }}>Serie:</strong> {eq.serial || '-'}</div>
            <div>
              <strong style={{ color: 'var(--color-text-muted)' }}>Ubicación:</strong>
              <div style={{ marginLeft: '12px', marginTop: '4px' }}>
                <span style={{ 
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-primary-light)20', 
                  color: 'var(--color-primary-dark)', 
                  border: '1px solid var(--color-primary-light)40' 
                }}>
                  {eq.office?.name || 'ST'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                  {eq.office?.section?.name} ({eq.office?.section?.city?.name})
                </span>
              </div>
            </div>
            <div><strong style={{ color: 'var(--color-text-muted)' }}>Adquirido:</strong> {eq.acquiredAt ? new Date(eq.acquiredAt).toLocaleDateString() : '-'}</div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Especificaciones Técnicas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {Object.entries(eq.specs || {}).map(([key, value]) => (
              <div key={key} style={{ backgroundColor: 'var(--color-background)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key}</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{String(value)}</div>
              </div>
            ))}
            {(!eq.specs || Object.keys(eq.specs).length === 0) && <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin especificaciones</div>}
          </div>
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Notas de Inventario</h3>
            <p style={{ margin: 0, fontSize: '14px', backgroundColor: 'var(--color-background)', padding: '12px', borderRadius: '4px' }}>
              {eq.notes || 'Sin notas adicionales.'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Historial y Mantenimiento {isLoadingHistory && <div className="spinner-small"></div>}
        </h2>
        <HistoryTimeline events={history || []} />
      </div>

      <TransferModal 
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onConfirm={handleTransfer}
        currentOfficeId={eq.office?.id}
      />
    </div>
  );
};
