import React from "react";
import { Link, withRouter } from "react-router-dom";

const Welcome = ({ history, location, ...props }) => {
  const {
    state: { username = "" },
  } = location || {};

  setTimeout(() => {
    history.push("/signin");
  }, 5000);

  return (
    <section className="section auth">
      <div className="container">
        <h1 className="title">Welcome! {username} </h1>
        <p>You have successfully registered a new account.</p>
        <p>
          You will be redirected to the login page shortly. If you are not
          redirected within 5 seconds, <Link to="/signin">click here</Link>
        </p>
      </div>
    </section>
  );
};

export const WelcomePage = withRouter(Welcome);
