import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./NavBar.css";
import { HamburgerMenuClose, HamburgerMenuOpen } from "./Icons";

function NavBar() {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <NavLink exact to="/" className="nav-logo">
            <span>Shelter Volunteers</span>
          </NavLink>

          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <NavLink
                exact
                to="/"
                activeClassName="active"
                className="nav-links"
                onClick={handleClick}
              >
                Your Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/shelters"
                activeClassName="active"
                className="nav-links"
                onClick={handleClick}
              >
                Sign up For Shifts
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/upcoming-shifts"
                activeClassName="active"
                className="nav-links"
                onClick={handleClick}
              >
                Your Upcoming Shifts
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/past-shifts"
                activeClassName="active"
                className="nav-links"
                onClick={handleClick}
              >
                Your Previous Shifts
              </NavLink>
            </li>
          </ul>
          <div className="nav-icon" onClick={handleClick}>
            {!click ? (
              <span className="icon">
                <HamburgerMenuOpen />{" "}
              </span>
            ) : (
              <span className="icon">
                <HamburgerMenuClose />
              </span>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
