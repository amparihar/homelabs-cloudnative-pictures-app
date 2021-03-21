import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Auth } from "aws-amplify";
import { useForm } from "react-hook-form";

import { ErrorSummary, FormErrors, ApiErrors } from "../../shared";

const SignUp = ({ history, ...props }) => {
  const {
    register,
    handleSubmit,
    errors: formErrors = {},
    getValues,
  } = useForm();

  const [apiErrors, setApiErrors] = useState([]);

  const onSubmit = async (data) => {
    const { username, password, email } = data || {};
    try {
      const { user } = await Auth.signUp({
        username,
        password,
        attributes: { email },
      });
      const location = {
        pathname: "/welcome",
        state: {
          username: user.username,
        },
      };
      history.push(location);
    } catch (err) {
      setApiErrors((errors) => [err.message]);
    }
  };

  return (
    <section className="section auth box" style={{ maxWidth: "50%" }}>
      <div className="container">
        <ErrorSummary
          errors={apiErrors}
          apiErr={(errors) => <ApiErrors errors={errors} />}
        />
        <ErrorSummary
          errors={formErrors}
          formErr={(errors) => <FormErrors errors={errors} />}
        />
        <h1 className="title">Sign Up</h1>

        <form onSubmit={handleSubmit(onSubmit)} >
          <div className="field">
            <p className="control has-icons-left">
              <input
                className={formErrors?.username ? "input is-danger" : "input"}
                type="text"
                id="username"
                name="username"
                autoComplete="off"
                aria-describedby="userNameHelp"
                placeholder="Enter Username"
                ref={register({ required: "Username is required" })}
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon="user" />
              </span>
            </p>
          </div>
          <div className="field">
            <p className="control has-icons-left">
              <input
                className={formErrors?.email ? "input is-danger" : "input"}
                type="text"
                id="email"
                name="email"
                autoComplete="off"
                aria-describedby="emailHelp"
                placeholder="Enter email"
                ref={register({
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                    message: "Invalid email address",
                  },
                })}
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon="envelope" />
              </span>
            </p>
          </div>
          <div className="field">
            <p className="control has-icons-left">
              <input
                className={formErrors?.password ? "input is-danger" : "input"}
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                ref={register({
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must have at least 8 characters",
                  },
                })}
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon="lock" />
              </span>
            </p>
          </div>
          <div className="field">
            <p className="control has-icons-left">
              <input
                className={
                  formErrors?.confirmpassword ? "input is-danger" : "input"
                }
                type="password"
                id="confirmpassword"
                name="confirmpassword"
                placeholder="Confirm password"
                ref={register({
                  required: {
                    value: true,
                    message: "Confirm Password is required",
                  },
                  validate: () =>
                    getValues("password") === getValues("confirmpassword") ||
                    "Password and Confirm Password do not match",
                })}
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
            {/* <div className="column">
              Forgot your Password?
              <Link to="/forgotpassword">Reset password</Link>
            </div> */}
          </div>
          <div className="field">
            <p className="control">
              <button type="submit" className="button is-success">
                SIGN UP
              </button>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;
