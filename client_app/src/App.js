import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import Shelters from "./Shelters";
import Shifts from "./Shifts";

import "./App.css";

function App() {
  return (
    <div>
      <Router>
        <div class="main-nav">
          <Link to="/">Home</Link>
          <Link to="/shelters">Shelters</Link>
        </div>
        <div class="navbar-buffer"></div>
        <Routes>
          <Route exact path="/" element={<Shifts />} />
          <Route path="/shelters" element={<Shelters />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
