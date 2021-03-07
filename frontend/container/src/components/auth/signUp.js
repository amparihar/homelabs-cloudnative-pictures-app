import React from "react";

const SignUp = (props) => {
  return (
    <>
      <div className="field">
        <label className="label">Username</label>
        <div className="control has-icons-left">
          <input className="input" type="text" placeholder="User Name" />
          <span className="icon is-small is-left">
            <i className="fas fa-user"></i>
          </span>
        </div>
      </div>
      <div className="field">
        <label className="label">Email</label>
        <p className="control has-icons-left">
          <input className="input" type="email" placeholder="Email" />
          <span className="icon is-small is-left">
            <i className="fas fa-envelope"></i>
          </span>
        </p>
      </div>
      <div className="field">
      <label className="label">Password</label>
        <p className="control has-icons-left">
          <input className="input" type="password" placeholder="Password" />
          <span className="icon is-small is-left">
            <i className="fas fa-lock"></i>
          </span>
        </p>
      </div>
      <div className="field">
        <label className="label">Confirm Password</label>
        <p className="control has-icons-left">
          <input
            className="input"
            type="password"
            placeholder="Confirm Password"
          />
          <span className="icon is-small is-left">
            <i className="fas fa-lock"></i>
          </span>
        </p>
      </div>
      <div className="field">
        <p className="control">
          <button className="button is-success">SignUp</button>
        </p>
      </div>
    </>
  );
};

export default SignUp;
