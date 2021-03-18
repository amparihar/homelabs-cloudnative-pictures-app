import React from "react";
import { withRouter } from "react-router-dom";

export const Header = withRouter(({ nav, ...props }) => {
  return (
    <section className="section main">
      <header>{nav(props)}</header>;
    </section>
  );
});
