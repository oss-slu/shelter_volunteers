import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PastShifts, UpcomingShifts } from "./components/volunteer/Shifts";
import Shelters from "./components/volunteer/Shelters";
import VolunteerDashboard from "./components/volunteer/VolunteerDashboard";
import NavBarVolunteerDashboard from "./components/volunteer/NavBarVolunteerDashboard";
import NavBarShelterDashboard from "./components/shelter/NavBarShelterDashboard";
import Login from "./components/authentication/Login";
import Logout from "./components/authentication/Logout";
import SignUp from "./components/authentication/SignUp";
import ProtectedRoute from "./ProtectedRoute";
import { useState } from "react";
import ShelterDashboard from "./components/shelter/ShelterDashboard";
import RequestForHelp from "./components/shelter/RequestForHelp";
import { ShiftDetails } from "./components/shelter/ShiftDetails";
import UpcomingRequests from "./components/shelter/UpcomingRequests";
import "./styles/App.css";
import HomeDashboard from "./components/HomeDashboard";

function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem("token"));

  return (
    <>
      <Router>
        {["/shelter-dashboard", "/shift-details", "/request-for-help", "/upcoming-requests"].includes(
          window.location.pathname,
        ) ? (
          <NavBarShelterDashboard auth={auth} />
        ) : (
          <NavBarVolunteerDashboard auth={auth} />
        )}
        <Routes>
          <Route path = "/" element={<HomeDashboard />} />
          <Route path="/volunteer-login" element={<Login setAuth={setAuth} />} />
          <Route path="/shelter-login" element={<ShelterDashboard />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<VolunteerDashboard />} />
            <Route path="/shelters" element={<Shelters />} />
            <Route path="/past-shifts" element={<PastShifts />} />
            <Route path="/upcoming-shifts" element={<UpcomingShifts />} />
            <Route path="/upcoming-requests" element={<UpcomingRequests />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/shelter-dashboard" element={<ShelterDashboard />} />
            <Route path="/shift-details" element={<ShiftDetails />} />
            <Route path="/request-for-help" element={<RequestForHelp />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
