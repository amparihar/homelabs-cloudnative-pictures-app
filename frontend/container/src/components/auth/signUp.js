import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SignUp = (props) => {
  return (
    <section className="section auth" style={{maxWidth:"50%"}}>
      <div className="container">
        <h1 className="title">Sign Up</h1>

        <form>
          <div className="field">
            <p className="control has-icons-left">
              <input
                className="input"
                type="text"
                id="username"
                autoComplete="off"
                aria-describedby="userNameHelp"
                placeholder="Enter Username"
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
                type="email"
                id="email"
                autoComplete="off"
                aria-describedby="emailHelp"
                placeholder="Enter email"
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon="envelope" />
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
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon="lock" />
              </span>
            </p>
          </div>
          <div className="field">
            <p className="control has-icons-left">
              <input
                className="input"
                type="password"
                id="confirmpassword"
                placeholder="Confirm password"
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon="lock" />
              </span>
            </p>
          </div>
          <div className="columns">
            <div className="column is-one-fifth">
              <Link to="/signin">Sign In</Link>
            </div>
            <div className="column">
              <Link to="/forgotpassword">Forgot password?</Link>
            </div>
          </div>
          <div className="field">
            <p className="control">
              <button className="button is-success">Sign Up</button>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;
