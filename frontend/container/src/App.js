import React, { useContext } from "react";
import { Switch, Route, BrowserRouter, Redirect } from "react-router-dom";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faLock, faUser, faEnvelope, faUpload } from "@fortawesome/free-solid-svg-icons";

import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/Home";
import {
  ProtectedRoute,
  SignInPage,
  SignUpPage,
  WelcomePage,
} from "./components/auth";
import { AdminPage } from "./components/admin";
import { AuthContext } from "./shared";

library.add(faLock, faUser, faEnvelope, faUpload);

export const App = (props) => {
  const { authState } = useContext(AuthContext);
  return (
    <div>
      <BrowserRouter>
        {authState.signedIn && (
          <Header nav={(props) => <Navbar {...props}></Navbar>} />
        )}
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
              render={(props) => <SignInPage {...props} />}
            />
            <Route exact path="/signup" component={SignUpPage} />
            <Route exact path="/welcome" component={WelcomePage} />
            <ProtectedRoute exact path="/home" component={HomePage} />
            <ProtectedRoute exact path="/admin" component={AdminPage} />
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
};
