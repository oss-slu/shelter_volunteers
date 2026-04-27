import { useEffect, useState } from "react";
import navigationConfig from "./NavigationConfig";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom"; 
import { useDashboards, useCurrentDashboard, useSidebar } from '../contexts/DashboardContext';
import { DashboardSelector } from './DashboardSelector';
import { SidebarButton } from "./SidebarButton";
export const Sidebar = () => {
  const [activeItem, setActiveItem] = useState(null);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar(); 
  const {currentDashboard, onSelectDashboard} = useCurrentDashboard();
  const {dashboards} = useDashboards();
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
    if (idx >= 0) {
      setActiveItem(idx);
    } else if (location.pathname.startsWith("/volunteer-dashboard")) {
      setActiveItem(null);
    }
  }, [location.pathname, menuItems, currentDashboard]);

  console.log("Is sidebar open:", isSidebarOpen);
  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            display: window.innerWidth < 768 ? 'block' : 'none'
          }}
          onClick={()=>{setIsSidebarOpen(false)}}
        >
          <FontAwesomeIcon 
            icon={faXmark} 
          />
        </div>
      )}
      {/* Sidebar */}
      <div className={isSidebarOpen ? 'sidebar open' : 'sidebar'}>
        {/* Header */}
        {isSidebarOpen && (
        <div className="header no-border">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <SidebarButton />
            <DashboardSelector
              dashboards={dashboards}
              currentDashboard={currentDashboard}
              onSelectDashboard={onSelectDashboard}
            />
          </div>
        </div>)}
        {/* Navigation */}
        {isSidebarOpen && (
          <nav style={{ flex: '1', padding: '1rem' }}>
            {menuItems.map((item, index) => {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setActiveItem(index);
                    navigate(item.path.replace(":ID", currentDashboard.id || ""));
                  }}
                  className={`nav-button ${activeItem === index ? 'active' : ''}`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>)}
      </div>
    </>
  );
};
