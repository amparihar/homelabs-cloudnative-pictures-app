import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ logoutAction,  ...props }) => {
  return (
    <nav style={{ width: "100%", display: "table" }}>
        <ul>
          <li style={{ float: "left" }}>
            <Link to="/">Home</Link>
          </li>
          <li style={{ float: "left" }}>
            <Link to="/pictures">Pictures</Link>
          </li>
          <li style={{ float: "left" }}>
            <Link to="/admin">Admin</Link>
          </li>
          <li style={{ float: "right" }}>
            <Link to="/" onClick={logoutAction}>
              Log out
            </Link>
          </li>
        </ul>
      </nav>
  );
};

export default Navbar;
