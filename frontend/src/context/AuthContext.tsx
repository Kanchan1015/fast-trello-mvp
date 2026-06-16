/* eslint-disable react-refresh/only-export-components */
import React, {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { logoutApi } from "../api/auth";

/* Toggle debug logs during troubleshooting */
const DEBUG_AUTH = false;

/* Types */
type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
} | null;

type AuthContextValue = {
  user: User;
  isAuthenticated: boolean;
  loading: boolean;
  /* expose both names for compatibility */
  signIn: (user: User) => void;
  signOut: (redirect?: boolean) => void;
  login: (user: User) => void;
  logout: (redirect?: boolean) => void;
};

/* Context */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* Provider */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const qc = useQueryClient();
  const [sessionUser, setSessionUser] = useState<User>(null);

  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const resp = await api.get("/api/auth/me");
      return resp.data as User;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const user = sessionUser ?? (query.isSuccess ? query.data : null);

  useEffect(() => {
    const handleLogout = () => {
      setSessionUser(null);
      qc.removeQueries({ queryKey: ["me"] });
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [qc]);

  /* Core set-state helper used by both names */
  const doSignIn = useCallback((u: User) => {
    if (DEBUG_AUTH) console.debug("[auth] signIn", { user: u });
    setSessionUser(u); // context state
    qc.setQueryData(["me"], u); // seed react-query cache (prevents race)
  }, [qc]);

  const doSignOut = useCallback((redirect = false) => {
    if (DEBUG_AUTH) console.debug("[auth] signOut", { redirect });
    logoutApi().catch(() => undefined);
    setSessionUser(null);
    qc.removeQueries({ queryKey: ["me"] });
    if (redirect) window.location.href = "/login";
  }, [qc]);

  /* Expose both names so older code calling signIn/signOut still works */
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading: !sessionUser && query.isLoading,
      signIn: doSignIn,
      signOut: doSignOut,
      login: doSignIn,
      logout: doSignOut,
    }),
    [user, sessionUser, query.isLoading, doSignIn, doSignOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* Hook */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
