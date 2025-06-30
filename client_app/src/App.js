import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useState } from "react";

// Volunteer dashboard components
import Commitments from "./components/volunteer/Commitments";
import PastCommitments from "./components/volunteer/PastCommitments";
import Impact from "./components/volunteer/Impact";
import VolunteerShiftSignup from "./components/volunteer/ShiftSignUp";

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
  return (<div key={auth}>
    <Router >
      <DashboardProvider auth={auth}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={
            <HomeDashboard 
              setAuth={setAuth}
              auth={auth}/>} 
            />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin-dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardContent />} />
              <Route path="shelters" element={<AdminDashboard />} />
            </Route>
            <Route path="/shelter-dashboard/:shelterId" element={<DashboardLayout />}>
              <Route index element={<DashboardContent />} />
              <Route path="settings" element={<Settings />} /> 
              <Route path="schedule" element={<Schedule />} />
              <Route path="request-for-help" element={<RequestForHelp />} />
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
            </Route>
            <Route path="/logout" element={<Logout setAuth={setAuth} />} />
          </Route>
        </Routes>
      </DashboardProvider>
    </Router>
  </div>);
}

export default App;
