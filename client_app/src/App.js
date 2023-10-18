import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import { PastShifts, UpcomingShifts } from "./Shifts";
import Shelters from "./Shelters";

import "./App.css";

function App() {
  return (
    <div>
      <Router>
        <div class="main-nav">
          <Link to="/">Home</Link>
          <Link to="/shelters">Shelters</Link>
          <Link to="/past-shifts">Previous Shifts</Link>
        </div>
        <div class="navbar-buffer"></div>
        <Routes>
          <Route exact path="/" element={<UpcomingShifts />} />
          <Route path="/shelters" element={<Shelters />} />
          <Route path="/past-shifts" element={<PastShifts />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
