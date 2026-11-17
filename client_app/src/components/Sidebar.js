import { useEffect, useState } from "react";
import navigationConfig from "./NavigationConfig";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faTableColumns } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useCurrentDashboard, useSidebar } from '../contexts/DashboardContext';
import { DashboardSelector } from './DashboardSelector';
import { SidebarButton } from "./SidebarButton";

const isSmallScreen = () => typeof window !== "undefined" && window.innerWidth < 768;

export const Sidebar = () => {
  const [activeItem, setActiveItem] = useState(null);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const {currentDashboard} = useCurrentDashboard();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (currentDashboard) {
      setMenuItems(navigationConfig[currentDashboard.type]);
    }
  }, [currentDashboard]);

  // Keep the highlighted tab in sync when the route changes (e.g. header "View Profile").
  useEffect(() => {
    if (!currentDashboard || menuItems.length === 0) return;
    const idx = menuItems.findIndex((item) => {
      const resolved = item.path.replace(":ID", currentDashboard.id || "");
      return (
        location.pathname === resolved ||
        location.pathname.startsWith(`${resolved}/`)
      );
    });
    setActiveItem(idx >= 0 ? idx : null);
  }, [location.pathname, menuItems, currentDashboard]);

  const go = (path) => {
    navigate(path);
    if (isSmallScreen()) setIsSidebarOpen(false);
  };
  const onDashboardHome =
    currentDashboard && location.pathname.replace(/\/+$/, '') === currentDashboard.path;

  return (
    <>
      {/* Backdrop behind the drawer on small screens (hidden by CSS on desktop) */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          aria-hidden="true"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={isSidebarOpen ? 'sidebar open' : 'sidebar'} aria-label="Dashboard navigation">
        {isSidebarOpen && (
          <div className="sidebar-top">
            <SidebarButton />
            <DashboardSelector />
          </div>
        )}
        {isSidebarOpen && (
          <nav className="sidebar-nav">
            <button type="button" className="nav-button" onClick={() => go('/')}>
              <FontAwesomeIcon icon={faHouse} />
              All Dashboards
            </button>
            {currentDashboard && (
              <button
                type="button"
                className={`nav-button ${onDashboardHome ? 'active' : ''}`}
                aria-current={onDashboardHome ? 'page' : undefined}
                onClick={() => go(currentDashboard.path)}
              >
                <FontAwesomeIcon icon={faTableColumns} />
                Dashboard Home
              </button>
            )}
            <hr className="nav-divider" />
            {menuItems.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setActiveItem(index);
                  go(item.path.replace(":ID", currentDashboard.id || ""));
                }}
                className={`nav-button ${activeItem === index ? 'active' : ''}`}
                aria-current={activeItem === index ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </aside>
    </>
  );
};
