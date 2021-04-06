import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import Amplify, { Auth } from "aws-amplify";
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
  API: {
    endpoints: [
      {
        name: config.api.name,
        endpoint: config.api.invokeUrl,
        path: config.api.path,
        custom_header: async () => {
          //   return { Authorization : 'token' }
          //   // Alternatively, with Cognito User Pools use this:
          //   // return { Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}` }
          // return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
          return {
            Authorization: `Bearer ${(await Auth.currentSession())
              .getIdToken()
              .getJwtToken()}`,
          };
        },
      },
    ],
  },
});

ReactDOM.render(
  <React.StrictMode>
    <AuthContextProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </AuthContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
