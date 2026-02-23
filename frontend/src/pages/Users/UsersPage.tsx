import React from 'react';

export const UsersPage: React.FC = () => {
  return (
    <div className="card">
      <h2>Usuarios del Sistema</h2>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '16px' }}>
        La administración de usuarios (Técnicos) está disponible solo para administradores ROOT. En esta versión la interfaz gráfica está en construcción.
      </p>
    </div>
  );
};
