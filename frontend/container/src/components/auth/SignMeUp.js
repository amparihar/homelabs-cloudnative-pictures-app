import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Auth } from "aws-amplify";
import { useForm } from "react-hook-form";

import { ErrorSummary, FormErrors, ApiErrors } from "../../shared";

const SignUp = ({ history }) => {
  const {
    register,
    handleSubmit,
    errors: formErrors = {},
    getValues,
    formState,
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
        pathname: "/verifyaccount",
        state: {
          username: user.username,
        },
      };
      history.push(location);
    } catch (err) {
      setApiErrors((errors) => [err.message || err]);
    }
  };

  return (
    <section className="section auth">
      <div className="x-container">
        <div className="columns">
          <div className="column is-half">
            <ErrorSummary
              errors={apiErrors}
              apiErr={(errors) => <ApiErrors errors={errors} />}
            />
            <ErrorSummary
              errors={formErrors}
              formErr={(errors) => <FormErrors errors={errors} />}
            />
            <h1 className="title">Sign Up</h1>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="field">
                <label className="label">User Name</label>
                <p className="control has-icons-left">
                  <input
                    className={
                      formErrors?.username ? "input is-danger" : "input"
                    }
                    type="text"
                    id="username"
                    name="username"
                    autoComplete="off"
                    aria-describedby="userNameHelp"
                    placeholder="Enter username"
                    ref={register({ required: "Username is required" })}
                  />
                  <span className="icon is-small is-left">
                    <FontAwesomeIcon icon="user" />
                  </span>
                </p>
              </div>
              <div className="field">
                <label className="label">Email</label>
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
                <div className="field is-grouped">
                  <span className="control" style={{ marginTop: "3px" }}>
                    <FontAwesomeIcon icon="info-circle" color="#ff9970" />
                  </span>
                  <p className="control help is-primary">
                    Please enter a valid email. A verification code will be sent
                    to this email address during SignUp
                  </p>
                </div>
              </div>
              <div className="field">
                <label className="label">Password</label>
                <p className="control has-icons-left">
                  <input
                    className={
                      formErrors?.password ? "input is-danger" : "input"
                    }
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
                <label className="label">Confirm Password</label>
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
                        getValues("password") ===
                          getValues("confirmpassword") ||
                        "Password and Confirm Password do not match",
                    })}
                  />
                  <span className="icon is-small is-left">
                    <FontAwesomeIcon icon="lock" />
                  </span>
                </p>
              </div>
              <div className="columns">
                <div className="column">
                  Already have an Account? <Link to="/signin">Sign In</Link>
                </div>
              </div>
              <div className="field">
                <p className="control">
                  <button
                    type="submit"
                    className={
                      formState.isSubmitting
                        ? "button is-info is-loading"
                        : "button is-primary"
                    }
                  >
                    SIGN UP
                  </button>
                </p>
              </div>
            </form>
          </div>
          <div className="column">
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
