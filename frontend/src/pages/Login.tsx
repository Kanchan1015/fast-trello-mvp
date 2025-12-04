import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../api/auth";
import type { AuthResponse } from "../api/auth";
import { AuthLayout } from "../components/AuthLayout";
import { setToken } from "../utils/token";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const { signIn } = useAuth();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const mutation = useMutation<
    AuthResponse,
    any,
    { email: string; password: string }
  >({
    mutationFn: (payload) => loginApi(payload),
    onSuccess: (data) => {
      // persist token for axios interceptor
      setToken(data.token);
      // update app-level auth state to avoid race with AuthProvider
      signIn(data.token, data.user);
      // clear UI errors and navigate
      setFieldErrors({});
      setServerError(null);
      navigate("/dashboard");
    },
    onError: (err: any) => {
      const resp = err?.response?.data;
      if (!resp) {
        setServerError("Login failed. Try again.");
        return;
      }
      // backend validation shape
      if (resp.error === "validation_failed" && resp.details) {
        setFieldErrors(resp.details);
        setServerError(null);
        return;
      }
      setServerError(resp.message ?? resp.error ?? "Login failed");
    },
  });

  // v5-safe flags
  const isLoading = mutation.isPending;
  const isError = mutation.isError;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    mutation.mutate({ email, password });
  };

  return (
    <AuthLayout title="Log in">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            ref={emailRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 block w-full border rounded p-2 ${
              fieldErrors.email ? "border-red-500" : ""
            }`}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {fieldErrors.email && (
            <div className="text-xs text-red-600 mt-1">{fieldErrors.email}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1 block w-full border rounded p-2 ${
              fieldErrors.password ? "border-red-500" : ""
            }`}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {fieldErrors.password && (
            <div className="text-xs text-red-600 mt-1">
              {fieldErrors.password}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 rounded text-white ${
            isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        {(isError || serverError) && (
          <div className="text-sm text-red-600 mt-2 text-center">
            {serverError ??
              (mutation.error as any)?.response?.data?.message ??
              (mutation.error as any)?.response?.data?.error ??
              "Login failed"}
          </div>
        )}

        <div className="text-sm text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600">
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
