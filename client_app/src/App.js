import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PastShifts, UpcomingShifts } from "./components/volunteer/Shifts";
import Shelters from "./components/volunteer/Shelters";
import VolunteerDashboard from "./components/volunteer/VolunteerDashboard"; // <-- Correct path: "volunteer"
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
import { useLocation } from "react-router-dom";
import Schedule from "./components/shelter/Schedule"; // <-- now a .jsx file

function NavigationControl({ auth }) {
  const location = useLocation();
  if (["/home", "/"].includes(location.pathname)) return null;
  if ([
    "/shelter-dashboard",
    "/shift-details",
    "/request-for-help",
    "/upcoming-requests",
    "/shelter-login",
  ].includes(location.pathname)) return <NavBarShelterDashboard auth={auth} />;
  return <NavBarVolunteerDashboard auth={auth} />;
}

function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem("token"));
  return (<Router>
    <NavigationControl auth={auth} />
    <Routes>
      <Route index element={<HomeDashboard />} />
      <Route path="/home" element={<HomeDashboard />} />
      <Route path="/volunteer-login" element={<Login setAuth={setAuth} userRole="volunteer" />} />
      <Route path="/shelter-login" element={<Login setAuth={setAuth} userRole="shelter" />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
        <Route path="/shelters" element={<Shelters />} />
        <Route path="/past-shifts" element={<PastShifts />} />
        <Route path="/upcoming-shifts" element={<UpcomingShifts />} />
        <Route path="/upcoming-requests" element={<UpcomingRequests />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/shelter-dashboard" element={<ShelterDashboard />} />
        <Route path="/shift-details" element={<ShiftDetails />} />
        <Route path="/request-for-help" element={<RequestForHelp />} />
        <Route path="/set-shifts" element={<Schedule />} />
      </Route>
    </Routes>
  </Router>);
}

export default App;

