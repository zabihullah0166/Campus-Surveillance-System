import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("cs_token") || "");
  const [role, setRole] = useState(localStorage.getItem("cs_role") || "");
  const [name, setName] = useState(localStorage.getItem("cs_name") || "");

  async function login(payload) {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("cs_token", data.access_token);
    localStorage.setItem("cs_role", data.role);
    localStorage.setItem("cs_name", data.full_name || payload.username || payload.roll_no || "User");
    setToken(data.access_token);
    setRole(data.role);
    setName(data.full_name || payload.username || payload.roll_no || "User");
    return data;
  }

  function logout() {
    localStorage.removeItem("cs_token");
    localStorage.removeItem("cs_role");
    localStorage.removeItem("cs_name");
    setToken("");
    setRole("");
    setName("");
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      login,
      logout,
      name,
      role,
      token
    }),
    [name, role, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
