import React, { createContext, useState, useCallback, useEffect } from "react";

import { Auth } from "aws-amplify";

const getCurrentAuthUser = async () => {
  return await Auth.currentAuthenticatedUser();
};

export const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    signedIn: false,
    user: null,
    isPending: true,
  });

  const setAuthContext = useCallback(
    (user) => {
      setAuthState((state) => ({
        ...state,
        user,
        signedIn: user ? true : false,
        isPending: false,
      }));
    },
    [setAuthState]
  );

  useEffect(() => {
    getCurrentAuthUser()
      .then((user) => setAuthContext(user))
      .catch((err) => setAuthContext(null));
  }, [setAuthContext]);

  return (
    <>
      {!authState.isPending && (
        <AuthContext.Provider value={{ authState, setAuthState }}>
          {children}
        </AuthContext.Provider>
      )}
    </>
  );
};
