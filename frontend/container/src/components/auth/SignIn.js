import { useContext, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useForm } from "react-hook-form";
import { Auth } from "aws-amplify";
import { AuthContext } from "../../shared";
import { ErrorSummary, ApiErrors, FormErrors } from "../../shared";
import "../../styles/auth-style.css";

const SignIn = ({ location }) => {
  const {
    register,
    handleSubmit,
    errors: formErrors = {},
    formState,
  } = useForm();
  const { authState, setAuthState } = useContext(AuthContext);
  const [apiErrors, setApiErrors] = useState([]);

  const { state: { referrer = "/home" } = {} } = location;

  const onSignIn = async (data) => {
    const { username, password } = data;
    try {
      const user = await Auth.signIn(username, password);
      setAuthState((state) => ({
        ...state,
        signedIn: user ? true : false,
        user,
      }));
      return user;
    } catch (err) {
      setApiErrors((errors) => [err.message]);
    }
  };
  return (
    <>
      {authState.signedIn && <Redirect to={referrer} />}
      <section className="section auth" style={{ maxWidth: "50%" }}>
        <div className="container">
          <ErrorSummary
            errors={apiErrors}
            apiErr={(errors) => <ApiErrors errors={errors} />}
          />
          <ErrorSummary
            errors={formErrors}
            formErr={(errors) => <FormErrors errors={errors} />}
          />
          <h1 className="title">Sign In</h1>

          <form onSubmit={handleSubmit(onSignIn)}>
            <div className="field">
              <label className="label">User Name</label>
              <p className="control has-icons-left">
                <input
                  className={`input ${formErrors?.username ? "is-danger" : ""}`}
                  type="text"
                  id="username"
                  name="username"
                  aria-describedby="usernameHelp"
                  placeholder="Enter username or email"
                  autoComplete="off"
                  ref={register({ required: "Username is required" })}
                />
                <span className="icon is-small is-left">
                  <FontAwesomeIcon icon="user" />
                </span>
              </p>
            </div>
            <div className="field">
              <label className="label">Password</label>
              <p className="control has-icons-left">
                <input
                  className={`input ${formErrors?.password ? "is-danger" : ""}`}
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  autoComplete="off"
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
            <div className="columns">
              <div className="column">
                No Account? <Link to="/signup">Create Account</Link>
              </div>
            </div>
            <div className="field">
              <p className="control">
                <button
                  className={
                    formState.isSubmitting
                      ? "button is-info is-loading"
                      : "button is-primary"
                  }
                  type="submit"
                >
                  SIGN IN
                </button>
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default SignIn;
