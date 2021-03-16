import React, { useState } from "react";
import { Switch, Route, BrowserRouter, Redirect } from "react-router-dom";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faLock, faUser, faEnvelope } from "@fortawesome/free-solid-svg-icons";

import "./App.css";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import { HomePage } from "./components/home";
import { ProtectedRoute, SignInPage, SignUpPage } from "./components/auth";

library.add(faLock, faUser, faEnvelope);

function App({ location, ...props }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
  });

  const handleSignIn = () => {
    setAuth((auth) => ({ isAuthenticated: true }));
  };

  const handleSignUp = () => {};

  const handleLogout = () => {
    setAuth((auth) => ({ isAuthenticated: false }));
  };

  return (
    <div>
      <BrowserRouter>
        {auth.isAuthenticated && <Redirect to="/home" />}
        <Header
          logoutAction={handleLogout}
          auth={auth}
          nav={(props) => <Navbar {...props}></Navbar>}
        />
        <div>
          <Switch>
            <Route
              exact
              path="/"
              render={(props) => <Redirect to="/signin" />}
            />
            <Route
              exact
              path="/signin"
              render={(props) => (
                <SignInPage {...props} signInAction={handleSignIn} />
              )}
            />
            <Route exact path="/signup" component={SignUpPage} />
            <ProtectedRoute
              exact
              path="/home"
              component={HomePage}
              auth={auth}
            />
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
