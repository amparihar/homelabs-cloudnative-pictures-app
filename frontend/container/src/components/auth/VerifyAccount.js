import { useState } from "react";
import { useForm } from "react-hook-form";
import { Redirect } from "react-router-dom";
import { Auth } from "aws-amplify";

import { ErrorSummary, ApiErrors, FormErrors } from "../../shared";

const VerifyAccount = ({ history, location, ...props }) => {
  const { state: { username = "" } = {} } = location || {};

  const { register, handleSubmit, errors, formState } = useForm();
  const [apiErrors, setApiErrors] = useState([]);

  const onSubmit = async (data) => {
    const { verificationcode } = data;
    try {
      await Auth.confirmSignUp(username, verificationcode);
      const location = {
        pathname: "/welcome",
        state: {
          username,
        },
      };
      history.push(location);
    } catch (err) {
      setApiErrors((prev) => [err.message || err]);
    }
  };

  return (
    <>
      {!username && <Redirect to="/signup" />}
      <section className="section" style={{ maxWidth: "50%" }}>
        <div className="container">
          <ErrorSummary
            errors={apiErrors}
            apiErr={(errors) => <ApiErrors errors={errors} />}
          />
          <ErrorSummary
            errors={errors}
            formErr={(errors) => <FormErrors errors={errors} />}
          />
          <h1 className="title">Verify Account</h1>
          <p>
            Please fill out the form below with the verification code sent to
            your email address.
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="field">
              <label className="label">Username</label>
              {username}
            </div>
            <div className="field">
              <p className="control">
                <input
                  className="input"
                  type="text"
                  id="verificationcode"
                  name="verificationcode"
                  aria-describedby="verificationcodeHelp"
                  placeholder="Enter Verification Code"
                  autoComplete="off"
                  ref={register({
                    required: {
                      value: true,
                      message: "Verification Code is required",
                    },
                  })}
                />
                {/* {errors?.verificationcode && (
                  <div className="message is-danger">
                    {errors.verificationcode?.message}
                  </div>
                )} */}
              </p>
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
                  Verify Account
                </button>
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default VerifyAccount;
