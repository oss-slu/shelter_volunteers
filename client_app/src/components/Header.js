import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons'; // This is the hamburger menu icon
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useSidebar } from '../contexts/DashboardContext';
import { useNavigate } from 'react-router-dom';
import {useCurrentDashboard} from '../contexts/DashboardContext';

export const Header = ({user}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const {isSidebarOpen, setIsSidebarOpen} = useSidebar();
  const navigate = useNavigate();
  const {currentDashboard} = useCurrentDashboard();

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
        <div>
          <h2>
            {currentDashboard.name}
          </h2>
        </div>
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