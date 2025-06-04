import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

export const DashboardSelector = ({ dashboards, currentDashboard, onSelectDashboard }) => {
  const [isOpen, setIsOpen] = useState(false);
  console.log("DashboardSelector rendered with dashboards:", dashboards);
  if (dashboards.length <= 1) return null;
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          color: '#374151',
          minWidth: '12rem'
        }}
      >
        {currentDashboard ? currentDashboard.name : 'Select Dashboard'}
        <FontAwesomeIcon icon={faChevronDown} />
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 50,
          marginTop: '0.25rem'
        }}>
          {dashboards.map((dashboard) => (
            <button
              key={`${dashboard.type}-${dashboard.id}`}
              onClick={() => {
                onSelectDashboard(dashboard);
                setIsOpen(false);
              }}
              className={`dropdown-item ${currentDashboard?.id === dashboard.id ? 'active' : ''}`}
            >
              {dashboard.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};