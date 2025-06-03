import { is } from 'date-fns/locale';
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [dashboards, setDashboards] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const value = {
    currentDashboard,
    setCurrentDashboard,
    dashboards,
    setDashboards,
    onSelectDashboard: (dashboard) => handleSelectDashboard(dashboard),
    isSidebarOpen,
    setIsSidebarOpen,
  };
  const handleSelectDashboard = (dashboard) => {
    setCurrentDashboard(dashboard);
    navigate(dashboard.path);
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use the context
export const useCurrentDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within an DashboardProvider');
  }
  console.log("returning currentDashboard:", context.currentDashboard);
  return {
    currentDashboard: context.currentDashboard,
    onSelectDashboard: context.onSelectDashboard,
  }
};

export const useDashboards = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboards must be used within an DashboardProvider');
    }
    return {
        dashboards: context.dashboards,
        setDashboards: context.setDashboards,
    };
}

export const useSidebar = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useSidebar must be used within an DashboardProvider');
  }
  return {
    isSidebarOpen: context.isSidebarOpen,
    setIsSidebarOpen: context.setIsSidebarOpen,
  };
};