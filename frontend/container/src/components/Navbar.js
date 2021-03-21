import { useContext } from "react";
import { Link, Redirect } from "react-router-dom";

import { Auth } from "aws-amplify";

import { AuthContext } from "../shared";

export const Navbar = (props) => {
  const { authState, setAuthState } = useContext(AuthContext);
  const handleSignout = async () => {
    try {
      await Auth.signOut();
      setAuthState((state) => ({ ...state, signedIn: false, user: null }));
    } catch (err) {
      console.log("Signout error >>", err.message);
    }
  };
  return (
    <>
      {!authState.signedIn && <Redirect to="/signin" />}
      <nav style={{ width: "100%", display: "table" }}>
        <ul>
          <li style={{ float: "left" }}>
            <Link to="/">Home</Link>
          </li>
          <li style={{ float: "left" }}>
            <Link to="/pictures">Pictures</Link>
          </li>
          <li style={{ float: "left" }}>
            <Link to="/admin">Admin</Link>
          </li>
          <li style={{ float: "right" }}>
            <button
              className="button is-link is-inverted"
              onClick={handleSignout}
            >
              Sign out
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};
