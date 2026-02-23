import React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="card">
      <h2>Configuración</h2>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '16px' }}>
        Las ubicaciones (Ciudades, Secciones y Oficinas) se configurarán aquí. En esta versión la funcionalidad completa está en desarrollo.
      </p>
    </div>
  );
};
