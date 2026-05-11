import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
const DashboardContext = createContext();
import { permissionsAPI } from '../api/permission';
import { shelterAPI } from '../api/shelter';
import { useAuth } from './AuthContext';
export const DashboardProvider = ({ children }) => {
  const [dashboards, setDashboards] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loadingDashboards, setLoadingDashboards] = useState(true);
  const {isAuthenticated} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Keep selected dashboard aligned with the URL (SPA navigations do not always go through onSelectDashboard).
  useEffect(() => {
    if (dashboards.length === 0) return;
    const path = location.pathname;
    const matchingDashboard = dashboards.find(
      (d) => path === d.path || path.startsWith(`${d.path}/`)
    );
    setCurrentDashboard(matchingDashboard ?? null);
  }, [location.pathname, dashboards]);

  const value = {
    currentDashboard,
    setCurrentDashboard,
    dashboards,
    setDashboards,
    onSelectDashboard: (dashboard) => handleSelectDashboard(dashboard),
    isSidebarOpen,
    setIsSidebarOpen,
    loadingDashboards,
  };
  const handleSelectDashboard = (dashboard) => {
    setCurrentDashboard(dashboard);
    navigate(dashboard.path);
  };
  useEffect(() => {
    const fetchPermissions = async () => {
      if (dashboards.length > 0) {
        return; 
      }
      try {
        const permissions = await permissionsAPI.getPermissions();
        console.log(permissions);
        const fullAccess = permissions ? permissions.full_access: [];

        let systemAccess = false; 
        let shelterAccess = false;
        if (fullAccess) {
          shelterAccess = fullAccess.find(access => access.resource_type === "shelter");
          systemAccess = fullAccess.find(access => access.resource_type === "system");
        }
        let filteredShelterInfo = [];
        if (shelterAccess) {
          const sheltersInfoAll = await shelterAPI.getShelters();
          filteredShelterInfo = sheltersInfoAll.filter(shelter => shelterAccess.resource_ids.includes(shelter._id));
        }
        const newDashboards = [
          { type: "volunteer", id: "volunteer-dashboard", name: "Volunteer Dashboard", path: "/volunteer-dashboard" },
          ...(systemAccess ? [{ type: "admin", id: "admin-dashboard", name: "System Admin Dashboard", path: "/admin-dashboard" }] : []),
          ...filteredShelterInfo.map(shelter => ({ 
            type: "shelter", 
            id: shelter._id, 
            name: shelter.name, 
            path: `/shelter-dashboard/${shelter._id}`,
            details: shelter,
          })),
        ];
        setDashboards(newDashboards);
        setLoadingDashboards(false);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };
    fetchPermissions();
  }, [isAuthenticated]);

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
        loadingDashboards: context.loadingDashboards

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