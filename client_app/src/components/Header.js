import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useSidebar } from '../contexts/DashboardContext';
import { useNavigate } from 'react-router-dom';
import {useCurrentDashboard} from '../contexts/DashboardContext';
import { SidebarButton } from "./SidebarButton";

export const Header = ({user}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const {isSidebarOpen} = useSidebar();
  const navigate = useNavigate();
  const {currentDashboard} = useCurrentDashboard();

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isSidebarOpen && (
          <SidebarButton />
        )}
        {currentDashboard && !isSidebarOpen && (
          <div>
            <h2>
              {currentDashboard.name}
            </h2>
          </div>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="dropdown-menu-button"
        >
          <img
            src={user.picture}
            alt={user.name}
            className="user-avatar"
          />
          <span className="dropdown-name">{user.name}</span>
        </button>
        {userMenuOpen && (
          <div className="dropdown-menu-item">
            <div className="sidebar-header">
              {user.email}
            </div>
            <button
              onClick={() => {
                setUserMenuOpen(false);
                navigate('/logout');
              }}
              className="dropdown-item"
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