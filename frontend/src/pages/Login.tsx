import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginApi } from "../api/auth";
import type { AuthResponse } from "../api/auth";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const { signIn } = useAuth();
  type AuthError = {
    error?: string;
    message?: string;
    details?: Record<string, string>;
  };

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const mutation = useMutation<
    AuthResponse,
    AxiosError<AuthError>,
    { email: string; password: string }
  >({
    mutationFn: (payload) => loginApi(payload),
    onSuccess: (data) => {
      // update app-level auth state to avoid race with AuthProvider
      signIn(data.user);

      // show friendly toast
      try {
        const firstName = data.user?.name?.split?.(" ")[0] ?? "there";
        toast.success(`Welcome back, ${firstName}!`);
      } catch {
        toast.success("Welcome back!");
      }

      // clear UI errors and navigate to intended route if present
      setFieldErrors({});
      setServerError(null);

      const from =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname || "/dashboard";
      navigate(from, { replace: true });
    },
    onError: (err) => {
      const resp = err?.response?.data;
      if (!resp) {
        const msg = "Login failed. Try again.";
        setServerError(msg);
        toast.error(msg);
        return;
      }
      // backend validation shape
      if (resp.error === "validation_failed" && resp.details) {
        setFieldErrors(resp.details);
        setServerError(null);
        // show a generic toast for validation failure
        toast.error("Please check the form and fix highlighted fields.");
        return;
      }
      const msg = resp.message ?? resp.error ?? "Login failed";
      setServerError(msg);
      toast.error(msg);
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
          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            ref={emailRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`field mt-1 block w-full px-3 py-2.5 ${
              fieldErrors.email ? "border-red-500" : ""
            }`}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email && (
            <div
              id="email-error"
              role="alert"
              className="text-xs text-red-600 mt-1"
            >
              {fieldErrors.email}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`field mt-1 block w-full px-3 py-2.5 ${
              fieldErrors.password ? "border-red-500" : ""
            }`}
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={!!fieldErrors.password}
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
          />
          {fieldErrors.password && (
            <div
              id="password-error"
              role="alert"
              className="text-xs text-red-600 mt-1"
            >
              {fieldErrors.password}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className={`w-full py-2.5 text-sm ${
            isLoading
              ? "rounded-lg bg-slate-300 font-semibold text-slate-600"
              : "primary-button"
          }`}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        {(isError || serverError) && (
          <div role="alert" className="text-sm text-red-600 mt-2 text-center">
            {serverError ??
              mutation.error?.response?.data?.message ??
              mutation.error?.response?.data?.error ??
              "Login failed"}
          </div>
        )}

        <div className="text-sm text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-[#5f7f72]">
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
