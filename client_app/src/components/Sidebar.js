import { useEffect, useState } from "react";
import navigationConfig from "./NavigationConfig";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom"; // Adjust import based on your routing library

export const Sidebar = ({ dashboard, isOpen, onClose }) => {
  const [activeItem, setActiveItem] = useState(0);
  console.log("Sidebar rendered with dashboard:", dashboard);

  if (!dashboard) return null;
  const menuItems = navigationConfig[dashboard.type] || [];
  const navigate = useNavigate(); // Initialize the navigate function
  useEffect(() => {
    if (activeItem) {
      const item = menuItems[activeItem];
      if (item && item.path) {
        // Navigate to the path if needed, e.g., using a router
        navigate(item.path.replace(':ID', dashboard.id || ''));
      }
    }
  }, [activeItem, dashboard.id, menuItems]);
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            display: window.innerWidth < 768 ? 'block' : 'none'
          }}
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <div className={isOpen ? 'sidebar open' : 'sidebar'}>
        {/* Header */}
        <div className="sidebar-header">
          <h2 className="dashboard-item">
            {dashboard.name}
          </h2>
          <button
            onClick={onClose}
              style={{
              padding: '0.25rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: '#6b7280',
              display: window.innerWidth < 768 ? 'block' : 'none'
            }}
          >
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>
        {/* Navigation */}
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
        </nav>
      </div>
    </>
  );
};
