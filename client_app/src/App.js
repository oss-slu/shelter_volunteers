import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PastShifts, UpcomingShifts } from "./Shifts";
import Shelters from "./Shelters";
import VolunteerDashboard from "./VolunteerDashboard";
import NavBar from "./Components/NavBar";
import Login from "./Components/authentication/Login";
import Logout from "./Components/authentication/Logout";
import SignUp from "./Components/authentication/SignUp";
import ProtectedRoute from "./ProtectedRoute";

import "./App.css";

function App() {
  return (
    <>      
      <Router>
        <NavBar/>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<VolunteerDashboard />} />
              <Route path="/shelters" element={<Shelters />} />
              <Route path="/past-shifts" element={<PastShifts />} />
              <Route path="/upcoming-shifts" element={<UpcomingShifts />} />
              <Route path="/logout" element={<Logout />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
