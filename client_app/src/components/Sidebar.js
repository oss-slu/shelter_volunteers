import { useEffect, useState } from "react";
import navigationConfig from "./NavigationConfig";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom"; 
import { useDashboards, useCurrentDashboard, useSidebar } from '../contexts/DashboardContext';
import { DashboardSelector } from './DashboardSelector';
import { SidebarButton } from "./SidebarButton";
export const Sidebar = () => {
  const [activeItem, setActiveItem] = useState(null);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar(); 
  const {currentDashboard, onSelectDashboard} = useCurrentDashboard();
  const {dashboards} = useDashboards();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (currentDashboard) {
      if (activeItem && menuItems.length > 0) {
        const item = menuItems[activeItem];
        if (item && item.path) {
          // Navigate to the path if needed, e.g., using a router
          navigate(item.path.replace(':ID', currentDashboard.id || ''));
        }
      }
    }
  }, [activeItem, menuItems, navigate]);

  useEffect(() => {
    if (currentDashboard) {
      setMenuItems(navigationConfig[currentDashboard.type]);
    }
  }, [currentDashboard]);

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
                  onClick={() => setActiveItem(index)}
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
