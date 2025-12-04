import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { getToken, clearToken, setToken } from "../utils/token";

// Types
type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
} | null;

type AuthContextValue = {
  user: User;
  loading: boolean; // true while restoring session
  signIn: (token: string, user: User) => void;
  signOut: () => void;
};

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider:
 * - On mount, checks token via getToken()
 * - If token exists, calls GET /api/auth/me to validate and fetch user
 * - Exposes signIn/signOut helpers and current user
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(null);
  const [restoring, setRestoring] = useState<boolean>(true);

  // Use React Query to call /api/auth/me if token present
  const token = getToken();

  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const resp = await api.get("/api/auth/me");
      return resp.data as User;
    },
    enabled: !!token, // only run if we have a token
    retry: false,
    onSuccess: (u) => {
      setUser(u);
    },
    onError: () => {
      // invalid token or network issue → clear token and user
      clearToken();
      setUser(null);
    },
    // We don't want this query to re-run automatically on focus for auth restore
    refetchOnWindowFocus: false,
  });

  // When query settles (success or error) we stop restoring
  useEffect(() => {
    if (!token) {
      setRestoring(false);
      return;
    }

    if (query.isFetched || query.isError) {
      setRestoring(false);
    }
  }, [token, query.isFetched, query.isError]);

  // signIn helper: save token + set user
  const signIn = (tokenValue: string, u: User) => {
    setToken(tokenValue);
    setUser(u);
  };

  // signOut helper: clear token + user (and optionally redirect handled elsewhere)
  const signOut = () => {
    clearToken();
    setUser(null);
    // Optionally you could navigate to /login here, but keeping this UI-agnostic is fine
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading: restoring || query.isFetching,
      signIn,
      signOut,
    }),
    [user, restoring, query.isFetching]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to consume
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
