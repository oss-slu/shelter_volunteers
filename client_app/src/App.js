import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PastShifts, UpcomingShifts } from "./Shifts";
import Shelters from "./Shelters";
import VolunteerDashboard from "./VolunteerDashboard";
import NavBar from "./Components/NavBar";


import "./App.css";

function App() {
  return (
    <>      
      <Router>
        <NavBar/>
        <Routes>
          <Route path="/" element={<VolunteerDashboard />} />
          <Route path="/shelters" element={<Shelters />} />
          <Route path="/past-shifts" element={<PastShifts />} />
          <Route path="/upcoming-shifts" element={<UpcomingShifts />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
