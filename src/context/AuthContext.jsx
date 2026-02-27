import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getStoredToken } from "../services/authService";
import { extractUser, getCurrentUser } from "../services/userService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const refreshSession = useCallback(async () => {
    setIsBootstrapping(true);

    try {
      const storedToken = await getStoredToken();
      setToken(storedToken || null);

      if (!storedToken) {
        setUser(null);
        return;
      }

      try {
        const profilePayload = await getCurrentUser();
        const currentUser = extractUser(profilePayload);
        setUser(currentUser || null);
      } catch (error) {
        if (__DEV__) {
          console.log("Failed to load current user profile:", error);
        }
        setUser(null);
      }
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      isBootstrapping,
      token,
      user,
      role: user?.role || "user",
      isAuthenticated: Boolean(token),
      refreshSession,
    }),
    [isBootstrapping, token, user, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
