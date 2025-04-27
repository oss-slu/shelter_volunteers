
// client_app/src/components/shelter/NavBarShelterDashboard.js
import { NavLink, useParams } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";
import "../../styles/NavBar.css";

function NavBarShelterDashboard() {
  // Get the resource ID from the current URL
  const { shelterId } = useParams();

  // Build the base path for this specific shelter's dashboard
  const shelterBasePath = shelterId ? `/shelter-dashboard/${shelterId}` : '/shelter-dashboard';
  console.log("Base path is " + shelterBasePath);
  return (
    <Navbar collapseOnSelect expand="lg" sticky="top" data-bs-theme="dark">
      <NavLink to={shelterBasePath} className="navbar-brand">Shelter Dashboard</NavLink>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="justify-content-end" style={{ width: "100%" }}>
          <Nav.Item>
            <NavLink 
              to={shelterBasePath}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              end // Only match this exact path
            >
              Shelter Dashboard
            </NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink 
              to={`${shelterBasePath}/shift-details`}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Shift Details
            </NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink 
              to={`${shelterBasePath}/schedule`}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Schedule Shifts
            </NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink 
              to={`${shelterBasePath}/upcoming-requests`}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Upcoming Shifts
            </NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink 
              to="/logout" 
              className="nav-link"
            >
              Sign Out
            </NavLink>
          </Nav.Item>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBarShelterDashboard;

