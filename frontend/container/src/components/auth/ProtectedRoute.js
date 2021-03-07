import React from "react";
import { Route } from "react-router-dom";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const {auth} = rest;
  return <Route {...rest} render={props => <Component {...props} auth={auth} />} />
};

export default ProtectedRoute;
