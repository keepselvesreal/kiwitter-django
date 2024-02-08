import React, { createContext, useContext } from "react";
import { useAuthService } from "./AuthServices";

const AuthServiceContext = createContext(null);

export function AuthServiceProvider(props) {
  const authServices = useAuthService();
  return (
    <AuthServiceContext.Provider value={authServices}>
      {props.children}
    </AuthServiceContext.Provider>
  );
}

export function useAuthServiceContext() {
  const context = useContext(AuthServiceContext);

  if (context === null) {
    throw new Error("Error - You have to use the AuthServiceProvider");
  }
  return context;
}

export default AuthServiceProvider;
