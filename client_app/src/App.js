import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useState } from "react";

// Volunteer dashboard components
import { PastCommitments, UpcomingCommitments } from "./components/volunteer/Commitments";
import Shelters from "./components/volunteer/Shelters";
import Impact from "./components/volunteer/Impact";

// Common components
import { getUser } from "./authentication/user";
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
  const [currentUser, setCurrentUser] = useState(getUser());
  console.log("Current user:", currentUser);
  return (<Router >
    <DashboardProvider auth={auth}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={
          <HomeDashboard 
            setAuth={setAuth}
            auth={auth}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}/>} 
          />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin-dashboard" element={<DashboardLayout user={currentUser}/>}>
            <Route index element={<DashboardContent />} />
            <Route path="shelters" element={<AdminDashboard />} />
          </Route>
          <Route path="/shelter-dashboard/:shelterId" element={<DashboardLayout user={currentUser}/>}>
            <Route index element={<DashboardContent />} />
            <Route path="settings" element={<Settings />} /> 
            <Route path="schedule" element={<Schedule />} />
            <Route path="request-for-help" element={<RequestForHelp />} />
            <Route path="upcoming-shifts" element={<UpcomingShifts />} />
            <Route path="repeatable-shifts" element={<RepeatableShifts />} />
            <Route path="users" element={<AddUserForm />} />
          </Route>
          <Route path="/volunteer-dashboard" element={<DashboardLayout user={currentUser} />}>
            <Route index element={<DashboardContent/>} />
            <Route path="shelters" element={<Shelters />} />
            <Route path="past-shifts" element={<PastCommitments />} />
            <Route path="upcoming-shifts" element={<UpcomingCommitments />} />
            <Route path="impact" element={<Impact />} />
          </Route>
          <Route path="/logout" element={<Logout setAuth={setAuth} />} />
        </Route>
      </Routes>
    </DashboardProvider>
  </Router>);
}

export default App;
