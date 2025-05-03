
import { NavLink } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

import "../../styles/NavBar.css";

function NavBarVolunteerDashboard() {
  // Build the base path for this specific shelter's dashboard
  const volunteerBasePath = '/volunteer-dashboard'
  return (
    <Navbar collapseOnSelect expand="lg" sticky="top" data-bs-theme="dark">
      <NavLink to={'/home'} className="navbar-brand">
        <FontAwesomeIcon icon={faHome} className="home-icon" />
      </NavLink>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="justify-content-end" style={{ width: "100%" }}>
          <Nav.Item>
            <NavLink 
              to={volunteerBasePath}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              end // Only match this exact path
            >
              Volunteer Dashboard
            </NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink 
              to={`${volunteerBasePath}/shelters`}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Sign Up for Shifts
            </NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink 
              to={`${volunteerBasePath}/upcoming-shifts`}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Your Upcoming Commitments
            </NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink 
              to={`${volunteerBasePath}/past-shifts`}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Your Past Commitments
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

export default NavBarVolunteerDashboard;

