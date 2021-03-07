import React, { useState } from "react";
import { Switch, Route, BrowserRouter, Redirect } from "react-router-dom";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faLock, faUser } from "@fortawesome/free-solid-svg-icons";

import Header from "./components/Header";
import Navbar from "./components/Navbar";
import { HomePage } from "./components/home";
import { ProtectedRoute, SignInPage } from "./components/auth";

library.add(faLock, faUser);

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
    <div className="App">
      <BrowserRouter>
        {auth.isAuthenticated && <Redirect to="/home" />}
        <Header>
          <Navbar logoutAction={handleLogout} auth={auth}></Navbar>
        </Header>
        <Switch>
          <Route
            exact
            path="/"
            render={(props) => (
              <SignInPage {...props} signInAction={handleSignIn} />
            )}
          ></Route>
          {/* <Route
            exact
            path="/"
            component={SignInPage}
            signInAction={handleSignIn}
          /> */}
          <ProtectedRoute exact path="/home" component={HomePage} auth={auth} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
