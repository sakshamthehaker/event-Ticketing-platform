import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { loginRequest, logoutRequest, registerRequest } from "../services/authService";
import { getMyProfileRequest } from "../services/userService";

export const AuthContext = createContext(null);

const USER_STORAGE_KEY = "eventhive_user";

export function AuthProvider({ children }) {
  const savedUser = localStorage.getItem(USER_STORAGE_KEY);
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMyProfileRequest();
        setUser(response.data.data);
      } catch (error) {
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const login = async (payload) => {
    const response = await loginRequest(payload);
    setUser(response.data.data.user);
    toast.success("Welcome back");
  };

  const register = async (payload) => {
    const response = await registerRequest(payload);
    setUser(response.data.data.user);
    toast.success("Account created");
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}



