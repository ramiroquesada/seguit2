import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LogOut, User, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/equipment/new')) return 'Nuevo Equipo';
    if (path.startsWith('/equipment/')) return 'Detalle de Equipo';
    if (path.startsWith('/equipment')) return 'Equipos';
    if (path.startsWith('/settings')) return 'Configuración';
    if (path.startsWith('/users')) return 'Usuarios';
    return 'Seguit 2.0';
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>

      <div className="header-right">
        <button onClick={toggleTheme} className="theme-toggle-btn" title="Alternar tema">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="user-profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.fullName}</span>
            <span className="user-role">{user?.role === 'ROOT' ? 'Administrador' : 'Técnico'}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Cerrar sesión">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
