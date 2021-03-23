import React from "react";
import ReactDOM from "react-dom";
import Amplify, { Auth, Storage } from "aws-amplify";
import { ToastProvider } from "react-toast-notifications";

import "./index.css";
import * as config from "./config.json";
import { App } from "./App";
import { AuthContextProvider } from "./shared";

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
  },
  Storage: {
    region: config.cognito.REGION,
    bucket: config.s3.bucket,
  },
});

ReactDOM.render(
  <React.StrictMode>
    <AuthContextProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
