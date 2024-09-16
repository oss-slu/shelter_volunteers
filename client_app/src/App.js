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
import MoreDetailsBox from "./components/shelter/MoreDetailsBox";
import "./styles/App.css";

function App() {
  const [auth, setAuth] = useState(false);
  return (
    <>
      <Router>
        {["/shelter-dashboard", "/shift-details", "/request-for-help", "/cancel-shifts"].includes(
          window.location.pathname,
        ) ? (
          <NavBarShelterDashboard auth={auth} />
        ) : (
          <NavBarVolunteerDashboard auth={auth} />
        )}
        <Routes>
          <Route path="/" element={<Login setAuth={setAuth} />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<VolunteerDashboard />} />
            <Route path="/shelters" element={<Shelters />} />
            <Route path="/past-shifts" element={<PastShifts />} />
            <Route path="/upcoming-shifts" element={<UpcomingShifts />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/shelter-dashboard" element={<ShelterDashboard />} />
            <Route path="/shift-details" element={<MoreDetailsBox />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
