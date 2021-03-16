import React from "react";
import { withRouter } from "react-router-dom";

const Header = ({ nav, ...props }) => {
  return (
    props.auth.isAuthenticated && (
      <section className="section main">
        <header>{nav(props)}</header>;
      </section>
    )
  );
};

export default withRouter(Header);
