import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useDashboards, useCurrentDashboard } from '../contexts/DashboardContext';
export const DashboardSelector = () => {
  const {currentDashboard, onSelectDashboard} = useCurrentDashboard();
  const {dashboards} = useDashboards();
  const [isOpen, setIsOpen] = useState(false);
  console.log("DashboardSelector rendered with dashboards:", dashboards);
  if (dashboards.length < 1) return null;
  
  return (
    <div style={{ position: 'relative' }}>
      {dashboards.length > 1 && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='dropdown-menu-button dropdown-name'
        >
          {currentDashboard ? currentDashboard.name : 'Select Dashboard'}
          {dashboards.length > 1 ? <FontAwesomeIcon icon={faChevronDown}/> : null}
        </button>
      )}
      {dashboards.length === 1 && (
        <span className='dropdown-name'>
          {dashboards[0].name}
        </span>
      )}
      {isOpen && dashboards.length > 1 && (
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