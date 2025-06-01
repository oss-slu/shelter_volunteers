import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useState } from "react";

// Volunteer dashboard components
import { PastCommitments, UpcomingCommitments } from "./components/volunteer/Commitments";
import Shelters from "./components/volunteer/Shelters";
import VolunteerDashboardLayout from "./components/volunteer/VolunteerDashboardLayout";
import VolunteerDashboard from "./components/volunteer/VolunteerDashboard";
import Impact from "./components/volunteer/Impact";

// Common components
import HomeDashboard from "./components/HomeDashboard"
import Logout from "./components/authentication/Logout";
import SignUp from "./components/authentication/SignUp";
import ProtectedRoute from "./ProtectedRoute";

// Shelter dashboard components
import AddUserForm from "./components/shelter/AddUserForm";
import ShelterDashboardLayout from "./components/shelter/ShelterDashboardLayout";
import ShelterDashboard from "./components/shelter/ShelterDashboard";
import RequestForHelp from "./components/shelter/RequestForHelp";
import UpcomingShifts from "./components/shelter/UpcomingShifts";
import Settings from "./components/shelter/Settings";
import Schedule from "./components/shelter/Schedule"; 
import RepeatableShifts from "./components/shelter/RepeatableShifts";

// Admin dashboard components
import AdminDashboard from "./components/admin/AdminDashboard";
import "./styles/App.css";

function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem("token"));
  return (<Router>
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<HomeDashboard setAuth={setAuth} auth={auth} />} />
      <Route path="/signup" element={<SignUp />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/shelter-dashboard/:shelterId" element={<ShelterDashboardLayout />}>
          <Route index element={<ShelterDashboard />} />
          <Route path="settings" element={<Settings />} /> 
          <Route path="schedule" element={<Schedule />} />
          <Route path="request-for-help" element={<RequestForHelp />} />
          <Route path="upcoming-shifts" element={<UpcomingShifts />} />
          <Route path="repeatable-shifts" element={<RepeatableShifts />} />
          <Route path="users" element={<AddUserForm />} />
        </Route>
        <Route path="/volunteer-dashboard" element={<VolunteerDashboardLayout />}>
          <Route index element={<VolunteerDashboard />} />
          <Route path="shelters" element={<Shelters />} />
          <Route path="past-shifts" element={<PastCommitments />} />
          <Route path="upcoming-shifts" element={<UpcomingCommitments />} />
          <Route path="impact" element={<Impact />} />
        </Route>
        <Route path="/logout" element={<Logout setAuth={setAuth} />} />
      </Route>
    </Routes>
  </Router>);
}

export default App;
