import React,{useState,useEffect,useContext} from "react";
import { Navbar, Nav} from 'react-bootstrap';
import "./NavBar.css"
import { useLocation } from 'react-router-dom';

function CustomNavBar({ auth }) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {

    const token = localStorage.getItem('token');
  
    if(token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  
  }, []);
  return (
    <>
      <Navbar collapseOnSelect expand="lg" sticky="top" data-bs-theme="dark">
          <Navbar.Brand href="/">Volunteer Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="justify-content-end" style={{ width: "100%" }}>
              {(isAuthenticated || auth) ? (
                <>
                <Nav.Link href="/" active={location.pathname === "/dashboard"}>Your Dashboard</Nav.Link>
                <Nav.Link href="/shelters" active={location.pathname === "/shelters"}>Sign Up For Shifts</Nav.Link>
                <Nav.Link href="/upcoming-shifts" active={location.pathname === "/upcoming-shifts"}>Your Upcoming Shifts</Nav.Link>  
                <Nav.Link href="/past-shifts" active={location.pathname === "/past-shifts"}>Your Previous Shifts</Nav.Link>
                <Nav.Link href="/logout">Sign Out</Nav.Link>
                </>):(
                  <>
                  <Nav.Link href="/">Sign in</Nav.Link>
                  <Nav.Link href="/signup">Sign up</Nav.Link>
                  </>
                )
              }
            </Nav>
          </Navbar.Collapse>
      </Navbar>
    </>
  );
}

export default CustomNavBar;