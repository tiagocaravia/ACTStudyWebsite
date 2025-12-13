// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

interface User {
  id: number;
  email: string;
  full_name?: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    full_name?: string,
    username?: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        setToken(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token, API_URL]);

  const login = async (username: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      const accessToken = res.data.access_token;
      setToken(accessToken);
      localStorage.setItem("token", accessToken);
      
      // Fetch the full user data with the new token
      const userRes = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser(userRes.data.user);
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Login failed");
    }
  };

  const register = async (
    email: string,
    password: string,
    full_name?: string,
    username?: string
  ) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        full_name: full_name || "",
        username: username || "",
      });
      const accessToken = res.data.access_token;
      setToken(accessToken);
      localStorage.setItem("token", accessToken);
      
      // Fetch the full user data with the new token
      const userRes = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser(userRes.data.user);
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Registration failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
