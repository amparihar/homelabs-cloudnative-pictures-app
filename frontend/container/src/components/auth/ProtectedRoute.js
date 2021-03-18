import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import { AuthContext } from "../../shared";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { auth } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (auth.verified) {
          return <Component {...props} />;
        } else {
          const redirectLocation = {
            pathname: "/signin",
            state: {
              referrer: props.location.pathname,
            },
          };
          return <Redirect to={redirectLocation} />;
        }
      }}
    />
  );
};

export default ProtectedRoute;
