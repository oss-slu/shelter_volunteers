import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons'; // <-- Import faUserCircle
import { useSidebar } from '../contexts/DashboardContext';
import { useNavigate } from 'react-router-dom';
import {useCurrentDashboard} from '../contexts/DashboardContext';
import { SidebarButton } from "./SidebarButton";
import { DashboardSelector } from './DashboardSelector';
export const Header = ({user}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const {isSidebarOpen} = useSidebar();
  const navigate = useNavigate();
  const {currentDashboard} = useCurrentDashboard();

  // Determine the base path for the current dashboard type (e.g., /volunteer-dashboard)
  const dashboardBasePath = currentDashboard ? 
    `/${currentDashboard.type}-dashboard${currentDashboard.type === 'shelter' ? `/${currentDashboard.id}` : ''}` 
    : '';

  const handleProfileClick = () => {
    // Navigate to the profile route, which is available only on volunteer dashboard in this context
    if (currentDashboard && currentDashboard.type === 'volunteer') {
      navigate('/volunteer-dashboard/profile'); 
    } else {
      // If we are on shelter/admin dashboard, we might redirect to a generic account page or home
      // For now, only allow navigation if the volunteer dashboard is active.
      // NOTE: You can expand this logic if shelter/admin profiles are introduced later.
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
            {/* NEW: Profile Link */}
            <button
              onClick={handleProfileClick}
              className="dropdown-item"
            >
              <FontAwesomeIcon icon={faUserCircle} />
              View Profile
            </button>    
            {/* Existing Logout Button */}
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
}
