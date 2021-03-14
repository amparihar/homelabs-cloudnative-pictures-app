import React from "react";
import { withRouter } from "react-router-dom";

const HeaderStyle = {
  backgroundColor: "#282c34",
  minHeight: "75px",
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
  justifyContent: "left",
  fontSize: "calc(10px + 2vmin)",
  color: "white",
};

const Header = ({ children }) => {
  return <header>{children}</header>;
};

export default withRouter(Header);
