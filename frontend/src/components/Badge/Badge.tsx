import React from 'react';

type BadgeType = 'status' | 'category';
type BadgeVariant = 
  | 'ACTIVE' | 'INACTIVE' | 'REPAIR' | 'RETIRED' // Status
  | 'PC' | 'LAPTOP' | 'MODEM' | 'ROUTER' | 'PRINTER' | 'ANTENNA' | 'OTHER'; // Types

interface BadgeProps {
  type: BadgeType;
  variant: string | BadgeVariant;
  label?: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Activo', className: 'status-active' },
  INACTIVE: { label: 'Inactivo', className: 'status-inactive' },
  REPAIR: { label: 'Reparación', className: 'status-repair' },
  RETIRED: { label: 'Baja', className: 'status-retired' },
};

const categoryMap: Record<string, { label: string; color: string }> = {
  PC: { label: 'PC Escritorio', color: '#3b82f6' },
  LAPTOP: { label: 'Notebook', color: '#8b5cf6' },
  MODEM: { label: 'Módem', color: '#ec4899' },
  ROUTER: { label: 'Router', color: '#f97316' },
  PRINTER: { label: 'Impresora', color: '#06b6d4' },
  ANTENNA: { label: 'Antena', color: '#14b8a6' },
  OTHER: { label: 'Otro', color: '#6b7280' },
};

export const Badge: React.FC<BadgeProps> = ({ type, variant, label }) => {
  if (type === 'status') {
    const info = statusMap[variant] || { label: variant, className: 'status-retired' };
    return (
      <span className={`badge badge-status ${info.className}`}>
        {label || info.label}
      </span>
    );
  }

  const info = categoryMap[variant] || { label: variant, color: '#6b7280' };
  
  return (
    <span className="badge badge-category" style={{ 
      backgroundColor: `${info.color}15`, 
      color: info.color,
      border: `1px solid ${info.color}30`
    }}>
      {label || info.label}
    </span>
  );
};
