import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons'; // <-- Import faUserCircle
import { useSidebar } from '../contexts/DashboardContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {useCurrentDashboard} from '../contexts/DashboardContext';
import { SidebarButton } from "./SidebarButton";
import { DashboardSelector } from './DashboardSelector';
export const Header = ({user}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const {isSidebarOpen} = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const {currentDashboard} = useCurrentDashboard();

  // Determine the base path for the current dashboard type (e.g., /volunteer-dashboard)
  const dashboardBasePath = currentDashboard ? 
    `/${currentDashboard.type}-dashboard${currentDashboard.type === 'shelter' ? `/${currentDashboard.id}` : ''}` 
    : '';

  const handleProfileClick = () => {
    const onVolunteerRoutes =
      location.pathname.startsWith('/volunteer-dashboard') ||
      currentDashboard?.type === 'volunteer';
    if (onVolunteerRoutes) {
      navigate('/volunteer-dashboard/profile');
    } else {
      navigate(dashboardBasePath || '/home');
    }
    setUserMenuOpen(false);
  };


  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isSidebarOpen && (
          <SidebarButton />
        )}
        {currentDashboard && !isSidebarOpen && (
          <DashboardSelector />
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <button
          type="button"
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
            {location.pathname.startsWith('/volunteer-dashboard') ? (
              <button
                type="button"
                className="dropdown-item"
                role="menuitem"
                onClick={() => {
                  // Navigate before closing the menu. Closing first unmounts this control and can
                  // cancel React Router's Link navigation on subsequent clicks.
                  navigate('/volunteer-dashboard/profile');
                  setUserMenuOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faUserCircle} />
                View Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProfileClick}
                className="dropdown-item"
              >
                <FontAwesomeIcon icon={faUserCircle} />
                View Profile
              </button>
            )}
            {/* Existing Logout Button */}
            <button
              type="button"
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
}
