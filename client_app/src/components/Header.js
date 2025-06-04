import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons'; // This is the hamburger menu icon
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { DashboardSelector } from './DashboardSelector';
import { useDashboards, useCurrentDashboard, useSidebar } from '../contexts/DashboardContext';
import { useNavigate } from 'react-router-dom';

export const Header = ({user}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const {currentDashboard, onSelectDashboard} = useCurrentDashboard();
  const {isSidebarOpen, setIsSidebarOpen} = useSidebar();
  const {dashboards} = useDashboards();
  const navigate = useNavigate();

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => {setIsSidebarOpen(!isSidebarOpen)}}
          style={{
            padding: '0.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          <FontAwesomeIcon icon={faBars} />
        </button> 
        <DashboardSelector
          dashboards={dashboards}
          currentDashboard={currentDashboard}
          onSelectDashboard={onSelectDashboard}
        />
      </div>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="user-menu-button"
        >
          <img
            src={user.picture}
            alt={user.name}
            className="user-avatar"
          />
          <span className="user-name">{user.name}</span>
        </button>
        {userMenuOpen && (
          <div className="user-menu-item">
            <div className="sidebar-header">
              {user.email}
            </div>
            <button
              onClick={() => {
                setUserMenuOpen(false);
                navigate('/logout');
              }}
              className="user-menu-button"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};