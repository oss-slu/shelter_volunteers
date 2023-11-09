import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PastShifts, UpcomingShifts } from "./Shifts";
import Shelters from "./Shelters";
import VolunteerDashboard from "./VolunteerDashboard";
import NavBar from "./Components/NavBar";
import Login from "./Login";
import useToken from "./useToken";

import "./App.css";
function App() {

  // get authentication token
  localStorage.clear();
  const { token, setToken } = useToken();
  if(!token) {
    return <Login setToken={setToken} />
  }

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
