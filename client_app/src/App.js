import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import logo from "./Assets/gethelplogo.png";

import { PastShifts, UpcomingShifts } from "./Shifts";
import Shelters from "./Shelters";
import VolunteerDashboard from "./VolunteerDashboard";
import ShelterDashboard from "./ShelterDashboard";

import "./App.css";

function App() {
  return (
    <div>
      <Router>
        <div class="main-nav">
          <Link to="/">
            <img class="logo" src={logo} alt="GetHelp Logo" />
          </Link>
          <Link to="/shelters">Shelters</Link>
          <Link to="/past-shifts">Previous Shifts</Link>
          <Link to="/upcoming-shifts">Upcoming Shifts</Link>
          <Link to="/shelter-dashboard">Shelter Dashboard</Link>
        </div>
        <div class="navbar-buffer"></div>
        <Routes>
          <Route exact path="/" element={<VolunteerDashboard />} />
          <Route path="/shelters" element={<Shelters />} />
          <Route path="/past-shifts" element={<PastShifts />} />
          <Route path="/upcoming-shifts" element={<UpcomingShifts />} />
          <Route path="/shelter-dashboard" element={<ShelterDashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
