import React, { useContext } from "react";
import { Link, Redirect } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AuthContext } from "../../shared";

const SignIn = ({ location, ...props }) => {
  const { auth, setAuth } = useContext(AuthContext);
  const { state: { referrer = "/home1" } = {} } = location;

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <>
      {auth.verified && <Redirect to={referrer} />}
      <section className="section auth" style={{ maxWidth: "50%" }}>
        <div className="container">
          <h1 className="title">Sign In</h1>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <p className="control has-icons-left">
                <input
                  className="input"
                  type="text"
                  id="username"
                  name="username"
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
                  name="password"
                  placeholder="Password"
                  autoComplete="off"
                />
                <span className="icon is-small is-left">
                  <FontAwesomeIcon icon="lock" />
                </span>
              </p>
            </div>
            <div className="columns">
              <div className="column is-one-fifth">
                <Link to="/signup">Sign Up</Link>
              </div>
              <div className="column">
                <Link to="/forgotpassword">Forgot password?</Link>
              </div>
            </div>
            <div className="field">
              <p className="control">
                <button className="button is-success">Sign In</button>
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default SignIn;
