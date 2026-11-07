import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useDashboards, useCurrentDashboard } from '../contexts/DashboardContext';
export const DashboardSelector = () => {
  const {currentDashboard, onSelectDashboard} = useCurrentDashboard();
  const {dashboards} = useDashboards();
  const [isOpen, setIsOpen] = useState(false);
  if (dashboards.length < 1) return null;

  const label = currentDashboard ? currentDashboard.name : 'Select Dashboard';

  return (
    <div className="dashboard-selector">
      {dashboards.length > 1 && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="dropdown-menu-button dropdown-name"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          title={label}
        >
          <span className="dashboard-selector-label">{label}</span>
          <FontAwesomeIcon icon={faChevronDown}/>
        </button>
      )}
      {dashboards.length === 1 && (
        <span className="dropdown-name" title={dashboards[0].name}>
          {dashboards[0].name}
        </span>
      )}
      {isOpen && dashboards.length > 1 && (
        <div className="dropdown-menu-item left" role="menu">
          {dashboards.map((dashboard) => (
            <button
              type="button"
              role="menuitem"
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
