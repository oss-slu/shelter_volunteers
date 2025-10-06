import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";

// Volunteer dashboard components
import Commitments from "./components/volunteer/Commitments";
import PastCommitments from "./components/volunteer/PastCommitments";
import Impact from "./components/volunteer/Impact";
import VolunteerShiftSignup from "./components/volunteer/ShiftSignUp";
import VolunteerProfile from "./components/volunteer/Profile"; // <-- NEW IMPORT

// Common components
import { DashboardProvider } from "./contexts/DashboardContext";
import HomeDashboard from "./components/HomeDashboard"
import DashboardLayout from "./components/DashboardLayout";
import DashboardContent from "./components/DashboardContent";
import Logout from "./components/authentication/Logout";
import SignUp from "./components/authentication/SignUp";
import ProtectedRoute from "./ProtectedRoute";

// Shelter dashboard components
import AddUserForm from "./components/shelter/AddUserForm";
import UpcomingShifts from "./components/shelter/UpcomingShifts";
import Settings from "./components/shelter/Settings";
import RepeatableShifts from "./components/shelter/RepeatableShifts";
import ShelterScheduleManager from "./components/shelter/ScheduleManager";
// Admin dashboard components
import AdminDashboard from "./components/admin/AdminDashboard";

import { setNavigate } from "./api/fetchClient";
import { useAuth, setGlobalLogout } from "./contexts/AuthContext";

function AppContent() {

  const navigate = useNavigate();
  const { logout } = useAuth();
  
  useEffect(() => {
    // Set the navigate function in fetchClient
    setNavigate(navigate);
    
    // Set the global logout function for fetchClient
    setGlobalLogout(logout);
  }, [navigate, logout]);


  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={
        <HomeDashboard />} 
        />
      <Route path="/signup" element={<SignUp />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin-dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardContent />} />
          <Route path="shelters" element={<AdminDashboard />} />
          <Route path="users" element={<AddUserForm resourceType="system" />} />
        </Route>
        <Route path="/shelter-dashboard/:shelterId" element={<DashboardLayout />}>
          <Route index element={<DashboardContent />} />
          <Route path="settings" element={<Settings />} /> 
          <Route path="schedule" element={<ShelterScheduleManager />} />
          <Route path="upcoming-shifts" element={<UpcomingShifts />} />
          <Route path="repeatable-shifts" element={<RepeatableShifts />} />
          <Route path="users" element={<AddUserForm />} />
        </Route>
        <Route path="/volunteer-dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardContent/>} />
          <Route path="shelters" element={<VolunteerShiftSignup />} />
          <Route path="past-shifts" element={<PastCommitments />} />
          <Route path="upcoming-shifts" element={<Commitments />} />
          <Route path="impact" element={<Impact />} />
          <Route path="profile" element={<VolunteerProfile />} /> {/* <-- NEW ROUTE */}
        </Route>
        <Route path="/logout" element={<Logout />} />
      </Route>
    </Routes>
  );
}
function App() {
  return (<div>
    <Router >
      <AuthProvider>
        <DashboardProvider>
          <AppContent />
        </DashboardProvider>
      </AuthProvider>
    </Router>
  </div>);
}

export default App;
