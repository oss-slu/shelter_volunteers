import { useState } from "react";
import navigationConfig from "./NavigationConfig";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export const Sidebar = ({ dashboard, isOpen, onClose }) => {
  const [activeItem, setActiveItem] = useState(0);
  
  if (!dashboard) return null;
  
  const menuItems = navigationConfig[dashboard.type] || [];
  
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
      <div style={{
        position: 'fixed',
        left: isOpen ? '0' : '-16rem',
        top: '0',
        height: '100vh',
        width: '16rem',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        transition: 'left 0.3s ease-in-out',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0'
          }}>
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
