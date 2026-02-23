import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  trend?: { value: number; label: string; positive?: boolean };
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = 'var(--color-primary)', trend }) => {
  return (
    <div className="card stats-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{title}</p>
          <h3 style={{ margin: '8px 0 0', fontSize: '28px', color: 'var(--color-text)', fontWeight: 700 }}>{value}</h3>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          backgroundColor: `${color}15`,
          color: color
        }}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span style={{ 
            color: trend.positive ? 'var(--color-success)' : 'var(--color-error)',
            fontWeight: 600
          }}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>{trend.label}</span>
        </div>
      )}
    </div>
  );
};
