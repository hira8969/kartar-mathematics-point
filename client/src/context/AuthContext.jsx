import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { storage } from "../utils/storage";
import { dashboardPathByRole } from "../utils/roleConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!storage.getToken()) {
        setLoading(false);
        return;
      }

      try {
        const me = await authService.me();
        setUser(me);
      } catch (_error) {
        storage.clearToken();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (payload) => {
    const data = await authService.login(payload);
    storage.setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    storage.setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    storage.clearToken();
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await authService.me();
    setUser(me);
    return me;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
      getHomePath: () => (user ? dashboardPathByRole[user.role] : "/login")
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
