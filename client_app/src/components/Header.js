import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons'; // This is the hamburger menu icon
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { DashboardSelector } from './DashboardSelector';
import { useDashboards, useCurrentDashboard, useSidebar } from '../contexts/DashboardContext';

export const Header = ({user}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const {dashboards} = useDashboards();
  const {currentDashboard, onSelectDashboard} = useCurrentDashboard();
  const {isSidebarOpen, setIsSidebarOpen} = useSidebar();

  const handleLogout = () => {}
  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '0',
      left: '0',
      zIndex: 30, 
      width: '100%',
    }}>
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
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            marginTop: '0.25rem',
            minWidth: '12rem'
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #f3f4f6',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {user.email}
            </div>
            <button
              onClick={() => {
                setUserMenuOpen(false);
                handleLogout(); 
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