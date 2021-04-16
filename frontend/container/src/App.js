import React, { useContext } from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faLock,
  faUser,
  faEnvelope,
  faUpload,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/Home";
import {
  ProtectedRoute,
  SignInPage,
  SignUpPage,
  SignOutPage,
  VerifyAccountPage,
  WelcomePage,
} from "./components/auth";
import { PicturePage } from "./components/picture";
import { PictureGalleryPage } from "./components/gallery/PictureGallery";

import { PageNotFound } from "./components/PageNotFound";
import { AuthContext } from "./shared";

library.add(faLock, faUser, faEnvelope, faUpload, faInfoCircle);

export const App = () => {
  const { authState } = useContext(AuthContext);

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
          <Route exact path="/signout" component={SignOutPage} />
          <Route component={PageNotFound} />
        </Switch>
      </div>
    </div>
  );
};
