import React from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistoryEvent {
  id: number;
  action: string;
  description: string;
  date: string;
  user: { fullName: string };
}

interface HistoryTimelineProps {
  events: HistoryEvent[];
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ events }) => {
  return (
    <div className="timeline-container" style={{ position: 'relative', paddingLeft: '24px', margin: '24px 0' }}>
      {/* Vertical line connecting events */}
      <div style={{
        position: 'absolute',
        left: '24px',
        top: '24px',
        bottom: '24px',
        width: '2px',
        backgroundColor: 'var(--color-border)',
        transform: 'translateX(-50%)',
        zIndex: 0
      }}></div>

      {events.length === 0 && (
        <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>No hay eventos registrados.</div>
      )}

      {events.map((event, index) => (
        <div key={event.id} style={{ 
          display: 'flex', 
          gap: '24px', 
          marginBottom: index === events.length - 1 ? 0 : '32px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ 
            marginTop: '4px',
            width: '32px', 
            height: '32px', 
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface)',
            border: '2px solid var(--color-primary)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateX(-50%)'
          }}>
            <Clock size={16} />
          </div>
          
          <div style={{ flex: 1, backgroundColor: 'var(--color-background)', padding: '16px', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '14px' }}>
                {event.action}
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                {format(new Date(event.date), "d 'de' MMMM, yyyy HH:mm", { locale: es })}
              </span>
            </div>
            <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
              {event.description}
            </p>
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Registrado por: <strong>{event.user.fullName}</strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
