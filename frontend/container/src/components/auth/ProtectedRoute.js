import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import { AuthContext } from "../../shared";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { authState } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (authState.signedIn) {
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
