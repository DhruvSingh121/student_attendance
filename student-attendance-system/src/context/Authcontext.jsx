import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("att_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) setUser(data.user);
      } catch (_error) {
        localStorage.removeItem("att_token");
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("att_token", data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success("Welcome back to AttendX");
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("att_token");
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
    toast.info("Signed out successfully");
  }, []);

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
