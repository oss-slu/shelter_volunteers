import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle, faChevronDown, faHouse } from '@fortawesome/free-solid-svg-icons';
import { useSidebar } from '../contexts/DashboardContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {useCurrentDashboard} from '../contexts/DashboardContext';
import { SidebarButton } from "./SidebarButton";
import { DashboardSelector } from './DashboardSelector';
import AppBrand from './AppBrand';
import UserAvatar from './UserAvatar';

export const Header = ({user}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const {isSidebarOpen} = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const {currentDashboard} = useCurrentDashboard();

  // Home of the dashboard the user is in (e.g. /volunteer-dashboard); the
  // dashboard picker at "/" when no dashboard is selected.
  const dashboardHomePath = currentDashboard?.path || '/';

  const handleProfileClick = () => {
    const onVolunteerRoutes =
      location.pathname.startsWith('/volunteer-dashboard') ||
      currentDashboard?.type === 'volunteer';
    // Navigate before closing the menu. Closing first unmounts this control and can
    // cancel React Router's navigation on subsequent clicks.
    navigate(onVolunteerRoutes ? '/volunteer-dashboard/profile' : dashboardHomePath);
    setUserMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        {!isSidebarOpen && <SidebarButton />}
        <AppBrand to={dashboardHomePath} />
        {currentDashboard && !isSidebarOpen && (
          <>
            <span className="header-divider" aria-hidden="true" />
            <DashboardSelector />
          </>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="dropdown-menu-button"
          aria-haspopup="menu"
          aria-expanded={userMenuOpen}
        >
          <UserAvatar user={user} />
          <span className="dropdown-name user-display-name">{user?.name}</span>
          <FontAwesomeIcon icon={faChevronDown} />
        </button>
        {userMenuOpen && (
          <div className="dropdown-menu-item" role="menu">
            <div className="dropdown-header">{user?.email}</div>
            <button
              type="button"
              className="dropdown-item"
              role="menuitem"
              onClick={handleProfileClick}
            >
              <FontAwesomeIcon icon={faUserCircle} />
              View Profile
            </button>
            <button
              type="button"
              role="menuitem"
              className="dropdown-item"
              onClick={() => {
                navigate('/');
                setUserMenuOpen(false);
              }}
            >
              <FontAwesomeIcon icon={faHouse} />
              All Dashboards
            </button>
            <button
              type="button"
              role="menuitem"
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
