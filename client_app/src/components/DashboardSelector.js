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
        className='dropdown-menu-button dropdown-name'
      >
        {currentDashboard ? currentDashboard.name : 'Select Dashboard'}
        <FontAwesomeIcon icon={faChevronDown} />
      </button>
      {isOpen && (
        <div className="dropdown-menu-item left">
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