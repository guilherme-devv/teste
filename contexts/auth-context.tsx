import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";

import { trpc } from "@/lib/trpc";
import { User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AUTH_TOKEN_KEY = "@auth_token";
const AUTH_USER_KEY = "@auth_user";

export const [AuthProvider, useAuth] = createContextHook<AuthContextValue>(() => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    loadAuthState();
  }, []);

  useEffect(() => {
    if (token) {
      globalThis.__authToken = token;
    } else {
      globalThis.__authToken = null;
    }
  }, [token]);

  useEffect(() => {
    if (meQuery.data && token) {
      const updatedUser: User = {
        id: meQuery.data.id,
        name: meQuery.data.name,
        email: meQuery.data.email,
        emailVerified: meQuery.data.emailVerified,
        identityStatus: meQuery.data.identityStatus,
        documentUrls: meQuery.data.documentUrls,
        rejectionReason: meQuery.data.rejectionReason,
      };
      setUser(updatedUser);
      AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      setIsLoading(false);
    } else if (meQuery.error && token) {
      logout();
    } else if (!token) {
      setIsLoading(false);
    }
  }, [meQuery.data, meQuery.error, token]);

  const loadAuthState = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(AUTH_USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newUser: User) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken),
        AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser)),
      ]);
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error("Error saving auth state:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(AUTH_USER_KEY),
      ]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error clearing auth state:", error);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    if (token) {
      await meQuery.refetch();
    }
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser,
    refreshUser,
  };
});
