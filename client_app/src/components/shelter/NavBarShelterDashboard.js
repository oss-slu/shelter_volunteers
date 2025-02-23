// client_app/src/components/shelter/NavBarShelterDashboard.js
import React, { useState, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";
import "../../styles/NavBar.css";
import { useLocation } from "react-router-dom";

function CustomNavBarShelter({ auth }) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Navbar collapseOnSelect expand="lg" sticky="top" data-bs-theme="dark">
      <Navbar.Brand href="/shelter-dashboard">Shelter Dashboard</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="justify-content-end" style={{ width: "100%" }}>
          {isAuthenticated || auth ? (
            <>
              <Nav.Link
                href="/shelter-dashboard"
                active={location.pathname === "/shelter-dashboard"}
              >
                Shelter Dashboard
              </Nav.Link>
              <Nav.Link
                href="/shift-details"
                active={location.pathname === "/shift-details"}
              >
                Shift Details
              </Nav.Link>
              {/* Link to the new schedule interface */}
              <Nav.Link
                href="/set-shifts"
                active={location.pathname === "/set-shifts"}
              >
                Set Shifts
              </Nav.Link>
              <Nav.Link
                href="/upcoming-requests"
                active={location.pathname === "/upcoming-requests"}
              >
                Upcoming Shifts
              </Nav.Link>
              <Nav.Link href="/logout">Sign Out</Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link href="/">Sign in</Nav.Link>
              <Nav.Link href="/signup">Sign up</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default CustomNavBarShelter;
