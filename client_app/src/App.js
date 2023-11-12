import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PastShifts, UpcomingShifts } from "./Shifts";
import Shelters from "./Shelters";
import VolunteerDashboard from "./VolunteerDashboard";
import NavBar from "./Components/NavBar";
import Login from "./authentication/Login";
import Logout from "./authentication/Logout";
import {ProtectedRoute} from "./ProtectedRoute";
import useToken from "./authentication/useToken";

import "./App.css";

function App() {
  // get authentication token
  const { token, setToken } = useToken();
  if(!token) {
    return <Login setToken={setToken} />
  }

  return (
    <>      
      <Router>
        <NavBar/>
        <Routes>
          <Route path="/" element={<ProtectedRoute><VolunteerDashboard /></ProtectedRoute>} />
          <Route path="/shelters" element={<ProtectedRoute> <Shelters /> </ProtectedRoute>} />
          <Route path="/past-shifts" element={<ProtectedRoute> <PastShifts /> </ProtectedRoute>} />
          <Route path="/upcoming-shifts" element={<ProtectedRoute> <UpcomingShifts /> </ProtectedRoute>} />
          <Route path="/logout" element={<ProtectedRoute> <Logout /> </ProtectedRoute>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
