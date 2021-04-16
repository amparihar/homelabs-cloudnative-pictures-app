import { useContext, useEffect } from "react";
import { Link, Redirect, withRouter } from "react-router-dom";

import { Auth, Hub } from "aws-amplify";

import { AuthContext, useCurrentUserInfo } from "../shared";

const Nav = ({ history }) => {
  const { authState, setAuthState } = useContext(AuthContext);
  const { userInfo } = useCurrentUserInfo();
  const handleSignout = async () => {
    await Auth.signOut();
  };

  useEffect(() => {
    const signOut = () => {
      setAuthState((prev) => ({ ...prev, user: null, signedIn: false }));
      history.push("/signout");
    };
    const hubListener = (data) => {
      switch (data.payload.event) {
        case "tokenRefresh": {
          break;
        }
        case "signOut":
        case "tokenRefresh_failure": {
          signOut();
          break;
        }
        default: {
        }
      }
    };
    const storageListener = (e) => {
      if (
        authState &&
        authState.user &&
        e.key === authState.user.userDataKey &&
        e.oldValue &&
        !e.newValue
      ) {
        signOut();
      }
    };

    Hub.listen("auth", hubListener);
    window.addEventListener("storage", storageListener);

    return () => {
      window.removeEventListener("storage", storageListener);
      Hub.remove("auth", hubListener);
    };
  }, [history, authState, setAuthState]);

  return (
    <>
      {/* {!authState.signedIn && <Redirect to="/signin" />} */}
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

export const Navbar = withRouter(Nav);
