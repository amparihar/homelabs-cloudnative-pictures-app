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
          <div className="navbar-start" style={{ marginLeft: "100px" }}>
            <Link className="navbar-item" to="/home">
              Home
            </Link>
            <Link className="navbar-item" to="/gallery">
              Gallery
            </Link>
            <Link className="navbar-item" to="/picture">
              Pictures
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
                  {userInfo.id}
                </a>

                <div className="navbar-dropdown">
                  <a
                    href="/"
                    className="navbar-item"
                    onClick={(e) => e.preventDefault()}
                  >
                    Username - {userInfo.username}
                  </a>
                  <a
                    href="/"
                    className="navbar-item"
                    onClick={(e) => e.preventDefault()}
                  >
                    Email - {userInfo.attributes.email}
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
