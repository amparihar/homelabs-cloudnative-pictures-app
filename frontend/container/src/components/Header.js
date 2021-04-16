import React from "react";

import "../styles/header-style.css"

export const Header = ({ nav, ...props }) => {
  return <>{nav(props)}</>;
};
