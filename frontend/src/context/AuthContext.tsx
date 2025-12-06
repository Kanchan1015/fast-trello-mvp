import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { getToken, clearToken, setToken } from "../utils/token";

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
  signIn: (token: string, user: User) => void;
  signOut: (redirect?: boolean) => void;
  login: (token: string, user: User) => void;
  logout: (redirect?: boolean) => void;
};

/* Context */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* Provider */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const qc = useQueryClient();
  const [user, setUser] = useState<User>(null);
  const [restoring, setRestoring] = useState<boolean>(true);

  const token = getToken();

  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const resp = await api.get("/api/auth/me");
      return resp.data as User;
    },
    enabled: !!token,
    retry: false,
    onSuccess: (u) => {
      if (DEBUG_AUTH) console.debug("[auth] /me success", u);
      setUser(u);
      qc.setQueryData(["me"], u);
    },
    onError: (err) => {
      if (DEBUG_AUTH) console.debug("[auth] /me error", err);
      clearToken();
      setUser(null);
      qc.removeQueries(["me"]);
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!token) {
      setRestoring(false);
      return;
    }
    if (query.isFetched || query.isError) {
      setRestoring(false);
    }
  }, [token, query.isFetched, query.isError]);

  /* Core set-state helper used by both names */
  const doSignIn = (tokenValue: string, u: User) => {
    if (DEBUG_AUTH) console.debug("[auth] signIn", { tokenValue, user: u });
    setToken(tokenValue); // persistent storage
    setUser(u); // context state
    qc.setQueryData(["me"], u); // seed react-query cache (prevents race)
  };

  const doSignOut = (redirect = false) => {
    if (DEBUG_AUTH) console.debug("[auth] signOut", { redirect });
    clearToken();
    setUser(null);
    qc.removeQueries(["me"]);
    if (redirect) window.location.href = "/login";
  };

  /* Expose both names so older code calling signIn/signOut still works */
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading: restoring || query.isFetching,
      signIn: doSignIn,
      signOut: doSignOut,
      login: doSignIn,
      logout: doSignOut,
    }),
    [user, restoring, query.isFetching]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* Hook */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
