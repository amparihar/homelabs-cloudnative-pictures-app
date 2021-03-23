import { useContext } from "react";
import { Link, Redirect } from "react-router-dom";

import { Auth } from "aws-amplify";
import { useToasts } from "react-toast-notifications";

import { AuthContext, useCurrentUserInfo } from "../shared";

export const Navbar = (props) => {
  const { authState, setAuthState } = useContext(AuthContext);
  const { userInfo } = useCurrentUserInfo();
  const { addToast } = useToasts();
  const handleSignout = async () => {
    try {
      await Auth.signOut();
      setAuthState((state) => ({ ...state, signedIn: false, user: null }));
    } catch (err) {
      addToast(err.message || err, { appearance: "error" });
    }
  };
  return (
    <>
      {!authState.signedIn && <Redirect to="/signin" />}
      <nav className="navbar is-dark">
        <div className="navbar-menu">
          <div className="navbar-start">
            <Link className="navbar-item" to="/home">
              Home
            </Link>
            <Link className="navbar-item" to="/pictures">
              Pictures
            </Link>
            <Link className="navbar-item" to="/admin">
              Admin
            </Link>
          </div>

          <div className="navbar-end">
            {userInfo && (
              <div className="navbar-item has-dropdown is-hoverable">
                <a
                  href="/"
                  className="navbar-link"
                  onClick={(e) => e.preventDefault()}
                >
                  {userInfo.username}
                </a>
                <div className="navbar-dropdown">
                  <a
                    href="/"
                    className="navbar-item"
                    onClick={(e) => e.preventDefault()}
                  >
                    {userInfo.email}
                  </a>
                </div>
                <div className="navbar-dropdown">
                  <a
                    href="/"
                    className="navbar-item"
                    onClick={(e) => e.preventDefault()}
                  >
                    {userInfo.cognitoID}
                  </a>
                </div>
              </div>
            )}

            <div className="navbar-item">
              <div className="field is-grouped">
                <p className="control">
                  <button
                    className="button is-primary is-inverted"
                    onClick={handleSignout}
                  >
                    Sign out
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
