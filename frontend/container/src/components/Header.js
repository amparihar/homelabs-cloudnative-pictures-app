import React from "react";
import { withRouter } from "react-router-dom";

import "../styles/header-style.css"

export const Header = withRouter(({ nav, ...props }) => {
  return <>{nav(props)}</>;
});
