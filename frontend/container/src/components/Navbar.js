import React from "react";
import { Link } from "react-router-dom";



const Navbar = ({ logoutAction, auth, ...props }) => {
  return (
    auth.isAuthenticated && (
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div id="navbarBasic" className="navbar-menu">
          <div className="navbar-start">
            <Link to="/home" className="navbar-item">
              Home
            </Link>
            <Link to="/pictures" className="navbar-item">
              Pictures
            </Link>
            <Link to="/admin" className="navbar-item">
              Admin
            </Link>
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                <Link to="/" className="button is-light" onClick={logoutAction}>
                  Log out
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  );
};

export default Navbar;
