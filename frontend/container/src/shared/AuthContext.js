import React, { createContext, useState } from "react";

export const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    signedIn: false,
    user: null,
  });
  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};
