import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MonitorIcon, Settings, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { user } = useAuth();
  const isRoot = user?.role === 'ROOT';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/equipment', label: 'Equipos', icon: <MonitorIcon size={20} /> },
    { path: '/settings', label: 'Configuración', icon: <Settings size={20} /> },
    ...(isRoot ? [
      { path: '/users', label: 'Usuarios', icon: <Users size={20} /> },
    ] : [])
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {!isCollapsed && <span className="logo-text">Seguit <span className="logo-version">2.0</span></span>}
          {isCollapsed && <span className="logo-text-short">S2</span>}
        </div>
      </div>

      <div className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? item.label : undefined}
          >
            <div className="nav-icon">{item.icon}</div>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <button onClick={toggleSidebar} className="collapse-btn">
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!isCollapsed && <span style={{ marginLeft: 8 }}>Ocultar</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
