import React from "react";
import { withRouter } from "react-router-dom";

const Header = ({ nav, ...props }) => {
  return props.auth.isAuthenticated && <header>{nav(props)}</header>;
};

export default withRouter(Header);
