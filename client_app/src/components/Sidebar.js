import { useEffect, useState } from "react";
import navigationConfig from "./NavigationConfig";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom"; 
import { useCurrentDashboard, useSidebar } from "../contexts/DashboardContext"; 

export const Sidebar = () => {
  const [activeItem, setActiveItem] = useState(0);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar(); 
  const { currentDashboard } = useCurrentDashboard(); 
  console.log("Sidebar rendered with dashboard:", currentDashboard);

  if (!currentDashboard) return null;
  const menuItems = navigationConfig[currentDashboard.type] || [];
  const navigate = useNavigate(); // Initialize the navigate function
  useEffect(() => {
    if (activeItem) {
      const item = menuItems[activeItem];
      if (item && item.path) {
        // Navigate to the path if needed, e.g., using a router
        navigate(item.path.replace(':ID', currentDashboard.id || ''));
      }
    }
  }, [activeItem, currentDashboard.id, menuItems]);
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
        <div className="sidebar-header">
          <h2 className="dashboard-item">
            {currentDashboard.name}
          </h2>
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
