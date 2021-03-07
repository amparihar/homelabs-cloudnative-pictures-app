import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SignIn = ({ signInAction, ...props }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    signInAction();
  };
  return (
    <section
      className="section auth"
      style={{ marginTop: "1em", maxWidth: "50%" }}
    >
      <div className="container">
        <h1>Sign In</h1>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <p className="control has-icons-left">
              <input
                className="input"
                type="text"
                id="username"
                aria-describedby="usernameHelp"
                placeholder="Enter username or email"
                autoComplete="off"
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon="user" />
              </span>
            </p>
          </div>
          <div className="field">
            <p className="control has-icons-left">
              <input
                className="input"
                type="password"
                id="password"
                placeholder="Password"
                autoComplete="off"
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon="lock" />
              </span>
            </p>
          </div>
          <div className="field">
            <p className="control">
              <Link to="/forgotpassword">Forgot password?</Link>
            </p>
          </div>
          <div className="field">
            <p className="control">
              <button className="button is-success">Login</button>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignIn;
