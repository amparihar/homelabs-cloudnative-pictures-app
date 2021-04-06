import React, { useContext, useEffect } from "react";
import { Switch, Route, Redirect, withRouter } from "react-router-dom";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faLock,
  faUser,
  faEnvelope,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/Home";
import {
  ProtectedRoute,
  SignInPage,
  SignUpPage,
  VerifyAccountPage,
  WelcomePage,
} from "./components/auth";
import { PicturePage } from "./components/picture";
import { PictureGalleryPage } from "./components/gallery/PictureGallery";
import { AuthContext } from "./shared";

library.add(faLock, faUser, faEnvelope, faUpload);

export const App = withRouter(({ history }) => {
  const { authState, setAuthState } = useContext(AuthContext);

  useEffect(() => {
    const storageHandler = (e) => {
      if (
        authState &&
        authState.user &&
        e.key === authState.user.userDataKey &&
        e.oldValue &&
        !e.newValue
      ) {
        setAuthState((prev) => ({ ...prev, user: null, signedIn: false }));
        history.push("/signin");
      }
    };
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener("storage", storageHandler);
    };
  }, [authState, history, setAuthState]);

  return (
    <div>
      {authState.signedIn && (
        <Header nav={(props) => <Navbar {...props}></Navbar>} />
      )}
      <div>
        <Switch>
          <Route exact path="/" render={(props) => <Redirect to="/signin" />} />
          <Route
            exact
            path="/signin"
            render={(props) => <SignInPage {...props} />}
          />
          <Route exact path="/signup" component={SignUpPage} />
          <Route exact path="/verifyaccount" component={VerifyAccountPage} />
          <Route exact path="/welcome" component={WelcomePage} />
          <ProtectedRoute exact path="/home" component={HomePage} />
          <ProtectedRoute
            exact
            path="/gallery"
            component={PictureGalleryPage}
          />
          <ProtectedRoute exact path="/picture" component={PicturePage} />
        </Switch>
      </div>
    </div>
  );
});
